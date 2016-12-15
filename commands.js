const jsonfile = require('jsonfile');

var config = undefined;
var prefix = undefined;
var channel_aliases = undefined;
reloadConfig();
var permissions = undefined;
jsonfile.readFile('./permissions.json', function (err, obj) {
	permissions = obj;
	log("Permissions loaded.");
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
		jsonfile.writeFileSync('./permissions.json', permissions, {spaces: 2});
		resetPermissionsConfig = !resetPermissionsConfig;
		msg.reply('permission level(s) set successfully.');
	}
}

exports.commands = commands;
exports.resetPermissions = function () {return resetPermissionsConfig;};
exports.setResetPermissions = function (value) {resetPermissionsConfig=value;};