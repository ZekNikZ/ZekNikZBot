var commands = []

commands.ping = {
    name: 'ping',
    help: 'Replies to the message with a \'pong\' with time delay',
    timeout: 10,
    level: 0,
    func: function (msg) {
        var initTime = new Date(msg.timestamp)
        msg.reply('pong!').then((m) => {
            m.edit('<@' + msg.author.id + '>, pong! Time taken: ' + Math.floor(new Date(m.timestamp) - initTime) + ' ms.')
        });
    }
}

exports.commands = commands;