module.exports = {
	name: 'users',
	description: 'Show what servers the bot is connected to.',
    onlyAdmins: true,
    guildOnly: true,
    args: 0,
    usage: '',

	execute(message) {
        // find
		const embed = new this.Discord.MessageEmbed();
        embed.setTitle('Current users registered in '+message.guild.name);
        embed.addField('1: Kaptajnen[KaptajnDahl]', '5 ships', true);
        embed.addField('2: ImpKeeper', '82 ships', true);
        embed.addField('3: [ᑌᖴᗪ] ᔕᑭᗩᑕEY', '28 ships', true);
        embed.addField('4: Scottio', '19 ships', true);
        embed.setFooter('Total ships in org fleet: '+87);
        message.author.send(embed);
	},
};
