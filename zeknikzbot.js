#!/usr/bin/env node

const token = 'MjUwNzc2MTIyMTc2OTYyNTYw.CxZw-w.coEvwXRE0x_07G0pdUaK0pgbvoQ';

const Discord = require('discord.js');
const client = new Discord.Client();
const com = require('./commands.js').commands;

const log_level = ['INFO', 'WARNING', 'ERROR']
const l_info = 0
const l_warn = 1
const l_error = 2

Date.prototype.today = function () { 
    return ((this.getDate() < 10)?"0":"") + this.getDate() +"/"+(((this.getMonth()+1) < 10)?"0":"") + (this.getMonth()+1) +"/"+ this.getFullYear();
}

Date.prototype.timeNow = function () {
    return ((this.getHours() < 10)?"0":"") + this.getHours() +":"+ ((this.getMinutes() < 10)?"0":"") + this.getMinutes() +":"+ ((this.getSeconds() < 10)?"0":"") + this.getSeconds();
}

function log(message, level) {
	if (level == null) level = l_info;
	console.log(new Date().today() + ' ' + new Date().timeNow() + ' ' + log_level[level] + ': ' + message) //, 'color: #' + log_level_color[level])
	return message;
}

client.on('ready', () => {
	log('Bot connected to Discord Servers.');
});

client.on('message', msg => {
    log(msg.content);
    (com.find(command => {msg.content.startsWith('.' + command.name)})||{func:msg=>{}}).func(msg);
});

client.login(token);