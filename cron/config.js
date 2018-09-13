module.exports = {
  nodemailer: {
    user: proccess.env.MAILER_USER,
    pass: proccess.env.MAILER_PASS,
    toEmails: 'buscarefugioapp@gmail.com',
  },
  firebaseAdmin: {
    type: proccess.env.D3_type,
    project_id: proccess.env.D3_project_id,
    private_key_id: proccess.env.D3_private_key_id,
    private_key: proccess.env.D3_private_key,
    client_email: proccess.env.D3_client_email,
    client_id: proccess.env.D3_client_id,
    auth_uri: proccess.env.D3_auth_uri,
    token_uri: proccess.env.D3_token_uri,
    auth_provider_x509_cert_url: proccess.env.D3_auth_provider_x509_cert_url,
    client_x509_cert_url: proccess.env.D3_client_x509_cert_url,
  },
  battleNet: {
    baseUrl: 'https://eu.api.battle.net/d3/',
    apiKey: proccess.env.BN_apiKey,
    locale: 'es_ES',
    milliseconds: 5000,
  },
};
