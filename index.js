global.Discord = require('discord.js');
global.client = new Discord.Client();
global.fetch = require('node-fetch');
global.fs = require('fs');
global.request = require('./lib/requests');

const Command = require('./lib/command');

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

    message.channel.messages.fetch({ limit: 10 })
        .then(messages => {
            let command = null;
            try {
                messages.forEach(m => {
                    // Was this my message?
                    if (m.author.id === client.user.id) {
                        //console.log('I said: ', m);
                        if (m.embeds.length) {
                            console.log('command of last reply: ', m.embeds[0].footer.text);
                        }
                    }
                    else {
                        console.log('User said: ', m.content);
                        var args = message.content.split(/ +/);
                        // if this is a direct message, then remove the @user part
                        if (message.channel.type === 'text') {
                            args.shift();
                        }
                        const commandName = args.shift().toLowerCase();
                        command = client.commands.get(commandName)
                            || client.commands.find(c => c.aliases && c.aliases.includes(commandName));
                        if (command) {
                            command.setNameUsed(commandName);
                            console.log('Found command', command.name);
                            throw [command, args, message];
                        }
                    }
                });
            }
            catch (c) {
                command = c[0];
                args = c[1];
                message = c[2];
            }
            if (!command) throw `I am sorry but I do not understand you!`;
            return {command: command, args: args, message: message};
        })
        .then(dataset => {
            const command = dataset.command;
            const args = dataset.args;
            const message = dataset.message;
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
                        throw 'there was an error trying to execute that command!';
                    }
                })
                .catch((error) => {
                    console.log('ERROR: ' + command.usedName + ' :: ' + error);
                    message.reply(error);
                });
        })
        .catch(e => {
            message.reply(e);
        });
});

client.login(token);
