module.exports = {
	name: 'register',
	description: 'Handle your registration in the fleet manager.',
    usage: 'register/deregister (only works in a server, not in DM)',
    aliases: ['deregister'],
    guildOnly: true,

	execute(message) {
        if (this.commandName === 'register') {
            // TODO: Register the user and the guild/server as the org
            // If the user is already signed up, then send a message that he will have to deregister in the old server first
            message.author.send('So happy to have you onboard! Just write help here to get help.');
            message.reply('welcome aboard, I have sent a DM to you with information');
        }
        if (this.commandName === 'deregister') {
            // TODO: Deregister the user and the guild/server as the org
            message.reply('goodbye! Just mention me again with the "register" command, to join the cool kids again later.');
        }
	},
};
