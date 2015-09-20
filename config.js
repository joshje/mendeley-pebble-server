var config;
if (process.env.APPID) {
  config = {
    appId: process.env.APPID,
    appSecret: process.env.APPSECRET,
    redirectUri: process.env.REDIRECTURI,
    session: {
      keys: [process.env.SESSIONKEYS1, process.env.SESSIONKEY2]
    }
  };
} else {
  config = require('./config.local');
}

module.exports = config;
