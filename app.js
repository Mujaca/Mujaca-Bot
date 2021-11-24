const client = require('./util/client');
const logger = require('./util/logger');
require('dotenv').config()


client.on('ready',() => {
  logger.log(`started`.green);
  require('./util/commandHandler');
});



client.login(process.env.TOKEN)