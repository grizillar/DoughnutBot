console.log('Beep! beep!');

require('dotenv').config();

const Discord = require('discord.js');
const client = new Discord.Client();
client.login(process.env.BOTTOKEN);

client.on('ready', readyDiscord);

function readyDiscord(){
    console.log('Boop! boop!');
}

client.on('message', gotMessage);

const donutmsg = [
    'Yummy!🍩',
    'Eat me!😋',
    'Stay comfy.🌛',
    'Stay safe.😷'
]

function gotMessage(msg){
    console.log(msg.content);
    if (msg.content === 'doughnut' || msg.content === 'donut'){
        const index = Math.floor(Math.random() * donutmsg.length);
        msg.reply(donutmsg[index]);
        //msg.channel.send("Eat me!");
    }
}