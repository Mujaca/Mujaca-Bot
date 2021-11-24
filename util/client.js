const Discord = require('discord.js');
const myIntents = new Discord.Intents();
myIntents.add(Discord.Intents.FLAGS.GUILDS, Discord.Intents.FLAGS.GUILD_VOICE_STATES);

module.exports = new Discord.Client({ intents: myIntents });