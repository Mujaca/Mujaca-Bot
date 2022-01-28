const client = require('../util/client');
const embedCreator = require('../util/embedBuilder');
const { servers } = require('../util/storageHelper');

module.exports = {
  command: "skip",
  description: "Skip the current Song",
  args: [],
  callback: async (interaction) => {
    var storage = servers.get(interaction.guild.id);
    if(!storage) {
        storage = {}
    }

    var embed = embedCreator.createEmbed("",`Debug Message; something more usefull will come soon`,"magenta");

    player = storage.MusicPlayer;
    if(!player) {
        interaction.reply({ embeds: [embedCreator.createEmbed("",`The Bot is currently not connected!`,"red")] });
        return;
    }

    player.skip();
    servers.set(interaction.guild.id, storage)
    
    interaction.reply({ embeds: [embed] });
  }
}