const fetch = require('node-fetch');
const date = require('date-and-time');
const prompts = require('prompts');
const os = require('os');
const path = require('path');
const { checkout } = require('./checkout');

const package = require('./package.json');

const isLocal = typeof process.pkg === 'undefined'
const basePath = isLocal ? process.cwd() : path.dirname(process.execPath);

async function setup() {
  const key = await prompts([{ type: 'text', name: 'key', message: 'Zenith Key' }]);

  const res = await (await fetch('https://zenithapp.co/auth', { 
    method: 'POST',
    headers: {
      "key": key.key,
      "system": os.hostname(),
      "password":"7Ke^FHrQ4$jBc@9Z6Bw#",
      "version": package.version
    }
  }));

  if (res.status === 200) {
    console.log('> Successfully Authenticated\n');

    const questions = [
      {
        type: 'text',
        name: 'url',
        message: 'Product URL'
      }
    ];
    
    const response = await prompts(questions);

    if (response && response.url) {

      let profiles;

      try {
        profiles = require(`${basePath}/aycd.json`);
      } catch (err) {
        return console.log(`[${date.format(new Date(), 'hh:mm:ss')}] Error Fetching Profiles: ${basePath}/aycd.json\n\n${err}`);
      }
      
      console.log(`[${date.format(new Date(), 'hh:mm:ss')}] Launching ${profiles.length} Tasks`);

      if (profiles.length > 10) {
        console.log(`[${date.format(new Date(), 'hh:mm:ss')}] Task Limit 10 Exceeded... Launching First 10 Tasks`);
        profiles.length = 10;
      }

      if (profiles.length && !isNaN(profiles.length) && profiles.length > 0) {
        for (let i = 0; i < profiles.length; i++) {
          checkout(response.url, i);
        }
      } else {
        console.log(`[${date.format(new Date(), 'hh:mm:ss')}] Error Launching Tasks`);
      }

    } else {
      console.log(`[${date.format(new Date(), 'hh:mm:ss')}] Error Parsing Submissions`);
    }
  } else if (res.status === 401) {
    return console.log('> Access Denied\n'), process.exit();
  } else if (res.status === 500) {
    return console.log('> Error Authenticating\n'), process.exit();
  } else {
    return console.log('> Error\n'), process.exit();
  }
}

setup();