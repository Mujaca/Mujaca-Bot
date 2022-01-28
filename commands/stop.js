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

    var embed = embedCreator.createEmbed("",`Disconnecting ...`,"red");

    player = storage.MusicPlayer;
    if(!player) {
      interaction.reply({ embeds: [embedCreator.createEmbed("",`The Bot is currently not connected!`,"red")] });
      return;
  }

    player.stop();
    delete storage.MusicPlayer;
    servers.set(interaction.guild.id, storage)
    
    interaction.reply({ embeds: [embed] });
  }
}