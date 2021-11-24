const { joinVoiceChannel, VoiceConnectionStatus, createAudioPlayer, createAudioResource, CreateAudioPlayerOptions } = require('@discordjs/voice');
const { servers } = require('../util/storageHelper');
const ytdl = require('ytdl-core');
const fs = require('fs');

class MusicPlayer{
    constructor(voiceConnection){
        this.connection = voiceConnection;
        this.player = null;
        this.resource = null;

        this.current = null;
        this.paused = false;
        this.volume = 1;
        this.queue = [];
        this.looping = false;
        this.singlelooping = false;

        //this.youtube = new RegExp("(?:https?:\/\/)?(?:www\.)?youtu\.?be(?:\.com)?\/?.*(?:watch|embed)?(?:.*v=|v\/|\/)([\w\-_]+)\&?");
    }

    play(link){
        //if(this.youtube.test(link)) return;
        if(this.current !== null) {
            this.queue.push(link);
            return;
        }
        this.current = link;
        this.started = true;
        playAudio(this, link);
    }

    pause(){
        if(this.player) {
            this.player.pause();
            this.paused = true;
        }
    }

    setVolume(volume){
        this.volume = volume;
        if(this.resource) {
            this.resource.volume.setVolume(this.volume)
        }
    }

    skip(){
        this.pause();
        this.nextVideo();
    }

    nextVideo(){
        if(this.looping) this.queue.push(this.current);
        if(this.singlelooping) this.queue.unshift(this.current)

        if(this.queue.length == 0) {
            this.current = null;
            return;
        }

        this.current = this.queue[0];
        this.queue.slice(0, 1);

        playAudio(this, this.current)
    }

    loop(){
        this.looping  = !this.looping
    }

    singleLoop(){
        this.singlelooping = !this.singlelooping;
    }

    stop(){
        this.connection.destroy();
    }
}

async function playAudio(MusicPlayer, link){
    try {
        var resource = createAudioResource(ytdl(link, { filter : 'audioonly' }), {
            inlineVolume : true
        });
        resource.volume.setVolume(MusicPlayer.volume);
        var player = MusicPlayer.player
        if(!player) {
            player = createAudioPlayer({maxMissedFrames: 100});
            MusicPlayer.connection.subscribe(player);
            MusicPlayer.player = player;
            player.on('stateChange', (oldState, newState) => {
                if(newState.status == "idle") MusicPlayer.nextVideo();
            })
        }
        
        MusicPlayer.resource = resource;
        player.play(resource)
    } catch (error) {
        console.error(error)
    }
}

module.exports = { MusicPlayer }