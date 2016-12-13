#!/usr/bin/env node

const Discord = require('discord.js');
const client = new Discord.Client();

const userid = '133105799818903552';
const email = 'gamrcorps@gmail.com';
const password = 'matthew275';

client.on('ready', () => {
	console.log('Bot connected to Discord Servers.');
});

client.on('message', message => {
	if (message.content.startsWith(';status ') && message.member.id == userid) {
		console.log('here');
		client.user.setGame(message.content.substring(';status '.length));
	}
});

client.login(email, password);