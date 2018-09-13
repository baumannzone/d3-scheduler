module.exports = {
  nodemailer: {
    user: process.env.MAILER_USER,
    pass: process.env.MAILER_PASS,
    toEmails: 'buscarefugioapp@gmail.com',
  },
  firebaseAdmin: {
    type: process.env.D3_type,
    project_id: process.env.D3_project_id,
    private_key_id: process.env.D3_private_key_id,
    private_key: process.env.D3_private_key,
    client_email: process.env.D3_client_email,
    client_id: process.env.D3_client_id,
    auth_uri: process.env.D3_auth_uri,
    token_uri: process.env.D3_token_uri,
    auth_provider_x509_cert_url: process.env.D3_auth_provider_x509_cert_url,
    client_x509_cert_url: process.env.D3_client_x509_cert_url,
  },
  battleNet: {
    baseUrl: 'https://eu.api.battle.net/d3/',
    apiKey: process.env.BN_apiKey,
    locale: 'es_ES',
    milliseconds: 5000,
  },
};
