module.exports = {
    name: 'users',
    description: 'Show what servers the bot is connected to.',
    onlyAdmins: true,
    args: 0,
    usage: '',

    execute(message, args) {
        let guild = args.pop();
        let member = args.pop();
        let adminRole = args.pop();
        fetch('http://127.0.0.1:3000/users/' + guild.id)
            .then(res => res.json())
            .then(json => {
                if (json.success) {
                    const embed = new this.Discord.MessageEmbed();
                    embed.setTitle('Current users registered in ' + guild.name);
                    let ships = 0;
                    json.users.forEach((user, i) => {
                        embed.addField((i + 1) + ': ' + user.settings.userName, user.numberOfShips + ' ships', true);
                        ships += user.numberOfShips;
                    });
                    embed.setFooter('Total ships in org fleet: ' + ships);
                    message.author.send(embed);
                }
            })
            .catch(err => {
                console.log('Error occured', err)
                message.reply('sorry, but the deregistration failed to complete.');
            });
    },
};
