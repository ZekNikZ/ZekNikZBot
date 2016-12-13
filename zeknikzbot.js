#!/usr/bin/env node

const token = 'MjUwNzc2MTIyMTc2OTYyNTYw.CxZw-w.coEvwXRE0x_07G0pdUaK0pgbvoQ';

const Discord = require('discord.js');
const jsonfile = require('jsonfile');
const client = new Discord.Client();
const com = require('./commands.js').commands;
var resetPermissions = require('./commands.js').resetPermissions;
var setResetPermissions = require('./commands.js').setResetPermissions;
var config = undefined;
var prefix = undefined;
jsonfile.readFile('./config.json', function (err, obj) {
	config = obj;
	prefix = config.prefix;
	log("Config loaded.");
});
var permissions = undefined;
jsonfile.readFile('./permissions.json', function (err, obj) {
	permissions = obj;
	log("Permissions loaded.");
});

const log_level = ['INFO', 'WARNING', 'ERROR'];
const l_info = 0;
const l_warn = 1;
const l_error = 2;

Date.prototype.today = function () { 
    return ((this.getDate() < 10)?"0":"") + this.getDate() +"/"+(((this.getMonth()+1) < 10)?"0":"") + (this.getMonth()+1) +"/"+ this.getFullYear();
}

Date.prototype.timeNow = function () {
    return ((this.getHours() < 10)?"0":"") + this.getHours() +":"+ ((this.getMinutes() < 10)?"0":"") + this.getMinutes() +":"+ ((this.getSeconds() < 10)?"0":"") + this.getSeconds();
}

Array.prototype.clean = function (deleteValue) {
	for (var i = 0; i < this.length; i++) {
		if (this[i] == deleteValue) {
			this.splice(i, 1);
			i--;
		}
	}
	return this;
}

function log(message, level) {
	if (level == null) level = l_info;
	console.log(new Date().today() + ' ' + new Date().timeNow() + ' ' + log_level[level] + ': ' + message) //, 'color: #' + log_level_color[level])
	return message;
}

function checkPermissions(guild, member) {
	if (resetPermissions()) {
		permissions = jsonfile.readFileSync('./permissions.json');
		setResetPermissions(false);
	}
	//if (guild.avaliable) {
	if (true) {
		if (!(guild.id in permissions)) {
			permissions[guild.id] = {};
		}
		if (member.id in permissions[guild.id]) {
			return permissions[guild.id][member.id];
		} else {
			permissions[guild.id][member.id] = 0;
			jsonfile.writeFileSync('./permissions.json', permissions, {spaces: 2});
			return 0;
		}
	} else {
		log("Server outage detected.", l_error);
		return undefined;
	}
}

client.on('ready', () => {
	log('Bot connected to Discord Servers.');
});

client.on('message', msg => {
    for (var command in com) {
    	if (com.hasOwnProperty(command)) {
        	if (msg.content.toLowerCase().startsWith(prefix + com[command].name)) {
        		log("Received '" + prefix + com[command].name + "' command from user '" + msg.member.nickname + "'.");
        		if (checkPermissions(msg.guild, msg.member) >= com[command].level) {
        			args = msg.content.substring(com[command].name.length + 2).split(' ').clean('');
    				com[command].func(msg, args, client);
    			} else {
    				msg.reply('you do not have a high enough permission level to use that command!');
    			}
    		}
    	}
    }
});

client.login(token);