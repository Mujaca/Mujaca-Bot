const client = require('../util/client');
const embedCreator = require('../util/embedBuilder');
const { joinVoiceChannel, VoiceConnectionStatus, createAudioPlayer, createAudioResource } = require('@discordjs/voice');
const ytdl = require('ytdl-core');
const fs = require('fs')
const {MusicPlayer, getVideoTitle} = require('../functions/musicPlayer')
const { servers } = require('../util/storageHelper');

module.exports = {
  command: "play",
  description: "plays a YT or mp3/4 link in your Discord voice Channel",
  args: [{"type":"string","name":"link","description":"The URL you want to play","required":true}],
  callback: async (interaction) => {
    var storage = servers.get(interaction.guild.id);
    if(!storage) {
        storage = {}
    }

    var channels = interaction.guild.channels.cache.filter(c => c.isVoice());
    for (const [channelID, channel] of channels) {
        for (const [memberID, member] of channel.members) {
            if(interaction.user.id == memberID) {
                player = storage.MusicPlayer;
                if(!player) {
                    var connection = joinVoiceChannel({
                        channelId: channelID,
                        guildId: interaction.guild.id,
                        adapterCreator: interaction.guild.voiceAdapterCreator
                    })
                    player = new MusicPlayer(connection)
                    storage.MusicPlayer = player;
                }

                var ID = interaction.options.getString("link").replace("https://www.youtube.com/watch?v=", "")
                var embed = embedCreator.createEmbed("",`${player.current == null ? 'Now playing: ' : 'Added to queue: '} a playlist`,"green");
                if(ID.includes('www.youtube.com')) {
                    var title = await getVideoTitle(ID);
                    embed = embedCreator.createEmbed("",`${player.current == null ? 'Now playing: ' : 'Added to queue: '} ${title}`,"green");
                }

                player.play(interaction.options.getString("link"))
                servers.set(interaction.guild.id, storage)

                interaction.reply({ embeds: [embed] });
                return; 
            }
        }
    }
    interaction.reply({ embeds: [embedCreator.createEmbed("",`Please join in a Voice Channel to start the Bot!`,"green")] });
  }
}