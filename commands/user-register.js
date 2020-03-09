module.exports = {
    name: 'register',
    description: 'Handle your registration in the fleet manager.',
    usage: '[private]',
    aliases: ['deregister'],
    guildOnly: true,

    execute(message, args) {
        if (this.commandName === 'register') {
            fetch('http://127.0.0.1:3000/user', {
                method: 'post',
                body: JSON.stringify({
                    userId: message.author.id,
                    guildId: message.guild.id,
                    public: args[0] === 'private' ? "no" : "yes",
                    username: message.author.username,
                    guildName: message.guild.name,
                }),
                headers: { 'Content-Type': 'application/json' },
            })
                .then(res => res.json())
                .then(json => {
                    if (json.success) {
                        message.author.send('So happy to have you onboard! Just write help here to get help.');
                        message.reply('welcome aboard, I have sent a DM to you with some information to get started.');
                    }
                    else {
                        console.log('register error', json);
                        message.reply('sorry but we could not register you.\n*Computer says: '+json.error+'*');
                    }
                })
                .catch(err => {
                    console.log('Error occured', err)
                    message.reply('sorry, but the registration failed.');
                });
        }
        if (this.commandName === 'deregister') {
            fetch('http://127.0.0.1:3000/user/'+message.author.id, {
                method: 'delete',
                headers: { 'Content-Type': 'application/json' },
            })
                .then(res => res.json())
                .then(json => {
                    if (json.success) {
                        message.reply('goodbye! Just mention me again with the "register" command, to join the cool kids again later.');
                    }
                    else {
                        console.log('deregister error', json);
                        message.reply('sorry but we could not deregister you.\n*Computer says: '+json.error+'*');
                    }
                })
                .catch(err => {
                    console.log('Error occured', err)
                    message.reply('sorry, but the deregistration failed to complete.');
                });
        }
    },
};
