const client = require('../util/client');
const embedCreator = require('../util/embedBuilder');
const { servers } = require('../util/storageHelper');

module.exports = {
  command: "stop",
  description: "Ein weiser Mann schrieb mal: 'STOP THE COUNT'. Also warum machen wir nicht: 'STOP THE MUSIC!'",
  args: [],
  callback: async (interaction) => {
    var storage = servers.get(interaction.guild.id);
    if(!storage) {
        storage = {}
    }

    var embed = embedCreator.createEmbed("",`Debug Message; something more usefull will come soon`,"magenta");

    player = storage.MusicPlayer;
    if(!player) {
        return;
    }

    player.stop();
    delete storage.MusicPlayer;
    servers.set(interaction.guild.id, storage)
    
    interaction.reply({ embeds: [embed] });
  }
}