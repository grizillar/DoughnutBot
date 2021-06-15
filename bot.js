console.log('Beep! beep!');

require('dotenv').config();

//Discord Client
const Discord = require('discord.js');
const client = new Discord.Client();
client.login(process.env.BOTTOKEN);
var prefix = '>'


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
    else if (message.content.startsWith(`${prefix}clear`)) {
        clear(message, serverQueue);
        return;
    }
    else if (message.content.startsWith(`${prefix}doughnut`) || message.content.startsWith(`${prefix}donut`)) {
        reply(message);
        return;
    }
    else if (message.content.startsWith(`${prefix}song`)) {
        song(message, serverQueue);
        return;
    }
    else if (message.content.startsWith(`${prefix}ploy`)) {
        easteregg(message);
        return;
    }
    else if (message.content.startsWith(`${prefix}help`)) {
        help(message);
        return;
    }
    else if (message.content.startsWith(`${prefix}queue`)) {
        checkQueue(message, serverQueue);
        return;
    }
    else if (message.content.startsWith(`${prefix}set`)) {
        setting(message);
        return;
    }
    else {
        message.channel.send("🍩Doughnut do not understand at all! Try use >help.");
    }
  });
  
async function execute(message, serverQueue) {
    const args = message.content.split(" ");
  
    const voiceChannel = message.member.voice.channel;
    if (!voiceChannel)
        return message.channel.send(
            "🍩Doughnut do not see you in Voice Channel."
        );
    const permissions = voiceChannel.permissionsFor(message.client.user);
    if (!permissions.has("CONNECT") || !permissions.has("SPEAK")) {
        return message.channel.send(
            "🍩Doughnut cannot do anything!"
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
        message.channel.send('Doughnut!')
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
      return message.channel.send(`Doughnut add <**${song.title}**> to your queue!`);
    }
  }
  
function skip(message, serverQueue) {
    if (!message.member.voice.channel)
        return message.channel.send(
            "🍩Doughnut do not see you in Voice Channel."
        );
    if (!serverQueue)
        return message.channel.send("🍩No song left!");
    serverQueue.connection.dispatcher.end();
}
  
function stop(message, serverQueue) {
    if (!message.member.voice.channel)
        return message.channel.send(
            "🍩Doughnut do not see you in Voice Channel."
        );
      
    if (!serverQueue)
        return message.channel.send("🍩No song left!");
      
    serverQueue.songs = [];
    serverQueue.connection.dispatcher.end();
  }
  
function play(guild, song) {
    const serverQueue = queue.get(guild.id);
    if (!song) {
        setTimeout(() => {
            serverQueue.voiceChannel.leave();
            queue.delete(guild.id);
            return;
        },3000)
    }
    else{
        const dispatcher = serverQueue.connection
            .play(ytdl(song.url))
            .on("finish", () => {
                serverQueue.songs.shift();
                play(guild, serverQueue.songs[0]);
            })
            .on("error", error => console.error(error));
        dispatcher.setVolumeLogarithmic(serverQueue.volume / 5);
        serverQueue.textChannel.send(`Doughnut is singing <**${song.title}**>.`);
    }
  }


function reply(message){
    message.reply(
        "🍩Yummy! Stay Comfy!"
    )
}

function easteregg(message){
    message.channel.send(
        "🍨Happy Birthday!!!"
    )
}

function song(message, serverQueue){
    const current = serverQueue.songs[0]
    message.channel.send(`This song is <**${current.title}**>.`)
}

function checkQueue(message,serverQueue){
    var text = '**Queue**\n'
    for(let i = 0;i < serverQueue.songs.length;i++){
        if(i === 0){
            text += `**Now Playing**: <**${serverQueue.songs[i].title}**>\n`
        }
        else{
            text += `**${i}**: <**${serverQueue.songs[i].title}**>\n`
        }
    }
    message.channel.send(text)

}

function clear(message, serverQueue){
    serverQueue.songs = [serverQueue.songs.shift()]
    message.channel.send(`Doughnut cleared every songs!`)
}

function setting(message){
    const content = message.content.split(" ")
    if(content[1] == 'prefix'){
        prefix = content[2]
        message.channel.send(`Doughnut has changed the prefix to ${prefix}!`)
        return
    }

}

function help(message){
    message.channel.send(
        `Doughnut current prefix is '**${prefix}**'
        **${prefix}play** <*url*>: Play music
        **${prefix}skip**: Skip music
        **${prefix}stop**: Stop music
        **${prefix}clear**: Clear queue
        **${prefix}song**: Show current music
        **${prefix}queue**: Show current queue
        **${prefix}set** <*setting*> <*args..*>: settings
            |   **${prefix}set** prefix <*new prefix*>: setting, change prefix
        **${prefix}doughnut**: Response Doughtnut!`
    )
}