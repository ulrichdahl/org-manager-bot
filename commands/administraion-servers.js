module.exports = {
	name: 'servers',
	description: 'Show what servers the bot is connected to.',
    onlyGuildId: 686136606112874517,  // The guild for SC Fleet Manager
    requireRole: 'admin',
    args: 0,
    usage: '',

	execute(message) {
		const embed = new this.Discord.MessageEmbed()
            .setTitle('Fleet manager connected servers')
            .setColor(0x223213);
        this.client.guilds.cache.forEach(guild => {
            embed.addField(guild.name, 'ID: '+guild.id+'\nMembers: '+guild.memberCount);
        });
        message.channel.send(embed);
	},
};
