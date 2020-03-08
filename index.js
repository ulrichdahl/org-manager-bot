const Discord = require('discord.js');
const client = new Discord.Client();

const fs = require('fs');

// Load commands from files in commands
client.commands = new Discord.Collection();
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    command.Discord = Discord;
	command.client = client;
	client.commands.set(command.name, command);
}

// Load configuration
const { token } = require('./config.json');

client.on('ready', () => {
    console.log('Bot is now connected!');
});

client.on('message', (message) => {
    // If this is a guild message and does not have prefix, or is from a bot then ignore it
    if ((message.channel.type === 'text' && !message.mentions.users.has(client.user.id)) || message.author.bot) return;

    var args = message.content.split(/ +/);
    // if this is a direct message, then remove the @user part
    if (message.channel.type === 'text') {
        args.shift();
    }
    const commandName = args.shift().toLowerCase();
	const command = client.commands.get(commandName)
		|| client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));

    if (!command) return message.reply(`I am sorry but I do not understand you!`);
    command.commandName = commandName;

    if (command.dmOnly && message.channel.type === 'text') {
		return message.reply(`I am sorry but I can only do that in DM, not in a server.`);
	}
    if (command.guildOnly && message.channel.type !== 'text') {
		return message.reply(`I am sorry but I can only do that in a server, not in DM.`);
	}

    if (command.onlyGuildId && (!message.guild || Number(message.guild.id) !== Number(command.onlyGuildId))) {
        return message.reply(`I am not allowed to do that here!`);
    }

    message.authorIsAdmin = false;
    if (message.guild) {
        const adminRole = message.guild.roles.cache.find(r => r.name === "admin");
        if (adminRole) {
            message.authorIsAdmin = message.member.roles.cache.has(adminRole.id);
        }
    }
    if (command.onlyAdmins && !message.authorIsAdmin) {
        return message.reply(`you are not allowed to do that!`);
    }

    if (command.args && args.length !== command.args) {
		return message.reply(`I am sorry but I require more information!\nUsage: `+command.usage);
	}

	try {
		command.execute(message, args);
	} catch (error) {
		console.error(error);
		message.reply('there was an error trying to execute that command!');
	}
});

client.login(token);
