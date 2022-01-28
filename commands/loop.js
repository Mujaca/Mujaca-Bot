const client = require('../util/client');
const embedCreator = require('../util/embedBuilder');
const { servers } = require('../util/storageHelper');

module.exports = {
  command: "loop",
  description: "Loop the current song",
  args: [],
  callback: async (interaction) => {
    var storage = servers.get(interaction.guild.id);
    if(!storage) {
        storage = {}
    }

    player = storage.MusicPlayer;
    if(!player) {
        interaction.reply({ embeds: [embedCreator.createEmbed("",`The Bot is currently not connected!`,"red")] });
        return;
    }

    player.singleLoop();
    servers.set(interaction.guild.id, storage)
    
    var embed = embedCreator.createEmbed("",`${player.singlelooping ? 'The song will be looped!' : 'The song will no longer be looped!'}`,"magenta");
    interaction.reply({ embeds: [embed] });
  }
}