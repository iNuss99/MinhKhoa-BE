const dns = require('dns');
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {
  console.warn('Custom DNS setServers ignored:', e.message);
}

const mongoose = require('mongoose');
const MyConstants = require('./MyConstants');
const uri = 'mongodb+srv://' + MyConstants.DB_USER + ':' + MyConstants.DB_PASS + '@' +
  MyConstants.DB_SERVER + '/' + MyConstants.DB_DATABASE + '?retryWrites=true&w=majority';

mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 })
  .then(() => { 
    console.log('[MongoDB] Successfully connected to ' + MyConstants.DB_SERVER + '/' + MyConstants.DB_DATABASE); 
  })
  .catch((err) => { 
    console.error('[MongoDB Error] Could not connect to Atlas:', err.message); 
    console.error('[MongoDB Diagnostic] Please verify that your IP address is whitelisted (0.0.0.0/0) in MongoDB Atlas Security -> Network Access.');
  });
