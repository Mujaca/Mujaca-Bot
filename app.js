const client = require('./util/client');
const logger = require('./util/logger');
require('dotenv').config()


client.on('ready',() => {
  logger.log(`started`.green);

  client.user.setActivity("endlich mit neuen funktionen!", {
    type: "PLAYING"
  });

  require('./util/commandHandler');
});



client.login(process.env.TOKEN)