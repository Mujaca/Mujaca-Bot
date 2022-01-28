const { joinVoiceChannel, VoiceConnectionStatus, createAudioPlayer, createAudioResource, CreateAudioPlayerOptions } = require('@discordjs/voice');
const { servers } = require('../util/storageHelper');
const ytdl = require('ytdl-core');
const {google} = require('googleapis');
var OAuth2 = google.auth.OAuth2;
const fs = require('fs');
var readline = require('readline');
require('dotenv').config()
const { AudioPlayerStatus } = require('@discordjs/voice');

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

    async play(link){
        //if(this.youtube.test(link)) return;
        var playlist = await playlistChecker(link);
        if(playlist) {
            if(typeof playlist == typeof []) {
                playlist.forEach((item, index) => {
                    if(this.current == null) {
                        if(index == 0) {
                            this.current = "https://www.youtube.com/watch?v=" + item.snippet.resourceId.videoId;
                            playAudio(this, this.current);
                        }else{
                            this.queue.push("https://www.youtube.com/watch?v=" + item.snippet.resourceId.videoId);
                            console.log("https://www.youtube.com/watch?v=" + item.snippet.resourceId.videoId)
                        }
                    }else{
                        this.queue.push("https://www.youtube.com/watch?v=" + item.snippet.resourceId.videoId);
                        console.log("https://www.youtube.com/watch?v=" + item.snippet.resourceId.videoId)
                    }
                })
            }
            console.log(this.queue[0], this.queue[1], this.queue[2])
            return;
        }
        if(this.current !== null) {
            this.queue.push(link);
            return;
        }
        this.current = link;
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
        this.queue.splice(0, 1);

        playAudio(this, this.current)
    }

    loop(){
        this.looping  = !this.looping;
        if(this.singlelooping == this.looping) this.singlelooping = !this.looping;
    }

    singleLoop(){
        this.singlelooping = !this.singlelooping;
        if(this.singlelooping == this.looping) this.looping = !this.singlelooping;
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
            player = createAudioPlayer({behaviors: {maxMissedFrames: 300}});
            MusicPlayer.connection.subscribe(player);
            MusicPlayer.player = player;

            player.on('stateChange', (oldState, newState) => {
                if(newState.status == "idle") MusicPlayer.nextVideo();
            })

            player.on(AudioPlayerStatus.Idle, () => {
                MusicPlayer.nextVideo();
            });

            player.on('error', (error) => {
                console.log(error);
            })
        }
        
        MusicPlayer.resource = resource;
        player.play(resource)
    } catch (error) {
        console.error(error)
    }
}

async function playlistChecker(link){
    return new Promise(async (resolve, reject) => {
        if(link.startsWith("https://www.youtube.com/playlist?list=")) {
            var ID = link.replace("https://www.youtube.com/playlist?list=", "")
            var files = [];
            var playlist = await getPlaylist(ID);
            playlist.items.forEach((item) => {files.push(item)})
            while(playlist.nextPageToken !== undefined && playlist.nextPageToken !== null){
                playlist = await getPlaylist(ID, playlist.nextPageToken);
                playlist.items.forEach((item) => {if(!(item.snippet.title.toLowerCase() == 'deleted video' || item.snippet.title.toLowerCase() == 'private video'))files.push(item)})
            }
            resolve(files)
        }else{
            resolve(false);
        }
    })
}

function authorize() {
    return new Promise((resolve, reject) => {
        if(!fs.existsSync('./credentials/')) fs.mkdirSync('./credentials/')
        var TOKEN_DIR = './credentials/';
        var TOKEN_PATH = TOKEN_DIR + 'token.json';
        var credentials = require('../credentials/client_secret.json')
        var clientSecret = credentials.installed.client_secret;
        var clientId = credentials.installed.client_id;
        var redirectUrl = credentials.installed.redirect_uris[0];
        var oauth2Client = new OAuth2(clientId, clientSecret, redirectUrl);
      
        fs.readFile(TOKEN_PATH, function(err, token) {
          if (err) {
            var authUrl = oauth2Client.generateAuthUrl({
                access_type: 'offline',
                scope: ['https://www.googleapis.com/auth/youtube.readonly']
              });
              console.log('Authorize this app by visiting this url: ', authUrl);
              var rl = readline.createInterface({
                input: process.stdin,
                output: process.stdout
              });
              rl.question('Enter the code from that page here: ', function(code) {
                rl.close();
                oauth2Client.getToken(code, function(err, token) {
                  if (err) {
                    console.log('Error while trying to retrieve access token', err);
                    return;
                  }
                  oauth2Client.credentials = token;
                  fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
                    if (err) throw err;
                  });
                  resolve(oauth2Client);
                });
              });
          } else {
            oauth2Client.credentials = JSON.parse(token);
            resolve(oauth2Client);
          }
        });
    })
}

function getPlaylist(ID, pageToken){
    return new Promise(async (resolve, reject) => {
        var service = google.youtube("v3");
        var auth = await authorize();
        service.playlistItems.list({
            part: 'id,snippet,status',
            auth: auth,
            playlistId: ID,
            maxResults: 50,
            pageToken: pageToken
        }, (err, res) => {
            if(err) resolve({nextPageToken: null, items: []});
            if(res == undefined) resolve({nextPageToken: null})
            if(res !== undefined) resolve(res.data);
        })
    })
}

function getVideoTitle(ID) {
    return new Promise(async (resolve, reject) => {
        var service = google.youtube("v3");
        var auth = await authorize();

        service.videos.list({
            part: 'id,snippet',
            auth: auth,
            type: "video",
            relatedToVideoId: ID,
            id: ID
        }, (err, res) => {
            if(err) reject(err);
            if(res && res.data && res.data.items && res.data.items[0]) resolve(res.data.items[0].snippet.title)
        })
    })
}

module.exports = { MusicPlayer, getVideoTitle }