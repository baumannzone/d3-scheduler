'use strict';
const schedule = require( 'node-schedule' );
const admin = require( 'firebase-admin' );
const moment = require( 'moment' );
const emoji = require( 'node-emoji' );
const axios = require( 'axios' );
const nodemailer = require( 'nodemailer' );

const PROMISESGROUP = 50;

// Main config file
const config = require( './config.js' );

const D3settings = config.battleNet;

// Firebase
const firebaseSettings = config.firebaseAdmin;

// Init firebase app
admin.initializeApp( {
  credential: admin.credential.cert( firebaseSettings ),
} );

const transporter = nodemailer.createTransport( {
  service: 'gmail',
  auth: {
    user: config.nodemailer.user,
    pass: config.nodemailer.pass,
  },
} );

// Database
const db = admin.firestore();

/* Get list of battle-tags from FireStore DB */
function getBattleTags() {
  return db.collection( 'battle-tags' ).get();
}

// Save user data from battleNet in database
function saveDataInFireStore( id, data ) {
  db.collection( 'users-data' ).doc( id ).update( { bnetData: data } );
}

// Set last time updated
function setLastTimeUpdated() {
  const data = {
    date: new Date(),
  };
  console.debug( data );
  return db.collection( 'last-update' ).doc( 'users-data' ).set( data );
}

// Get data from battle-net /D3/PROFILE/{ACCOUNT}
function getUserDataFromBattleNet( battleTag ) {
  // Example: https://eu.api.battle.net/d3/profile/SuperRambo-2613/?locale=en_ES&apikey=tsadnp9har8cuaactkg37t4w56apkvbc
  const baseUrl = D3settings.baseUrl;
  const resource = 'profile';
  const params = {
    locale: D3settings.locale,
    apikey: D3settings.apiKey,
  };

  return axios.get( `${baseUrl}${resource}/${battleTag}/`, { params } );
}

function _groupArrayBySize( arr, size ) {
  const groups = [];
  for ( let i = 0; i < arr.length; i += size ) {
    groups.push( arr.slice( i, i + size ) );
  }
  return groups;

}

function _sleep( ms ) {
  console.debug( 'Sleeping...', ms );
  return new Promise( resolve => setTimeout( resolve, ms ) );
}

function _sendEmail() {
  return new Promise( ( resolve, reject ) => {
    const randomEmoji = emoji.random();
    let html = `<h3>Datos actualizados ${randomEmoji.emoji}</h3>`;
    html += `<p>La base de datos se ha actualizado correctamente a las ${moment().format( 'HH:mm' )} horas</p>`;
    const mailOptions = {
      from: config.nodemailer.user,
      to: config.nodemailer.toEmails,
      subject: 'Datos actualizados en Firestore',
      html,
    };
    return transporter.sendMail( mailOptions, function ( err, info ) {
      if ( err ) {
        console.log( ' ## El email no se ha enviado: ## ' );
        reject( err );
      }
      console.log( ' == Mensaje enviado correctamente: == ' );
      resolve( info );
    } );
  } );
}

async function updateAllDatabase() {
  try {
    console.debug( '=== >>> Empezamos' );
    console.debug( '=== >>>' );
    // Get battle tags from Database
    const promises = [];
    const battleTags = await getBattleTags();
    // If there is content
    if ( battleTags.size > 0 ) {
      battleTags.forEach( ( doc ) => {
        promises.push( getUserDataFromBattleNet( doc.id ) );
      } );
      // Group promises
      const grouped = _groupArrayBySize( promises, PROMISESGROUP );
      const groupedData = [];
      // Execute each group of promises and wait 2secs to go next group of promises
      for ( const group of grouped ) {
        const data = await Promise.all( group );
        groupedData.push( data );
        await _sleep( config.battleNet.milliseconds );
      }
      const merged = groupedData.reduce( ( acc, val ) => acc.concat( val ), [] );
      const mergedUserData = merged.map( item => item.data );
      let promises2 = [];
      mergedUserData.map( ( user ) => {
        promises2.push( saveDataInFireStore( user.battleTag, user ) );
      } );
      const savedData = await Promise.all( promises2 );
      await setLastTimeUpdated( savedData );
      const emailInfo = await _sendEmail();
      console.debug( 'emailInfo: ', emailInfo.messageId );
    }
    console.debug( '=== >>>' );
    console.debug( '=== >>> Terminamos' );
  }
  catch ( e ) {
    console.debug( e );
  }
}

exports.demoCron = () => {
  // Cron running every hour every 30 min --˅
  const cronJob = schedule.scheduleJob( '*/30 * * * *', () => {
    updateAllDatabase();
    console.debug( 'Next cron job: ', cronJob.nextInvocation() );
  } );
  console.debug( '(1st) Next Cron Job: ', cronJob.nextInvocation() );
};