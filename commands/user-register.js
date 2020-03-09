module.exports = {
    name: 'register',
    description: 'Handle your registration in the fleet manager.',
    usage: '[private]',
    aliases: ['deregister'],
    guildOnly: true,

    execute(message, args) {
        if (this.commandName === 'register') {
            request.post('user', {
                    userId: message.author.id,
                    guildId: message.guild.id,
                    public: args[0] === 'private' ? "no" : "yes",
                    username: message.author.username,
                    guildName: message.guild.name,
                },
                (json) => {
                    message.author.send('So happy to have you onboard! Just write "help" here to see what I can do for you.');
                    message.reply('welcome aboard, I have sent a DM to you with some information to get started.');
                },
                (json) => {
                    message.reply('sorry but we could not register you.\n*Computer says: ' + json.error + '*');
                },
                (err) => {
                    message.reply('sorry, but the registration failed.');
                });
        }
        if (this.commandName === 'deregister') {
            request.delete('user/' + message.author.id,
                (json) => {
                    message.reply('goodbye! Just mention me again with the "register" command, to join the cool kids again later.');
                },
                (json) => {
                    message.reply('sorry but we could not deregister you.\n*Computer says: ' + json.error + '*');
                },
                (err) => {
                    message.reply('sorry, but the deregistration failed to complete.');
                });
        }
    },
};
