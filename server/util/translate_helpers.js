const {Translate} = require('@google-cloud/translate').v2;
const GOOGLE_APPLICATION_CREDENTIALS = require('../translation-credentials.json');

const {project_id} = GOOGLE_APPLICATION_CREDENTIALS;
let keyFilename;
if (process.env.NODE_ENV === 'production') {
  keyFilename = '../translation-credentials.json';
} else if (process.env.NODE_ENV === 'development') {
  keyFilename = '../server/translation-credentials.json';
}

const translate = new Translate({projectId: project_id, keyFilename});

async function getTranslation(text, target) {
  return await translate.translate(text, target);
}

module.exports = {getTranslation};