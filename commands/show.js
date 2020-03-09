module.exports = {
    name: 'show',
    description: 'Show a fleet list, either your own or the entire organization. If using the optional argument "sale" only ships for sale are shown.',
    usage: 'my/org [sale]',
    dmOnly: true,

    execute(message, args) {
        console.log(args);
        if (args[0] !== 'my' && args[0] !== 'org') {
            return message.reply('sorry, but you did not give me a correct argument. Use either "show my" or "show org".');
        }
        if (args[1] && args[1] !== 'sale') {
            return message.reply('sorry, but you did not give me a correct argument. Use only "show ' + args[0] + ' sale".');
        }
        request.get('packages/' + args[0] + (args[1] ? '/sale' : ''),
            (json) => {
                console.log(json);
                const embed = new Discord.MessageEmbed()
                    .setTitle('Your fleet overview')
                    .setColor(0xFF0000)
                    .setDescription(json.message);
                message.channel.send(embed);
            },
            (json) => {
                message.reply('sorry but we could not find your fleet!\n*Computer says: ' + json.error + '*');
            }
        );
    },
};
