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

        this.conversations = {
            add: {
                // title: {
                //     question: 'What is the title of the package?',
                //     answer: 'Title',
                //     help: 'You can copy this from your hangar of the CIG website.',
                //     next: 'boughtPrice'
                // },
                // boughtPrice: {
                //     question: 'What was the price of the package when you bought it?',
                //     answer: 'Purchase price',
                //     help: 'Please write the price followed by the currency like: 350 USD',
                //     next: 'boughtDate',
                // },
                // boughtVat: {
                //     question: 'What the price including VAT?',
                //     answer: 'Incl. VAT',
                //     choices: ['yes', 'no'],
                //     next: 'boughtDate',
                // },
                // boughtDate: {
                //     question: 'When did you buy this package?',
                //     answer: 'Purchase date',
                //     help: 'Please write the data in the following format: YYYY-MM-DD',
                //     next: 'type',
                // },
                // type: {
                //     question: 'What type of package is this?',
                //     answer: 'Type',
                //     choices: [
                //         'Standalone ship or package',
                //         'Game package (includes game access)',
                //         'CCU upgraded standalone',
                //         'CCU upgraded game package',
                //     ],
                //     next: 'insurance',
                // },
                // insurance: {
                //     question: 'What insurance does this package come with?',
                //     answer: 'Insurance',
                //     choices: [
                //         '3 months',
                //         '6 months',
                //         '5 years',
                //         '10 years (IAE)',
                //         'Life time (LTI)'
                //     ],
                //     next: 'shipMake'
                // },
                shipMake: {
                    question: 'What manufacturer is the vehicle?',
                    choices: './../ships.json|manufacturer',
                    next: 'shipType'
                },
                shipType: {
                    question: 'What :prevValue vehicle is it?',
                    answer: 'Ship(s)',
                    choices: './../ships.json|manufacturer|ships',
                    next: 'moreShips',
                    pushToArray: true,
                },
                moreShips: {
                    question: 'Does the package contain more vehicles (yes/no)?',
                    next: {
                        yes: 'shipMake',
                        no: 'image',
                    }
                },
                image: {
                    question: 'Please send me a screenshot of the package from your hangar on CIG website',
                    answerThumbnail: true,
                    next: 'confirm',
                    getAttachementUri: true,
                },
                confirm: {
                    question: 'Are you satisfied with your created ship package, or do you wish to restart?',
                    showAnswers: true,
                    next: {
                        yes: '#save#',
                        no: '#end#',
                    }
                }
            }
        };
    }

    execute(message, args, dataMessage) {
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
                this.add(message, args, dataMessage);
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

    add(message, args, dataMessage) {
        this.handleConversation(message, args, dataMessage)
    }
};

module.exports = new Command();
