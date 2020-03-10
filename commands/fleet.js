const Discord = require('discord.js');
const BaseCommand = require('../lib/command');
const request = require('../lib/requests');

class Command extends BaseCommand {

    constructor() {
        super();
        this.name = 'fleet';
        this.description = 'Show a fleet list, either your own or the entire organization. If using the optional argument "sale" only ships for sale are shown.';
        this.usage = '';
        this.args = ['list/add/rem'];
        this.dmOnly = true;
    }

    execute(message, args) {
        console.log(this.args[0].split('/'), this.args[0].split('/').indexOf(args[0]), args[0]);
        if (this.args[0].split('/').indexOf(args[0]) < 0) {
            return message.reply('sorry, but you did not give me a correct argument. Use either "fleet ' + this.args[0] + '".');
        }
        switch (args[0]) {
            case 'list':
                if (['mine', 'org'].indexOf(args[1]) < 0) {
                    return message.reply('sorry, but you did not give me a correct argument. Use either "fleet list mine" or "fleet list org".');
                }
                if (args[2] && args[2] !== 'sale') {
                    return message.reply('sorry, but you did not give me a correct argument. Use only "show ' + args[0] + ' sale".');
                }
                this.list(message, args);
                break;
            case 'add':
                this.add(message, args);
                break;
            case 'rem':
                this.rem(message, args);
                break;
        }
    }

    list(message, args) {
        request.get('packages/' + args[1] + (args[2] ? '/sale' : ''),
            (json) => {
                console.log(json);
                const embed = new Discord.MessageEmbed()
                    .setTitle((args[1] === 'mine' ? 'Your' : 'Organization') + ' fleet overview')
                    .setColor(0xFF0000)
                    .setDescription(json.message);
                message.channel.send(embed);
            },
            (json) => {
                message.reply('sorry but we could not find your fleet!\n*Computer says: ' + json.error + '*');
            }
        );
    }

    add(message, args) {
        const data = {

        };
        console.log(data);
        message.reply('the ship has now been added to your fleet.');
    }
};

module.exports = new Command();
