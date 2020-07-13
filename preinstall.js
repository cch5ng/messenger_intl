const fs = require(‘fs’);
fs.writeFile(‘./server/translation-credentials.json’, process.env.GOOGLE_TRANSLATION_CONFIG, (err) => {});