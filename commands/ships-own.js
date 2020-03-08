const fetch = require('node-fetch');
const FormData = require('form-data');

exports.handle = (msg) => {
    
    if (msg.content === 'help') {
        msg.channel.send(helper.get(msg.author.username));
    }

    if (msg.content === 'mine') {
        fetch('http://127.0.0.1:3000/hello')
            .then(res => {
                var json = res.json();
                console.log(json);
                const embed = new Discord.MessageEmbed()
                .setTitle('Your fleet overview')
                .setColor(0xFF0000)
                .setDescription(json.message);
                msg.channel.send(embed);
            })
            .catch(err => {
                console.log('Error occured', err)
            });
    }
}
module.exports = {
	name: 'mine',
	description: 'Show a list of your fleet. If using the optional argument "sale" only ships for sale are shown.',
    usage: '[sale]',
    aliases: ['own'],
    dmOnly: true,

	execute(message, args) {
        if (args[0] === 'sale') {
            message.reply('Here is a list of your ships currently for sale.');
        }
        else {
            message.reply('Here is a complete list of all your ships.');
        }
	},
};
