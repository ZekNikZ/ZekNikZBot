const jsonfile = require('jsonfile');

var gamesfile = undefined;
jsonfile.readFile('./games.json', function (err, obj) {
	gamesfile = obj;
	log("Games loaded.");
});

const log_level = ['INFO', 'WARNING', 'ERROR'];
const l_info = 0;
const l_warn = 1;
const l_error = 2;

var games = {
	acquiretiles: require('./games/acquiretiles.js')
}

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

function genNewId() {
	while (true) {
		id = Math.floor(Math.random() * 65536) + 1;
		if (!(id in gamesfile.games)) {
			return id;
		}
	}
}

function createGame(msg, gametype, max_players, client) {
	if (!(gametype in games)) return null;
	id = genNewId();
	gamesfile.games[id] = {game: gametype, max_users: max_players, host: msg.member.id, players: []};
	msg.guild.createChannel('game_' + id, 'voice').then(function (channel) {
		channel.overwritePermissions(msg.guild.id, {CONNECT: false});
		channel.userLimit = max_players;
		channel.overwritePermissions(client.user, {CONNECT: true});
	});
	msg.guild.createChannel('game_' + id, 'text').then(function (channel) {
		channel.overwritePermissions(msg.guild.id, {READ_MESSAGES: false});
		addPlayerToGame(''+id, msg.member);
		channel.overwritePermissions(client.user, {READ_MESSAGES: true});
	});
	games[gametype].setupGame(id, msg.member.id, msg.guild.id);
	return id;
}

function updateGamesFile() {
	jsonfile.writeFile('./games.json', gamesfile, {spaces: 4}, function(err){
		console.error(err);
	});
}

function addPlayerToGame(id, member) {
	gamesfile.games[id].players.push(member.id);
	channels = member.guild.channels.findAll('name', 'game_' + id);
	if (channels[0].type == 'voice') {
		channels[0].overwritePermissions(member, {CONNECT: true});
		channels[1].overwritePermissions(member, {READ_MESSAGES: true});	
	} else {
		channels[1].overwritePermissions(member, {CONNECT: true});
		channels[0].overwritePermissions(member, {READ_MESSAGES: true});	
	}
	gamesfile.users[member.id] = id;
	updateGamesFile();
	member.sendMessage('You just joined game ' + id + ' (' + gamesfile.games[id].game + ')');
}

function joinGame(msg, id) {
	if (!(msg.member.id in gamesfile.users)) gamesfile.users[msg.member.id] = "0";
	if (id in gamesfile.games && gamesfile.users[msg.member.id] == 0 && gamesfile.games[id].max_users > gamesfile.games[id].players.length) {
		addPlayerToGame(id, msg.member);
		return true;
	} else {
		return false;
	}
}

function endGame(msg, id) {
	if (!(id in gamesfile.games)) return;
	if (msg.member.id != gamesfile.games[id].host) return;
	games[gamesfile.games[id].game].endGame(id);
	channels = msg.guild.channels.findAll('name', 'game_' + id);
	channels[0].delete().catch(console.error);
	channels[1].delete().catch(console.error);
	delete gamesfile.games[id];
	for (var user in gamesfile.users) {
		if (gamesfile.users[user] == id) {
			gamesfile.users[user] = "0";
		}
	}
	updateGamesFile();
}

function endCurrentGame(msg) {
	if (!(msg.member.id in gamesfile.users)) {
		gamesfile.users[msg.member.id] = "0";
		return;
	}
	id = gamesfile.users[msg.member.id];
	if (gamesfile.games[id].host == msg.member.id) {
		endGame(msg, id);
	}
}

function command(msg, command, args, client) {
	if (gamesfile.users[msg.author.id] == 0) return;
	games[gamesfile.games[gamesfile.users[msg.author.id]].game].onCommand(msg, command, args, gamesfile.users[msg.author.id], client);
}

function startGame(msg) {
	if (gamesfile.users[msg.member.id] == 0) return;
	games[gamesfile.games[gamesfile.users[msg.member.id]].game].startGame(gamesfile.users[msg.member.id], gamesfile.games[gamesfile.users[msg.member.id]].players);
}

exports.createGame = createGame;
exports.joinGame = joinGame;
exports.endGame = endGame;
exports.endCurrentGame = endCurrentGame;
exports.command = command;
exports.games = games;
exports.startGame = startGame;