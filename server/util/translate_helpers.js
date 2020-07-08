const {Translate} = require('@google-cloud/translate').v2;
const GOOGLE_APPLICATION_CREDENTIALS = require('../messenger_international_53d664c994ab.json');

const {project_id} = GOOGLE_APPLICATION_CREDENTIALS;
const keyFilename = '../server/messenger_international_53d664c994ab.json';

const translate = new Translate({projectId: project_id, keyFilename});

async function getTranslation(text, target) {
  return await translate.translate(text, target);
}

module.exports = {getTranslation};