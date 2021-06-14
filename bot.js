console.log('Beep! beep!');

require('dotenv').config();

//Discord Client
const Discord = require('discord.js');
const client = new Discord.Client();
client.login(process.env.BOTTOKEN);
const prefix = '>'


//ytdl
const ytdl = require('ytdl-core')

//vars
const queue = new Map()

client.once("ready", () => {
    console.log("Boop! Boop!");
  });
  
client.once("reconnecting", () => {
    console.log("Beep! Reconnecting! Boop!");
  });
  
client.once("disconnect", () => {
    console.log("Boop! Boop! Beep! Beep! *Shutdown noise*");
  });
  
client.on("message", async message => {
    if (message.author.bot) return;
    if (!message.content.startsWith(prefix)) return;
  
    const serverQueue = queue.get(message.guild.id);
  
    if (message.content.startsWith(`${prefix}play`)) {
        execute(message, serverQueue);
        return;
    } 
    else if (message.content.startsWith(`${prefix}skip`)) {
        skip(message, serverQueue);
        return;
    } 
    else if (message.content.startsWith(`${prefix}stop`)) {
        stop(message, serverQueue);
        return;
    }
    else if (message.content.startsWith(`${prefix}doughnut`) || message.content.startsWith(`${prefix}donut`)) {
        reply(message);
        return;
    }
    else if (message.content.startsWith(`${prefix}bagel`)) {
        easteregg(message);
        return;
    }
    else {
        message.channel.send("🤷Doughnut do not understand at all!🤷");
    }
  });
  
async function execute(message, serverQueue) {
    const args = message.content.split(" ");
  
    const voiceChannel = message.member.voice.channel;
    if (!voiceChannel)
        return message.channel.send(
            "👻Doughnut do not see you in Voice Channel.👻"
        );
    const permissions = voiceChannel.permissionsFor(message.client.user);
    if (!permissions.has("CONNECT") || !permissions.has("SPEAK")) {
        return message.channel.send(
            "🐤Doughnut cannot do anything!🐤"
        );
    }
  
    const songInfo = await ytdl.getInfo(args[1]);
    const song = {
        title: songInfo.videoDetails.title,
        url: songInfo.videoDetails.video_url,
    };
  
    if (!serverQueue) {
        const queueContruct = {
            textChannel: message.channel,
            voiceChannel: voiceChannel,
            connection: null,
            songs: [],
            volume: 3,
            playing: true
    };
  
        queue.set(message.guild.id, queueContruct);
  
        queueContruct.songs.push(song);
  
    try {
        var connection = await voiceChannel.join();
        queueContruct.connection = connection;
        play(message.guild, queueContruct.songs[0]);
    } 
    catch (err) {
        console.log(err);
        queue.delete(message.guild.id);
        return message.channel.send(err);
      }
    } 
    else {
      serverQueue.songs.push(song);
      return message.channel.send(`Doughnut add ${song.title} to your queue!🚦`);
    }
  }
  
function skip(message, serverQueue) {
    if (!message.member.voice.channel)
        return message.channel.send(
            "👻Doughnut do not see you in Voice Channel.👻"
        );
    if (!serverQueue)
        return message.channel.send("No song left! 💬");
    serverQueue.connection.dispatcher.end();
}
  
function stop(message, serverQueue) {
    if (!message.member.voice.channel)
        return message.channel.send(
            "👻Doughnut do not see you in Voice Channel.👻"
        );
      
    if (!serverQueue)
        return message.channel.send("No song left! 💬");
      
    serverQueue.songs = [];
    serverQueue.connection.dispatcher.end();
  }
  
function play(guild, song) {
    const serverQueue = queue.get(guild.id);
    if (!song) {
        serverQueue.voiceChannel.leave();
        queue.delete(guild.id);
        return;
    }
  
    const dispatcher = serverQueue.connection
        .play(ytdl(song.url))
        .on("finish", () => {
            serverQueue.songs.shift();
            play(guild, serverQueue.songs[0]);
        })
        .on("error", error => console.error(error));
    dispatcher.setVolumeLogarithmic(serverQueue.volume / 5);
    serverQueue.textChannel.send(`🎵Doughnut is singing ${song.title}. 🎵`);
  }


function reply(message){
    message.channel.send(
        "Yummy!🍩 Stay Comfy!"
    )
}

function easteregg(message){
    message.channel.send(
        "That's a bagel🥯, not doughnut!"
    )
}