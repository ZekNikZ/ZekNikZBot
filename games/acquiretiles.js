const jsonfile = require('jsonfile');

var gamesdata = undefined;
jsonfile.readFile('./games/acquiretiles.json', function (err, obj) {
	gamesdata = obj;
	log("Games loaded.");
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

function log(message, level) {
	if (level == null) level = l_info;
	console.log(new Date().today() + ' ' + new Date().timeNow() + ' ' + log_level[level] + ': ' + message) //, 'color: #' + log_level_color[level])
	return message;
}

function reloadData() {
	jsonfile.readFile('./games/acquiretiles.json', function (err, obj) {
		gamesdata = obj;
	});
}

function updateData() {
	jsonfile.writeFile('./games/acquiretiles.json', gamesdata, {spaces: 4}, function(err){
		console.error(err);
	});
}

function setupGame(id, host_id, guild_id) {
	tiles = [];
	letters = 'ABCDEFGHI';
	for (var i = 0; i < 9; i++) {
		for (var j = 1; j <= 12; j++) {
			tiles.push(letters[i] + j);
		}
	}
	s_tiles = shuffle(tiles);
	gamesdata.games[id] = {
		tilepool: s_tiles,
		players: {},
		playercount: -1,
		turn: -1,
		host: host_id,
		guild: guild_id
	}
	updateData();
}

function startGame(id, players) {
	for (player of shuffle(players)) {
		playertiles = [];
		
		gamesdata.games[id].players[player] = playertiles;
	}
	gamesdata.games[id].playercount = players.length;
	gamesdata.games[id].turn = 0;
	gamesdata.games[id].turn = (gamesdata.games[id].turn + 1) % gamesdata.games[id].playercount;
	sendMessage(id, 'It is now ' + msg.author.username + '\'s turn.', client);
	updateData();
}

function endGame(id) {
	delete gamesdata.games[id]
	updateData();
}

function onCommand(msg, command, args, id, client) {
	switch (command) {
		case 'help':
			msg.reply('```playtile [tile]: Plays a tile.\nendturn: Ends your turn.\ndiscardtile [tile]: Discards a tile.```');
			break;
		case 'playtile':
			if (isTurn(msg.author.id)) {
				//TODO
			} else {
				msg.reply('it is not your turn!');
			}
			break;
		case 'endturn':
			if (isTurn(id, msg.author.id)) {
				gamesdata.games[id].turn = (gamesdata.games[id].turn + 1) % gamesdata.games[id].playercount;
				count = 0;
				new_player = undefined;
				for (var player in gamesdata.games[id].players) {
					if (count == gamesdata.games[id].turn) {
						new_player = client.users.find('id', player);
						break;
					}
					count++;
				}
				sendMessage(id, 'It is now ' + new_player.username + '\'s turn.', client);
				updateData();
			} else {
				msg.reply('it is not your turn!');
			}
			break;
		case 'discardtile':
			if (isTurn(msg.author.id)) {
				//TODO
			} else {
				msg.reply('it is not your turn!');
			}
			break;
		default:
			msg.reply('invalid command. Use the \'help\' command for help.');
	}
}

function sendMessage (id, message, client) {
	channels = client.guilds.find('id', gamesdata.games[id].guild).channels.findAll('name', 'game_' + id);
	if (channels[0].type == 'text') {
		channels[0].sendMessage(message);
	} else {
		channels[1].sendMessage(message);
	}
}

function isTurn (id, user) {
	count = 0;
	for (var player in gamesdata.games[id].players) {
		if (player == user) break;
		count++;
	}
	return count == gamesdata.games[id].turn;
}

function shuffle (a) {
	var r = a;
	var j, x, i;
	for (i = r.length; i; i--) {
		j = Math.floor(Math.random * i);
		x = r[i - 1];
		r[i - 1] = r[j];
		r[j] = x;
	}
	return r;
}

exports.setupGame = setupGame;
exports.startGame = startGame;
exports.endGame = endGame;
exports.onCommand = onCommand;