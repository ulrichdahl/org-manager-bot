module.exports = {
    name: 'users',
    description: 'Show what servers the bot is connected to.',
    requireRole: 'admin',
    guild: null,
    member: null,
    requiredRole: null,

    execute(message) {
        let _guild = this.guild;
        request.get('users/' + _guild.id, (json) => {
            const embed = new this.Discord.MessageEmbed();
            embed.setTitle('Current users registered in ' + _guild.name);
            let ships = 0;
            json.users.forEach((user, i) => {
                embed.addField((i + 1) + ': ' + user.settings.userName, user.numberOfShips + ' ships', true);
                ships += user.numberOfShips;
            });
            embed.setFooter('Total ships in org fleet: ' + ships);
            message.author.send(embed);
        }, undefined, (err) => {
            message.reply('sorry, but the deregistration failed to complete.');
        });
    },
};
