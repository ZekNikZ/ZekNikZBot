#!/usr/bin/env node

const token = 'MjUwNzc2MTIyMTc2OTYyNTYw.CxZw-w.coEvwXRE0x_07G0pdUaK0pgbvoQ';

const Discord = require('discord.js');
const client = new Discord.Client();
//var config = require('./config.json');

Date.prototype.today = function () { 
    return ((this.getDate() < 10)?"0":"") + this.getDate() +"/"+(((this.getMonth()+1) < 10)?"0":"") + (this.getMonth()+1) +"/"+ this.getFullYear();
}

Date.prototype.timeNow = function () {
    return ((this.getHours() < 10)?"0":"") + this.getHours() +":"+ ((this.getMinutes() < 10)?"0":"") + this.getMinutes() +":"+ ((this.getSeconds() < 10)?"0":"") + this.getSeconds();
}

global.log_level = ['INFO', 'WARNING', 'ERROR']
global.log_level_color = ['FFFFFF', 'FFFF00', 'FF0000']
global.l_info = 0
global.l_warn = 1
global.l_error = 2

function log(message, level) {
	if (level == null) level = global.l_info;
	console.log(new Date().today() + ' ' + new Date().timeNow() + ' ' + global.log_level[level] + ': ' + message) //, 'color: #' + log_level_color[level])
	return message;
}

client.on('ready', () => {
	log('Bot connected to Discord Servers.');
});

client.on('message', message => {
	if (message.content === '.ping') {
		log('Received command \'.ping\' from \'' + message.member.nickname + '\'.');
		var initTime = new Date(message.timestamp)
    	message.reply('pong!').then((m) => {
      		m.edit('<@' + message.member.id + '>, pong! Time taken: ' + Math.floor(new Date(m.timestamp) - initTime) + ' ms.')
    	});
	} else if (message.content === '.exit') {
		log('Received command \'.exit\' from \'' + message.member.nickname + '\'.');
		log('Shutting down bot...');
		message.reply('shutting down...');
		client.destroy();
	} else if (message.content.substring(0, '.command '.length) == '.command ') {
		log('Received command \'.command\' from \'' + message.member.nickname + '\'.');
		log('Running command \'' + message.content.substring('.command '.length) + '\'');
		eval(message.content.substring('.command '.length));
	} else if (message.content === '.wildbot') {
		log('Received command \'.wildbot\' from \'' + message.member.nickname + '\'.');
		log('Setting up WildBot permissions...');
		message.channel.sendMessage('++setlevel 3 ' + message.channel.guild.roles.find('name', 'Strategist').toString());
		message.channel.sendMessage('++setlevel 2 ' + message.channel.guild.roles.find('name', 'Party Leader').toString());
		message.channel.sendMessage('++setlevel 2 ' + message.channel.guild.roles.find('nickname', 'Reign Of Encore').toString());
	} else if (message.content.substring(0, '.mm '.length) == '.mm ') {
		command = message.content.substring('.mm '.length).split('>');
		log('Received command \'.mm\' from \'' + message.member.nickname + '\'.');
		log('Moving users from \'' + command[1] + '\' to \'' + command[0] + '\'');
		message.reply('moving users from \'' + command[1] + '\' to \'' + command[0] + '\'');
		channel_to = message.guild.channels.find('name', command[1]);
		members = message.guild.channels.find('name', command[0]).members;
		members.array().forEach(function(member){member.setVoiceChannel(channel_to);})
	}
});

client.login(token);