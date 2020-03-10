global.Discord = require('discord.js');
global.client = new Discord.Client();
global.fetch = require('node-fetch');
global.fs = require('fs');
global.request = require('./lib/requests');

// Load commands from files in commands
client.commands = new Discord.Collection();
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    command.client = client;
    client.commands.set(command.name, command);
}

// Load configuration
const { token, urlPrefix } = require('./config.json');
request.prefix = urlPrefix;

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
    if (!args.length) return message.reply(`I hear you, but what do you want?`);
    const commandName = args.shift().toLowerCase();
    const command = client.commands.get(commandName)
        || client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));

    if (!command) return message.reply(`I am sorry but I do not understand you!`);

    command.setNameUsed(commandName);
    command.validate(message, args)
        .then((success) => {
            if (typeof success === 'object') {
                command.member = success.member;
                command.requiredRole = success.requiredRole;
                command.guild = success.guild;
                success = success.message;
            }
            console.log(command.usedName + ': ' + success);
            try {
                command.execute(message, args);
            } catch (error) {
                console.error(error);
                message.reply('there was an error trying to execute that command!');
            }
        })
        .catch((error) => {
            console.log('ERROR: ' + command.usedName + ' :: ' + error);
            message.reply(error);
        });
});

client.login(token);
