const jsonfile = require('jsonfile');
var games = require('./games.js');

var config = undefined;
var prefix = undefined;
var channel_aliases = undefined;
reloadConfig();
var permissions = undefined;
jsonfile.readFile('./permissions.json', function (err, obj) {
	permissions = obj;
	log("Permissions loaded.");
});
var polls = undefined;
jsonfile.readFile('./polls.json', function (err, obj) {
	polls = obj;
	log('Polls loaded.');
});

var resetPermissionsConfig = false;

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

function log(message, level) {
	if (level == null) level = l_info;
	console.log(new Date().today() + ' ' + new Date().timeNow() + ' ' + log_level[level] + ': ' + message) //, 'color: #' + log_level_color[level])
	return message;
}

function reloadConfig() {
	jsonfile.readFile('./config.json', function (err, obj) {
		config = obj;
		prefix = config.prefix;
		channel_aliases = config.channel_aliases;
	});
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

var commands = []

commands.ping = {
    name: 'ping',
    help: "Replies to the message with a 'pong' with time delay.",
    usage: 'ping',
    level: 1,
    func: function (msg) {
        var initTime = new Date(msg.createdTimestamp)
        msg.reply('pong!').then((m) => {
            m.edit('<@' + msg.author.id + '>, pong! Time taken: ' + (new Date(m.createdTimestamp) - initTime) + ' ms.')
        });
    }
}

commands.exit = {
	name: 'exit',
	help: 'Turn off the bot.',
	usage: 'exit',
	level: 3,
	func: function (msg, args, client) {
		msg.reply('shutting down...');
		client.destroy();
	}
}

commands.massmove = {
	name: 'massmove',
	help: 'Move all users from one channel to another.',
	usage: 'massmove [from_channel] [to_channel]',
	level: 2,
	func: function (msg, args) {
		//command = msg.content.substring('.massmove '.length).split(' ');
		command = args;
		command[0] = channel_aliases[command[0].toLowerCase()]||command[0];
		command[1] = channel_aliases[command[1].toLowerCase()]||command[1];
		log('Moving users from \'' + command[0] + '\' to \'' + command[1] + '\'');
		msg.reply('moving users from \'' + command[0] + '\' to \'' + command[1] + '\'');
		channel_to = msg.guild.channels.find('name', command[1]);
		members = msg.guild.channels.find('name', command[0]).members;
		members.array().forEach(function(member){member.setVoiceChannel(channel_to);})
	}
}

commands.help = {
	name: 'help',
	help: 'Displays help and usage information about commands.',
	usage: 'help (command)',
	level: 0,
	func: function (msg, args) {
		if (args.length == 0) {
			result = '```';
			for (var command in commands) {
				if (commands.hasOwnProperty(command)) {
					result = result + prefix + commands[command].name + ': ' + commands[command].help + ' (' + commands[command].level + ')\n';
				}
			}
			result += '```';
			msg.reply(result);
		} else {
			result = '```';
			for (command of args) {
				if (commands.hasOwnProperty(command)) {
					result = result + prefix + commands[command].name + ': ' + commands[command].help + ' (' + commands[command].level + ')\n  Usage: ' + prefix + commands[command].usage + '\n';
				}
			}
			result += '```';
			msg.reply(result);
		}
	}
}

commands.level = {
	name: 'level',
	help: 'Changes the permission level of a user.',
	usage: 'level [new_level] [user0] (user1, user2...)',
	level: 3,
	func: function (msg, args) {
		for (member of msg.mentions.users.array()) {
			permissions[msg.guild.id][member.id] = parseInt(args[0]);
		}
		jsonfile.writeFileSync('./permissions.json', permissions, {spaces: 4});
		resetPermissionsConfig = !resetPermissionsConfig;
		msg.reply('permission level(s) set successfully.');
	}
}

commands.massdelete = {
	name: 'massdelete',
	help: 'Mass deletes messages.',
	usage: 'massdelete [number]',
	level: 2,
	func: function (msg, args) {
		if (args.length != 1) {
			msg.reply('invalid number of arguments.');
		} else {
			msg.channel.bulkDelete(parseInt(args[0]) + 1);
		}
	}
}

commands.creategame = {
	name: 'creategame',
	help: 'Creates a game.',
	usage: 'creategame [game_type] [max_players] (invite_only) (user1, user2...)',
	level: 0,
	func: function (msg, args, client) {
		if (args.length < 2) {
			msg.reply('invalid number of arguments.');
		} else {
			id = games.createGame(msg, args[0], args[1], client, args[2] == 'true');
			if (id == null) {
				msg.reply('could not create game.');
			} else {
				msg.reply('game created. Game ID: ' + id);
			}
		}
	}
}

commands.joingame = {
	name: 'joingame',
	help: 'Joins a game.',
	usage: 'joingame [game_id]',
	level: 0,
	func: function (msg, args) {
		if (args.length != 1) {
			msg.reply('invalid number of arguments.');
		} else {
			if (games.joinGame(msg, args[0])) {
				msg.reply('joined game ' + args[0]);
			} else {
				msg.reply('could not join game ' + args[0]);
			}
		}
	}
}

commands.endgame = {
	name: 'endgame',
	help: 'Ends a game and deletes the associated channels.',
	usage: 'endgame (id)',
	level: 0,
	func: function (msg, args) {
		if (args.length >= 2) msg.reply('invalid number of arguments.');
		if (args.length == 1) {
			games.endGame(msg, args[0]);
		} else {
			games.endCurrentGame(msg);
		}
	}
}

commands.startgame = {
	name: 'startgame',
	help: 'Starts a game.',
	usage: 'startgame',
	level: 0,
	func: function (msg) {
		games.startGame(msg);
	}
}

commands.gameslist = {
	name: 'games',
	help: 'Lists avaliable games.',
	usage: 'games',
	level: 0,
	func: function (msg) {
		games.listGames(msg);
	}
}

commands.invite = {
	name: 'invite',
	help: 'Invites a player to your current game.',
	usage: 'invite [user1] (user2, user3...)',
	level: 0,
	func: function (msg) {
		if (!games.invitePlayer(msg)) {
			msg.reply('you do not have permission to use this command.');
		}
	}
}

commands.startpoll = {
	name: 'startpoll',
	help: 'Starts a poll.',
	usage: 'startpoll [question]|[option1];[option2];[option3...]',
	level: 2,
	func: function (msg, args, client) {
		id = nextPollId();
		a = msg.content.substring(11).split('|')
		o = a[1].split(';');
		v = [];
		for (var z = 0; z < o.length; z++) {
			v.push(0);
		}
		polls.polls[id] = {state: "open", question:a[0], options:o, votes:v, voters:[]};
		jsonfile.writeFile('./polls.json', polls, {spaces: 4}, function(err){
			console.error(err);
		});
	}
}

commands.vote = {
	name: 'vote',
	help: 'Votes for a poll.',
	usage: 'vote [pollid] [option]',
	level: 0,
	func: function (msg, args) {
		if (args.length != 2) {
			msg.reply('invalid number of arguments.');
			return;
		}
		id = args[0];
		option = args[1];
		if (polls.polls[id].state != "open") {
			msg.reply('that poll has already closed!')
			return;
		}
		if (polls.polls[id].voters.indexOf(msg.member.id.toString()) > -1) {
			msg.reply('you\'ve already voted!');
			return;
		}
		if (!(id in polls.polls)) {
			msg.reply('invalid poll ID.');
			return;
		}
		if (parseInt(option)-1 >= polls.polls[id].options.length || parseInt(option)-1 < 0 || isNaN(option)) {
			msg.reply('invalid option.');
			return;
		}
		polls.polls[id].votes[parseInt(option)-1] += 1;
		polls.polls[id].voters.push(msg.member.id);
		jsonfile.writeFile('./polls.json', polls, {spaces: 4}, function(err){
			console.error(err);
		});
		msg.reply('vote recorded successfully!')
	}
}

commands.results = {
	name: 'results',
	help: 'Returns the results of a poll.',
	usage: 'results [pollid]',
	level: 1,
	func: function (msg, args) {
		if (args.length != 1) {
			msg.reply('invalid number of arguments.');
			return;
		}
		id = args[0];
		if (!(id in polls.polls)) {
			msg.reply('invalid poll ID.');
			return;
		}
		result = '```Poll ' + id + ': ' + polls.polls[id].question + '\n';
		for (var i = 0; i < polls.polls[id].options.length; i++) {
			result += polls.polls[id].options[i] + ': ' + polls.polls[id].votes[i] + '\n';
		}
		msg.reply(result + '```')
	}
}

commands.pollstate = {
	name: 'pollstate',
	help: 'Sets the poll state of a poll.',
	usage: 'pollstate [pollid] [open|closed]',
	level: 2,
	func: function (msg, args) {
		if (args.length != 2) {
			msg.reply('invalid number of arguments.');
			return;
		}
		id = args[0];
		state = args[1];
		if (!(id in polls.polls)) {
			msg.reply('invalid poll ID.');
			return;
		}
		polls.polls[id].state = state;
		jsonfile.writeFile('./polls.json', polls, {spaces: 4}, function(err){
			console.error(err);
		});
		msg.reply('Poll ' + id + '\'s state set to "' + state + '"');
	}
}

function nextPollId() {
	id = polls['next_id']
	polls['next_id'] = id + 1
	jsonfile.writeFile('./polls.json', polls, {spaces: 4}, function(err){
		console.error(err);
	});
	return id + 1
}

exports.commands = commands;
exports.resetPermissions = function () {return resetPermissionsConfig;};
exports.setResetPermissions = function (value) {resetPermissionsConfig=value;};