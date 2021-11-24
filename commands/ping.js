const client = require('../util/client');
const embedCreator = require('../util/embedBuilder');
module.exports = {
  command: "ping",
  description: "check if the bot is online",
  args: [],
  callback: (interaction) => {
    var embed = embedCreator.createEmbed("",`Pong\n\`\`\`css\nWebsocket-Ping: ${client.ws.ping}ms\n\`\`\``,"magenta");

    interaction.reply({ embeds: [embed] });
  }
}