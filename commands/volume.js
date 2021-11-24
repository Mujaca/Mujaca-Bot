const client = require('../util/client');
const embedCreator = require('../util/embedBuilder');
const { servers } = require('../util/storageHelper');

module.exports = {
  command: "volume",
  description: "Set the Volume of the currently played Song",
  args: [{"type":"number","name":"volume","description":"A Number between 0 - 100","required":true}],
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

    player.setVolume(interaction.options.getNumber("volume") / 100)
    servers.set(interaction.guild.id, storage)
    interaction.reply({ embeds: [embed] });
  }
}