const request = require('./requests');
const zlib = require('zlib');

module.exports = class Command {
    name = '';
    aliases = [];
    args = [];
    usage = '';

    // The command name that was actually used, in case of there being aliases
    usedName = '';
    // The discord client
    client = null; 

    // Filter for only use command in DM's
    dmOnly = false;
    // Filter for only use command outside DM's
    guildOnly = false;
    // Filter to only use outside DM's in a specific guild/server
    onlyGuildId = null;

    // Filter to require the registered user to have a specific role
    requireRole = '';
    // Filter if the role exists in the guild, then require the registered user to have a specific role
    ifRoleExists = '';

    // Store the guild, guild roles and the member user of the guild, used internally
    guild;
    roles;
    member;

    setNameUsed(name) {
        this.usedName = name;
    }

    validate(message, args = []) {
        let _cmd = this;
        return new Promise((resolve, reject) => {
            if (_cmd.dmOnly && message.channel.type === 'text') {
                return reject(`I am sorry but I can only do that in DM, not in a server.`);
            }
            if (_cmd.guildOnly && message.channel.type !== 'text') {
                return reject(`I am sorry but I can only do that in a server, not in DM.`);
            }
    
            if (_cmd.onlyGuildId && (!message.guild || Number(message.guild.id) !== Number(_cmd.onlyGuildId))) {
                return reject(`I am not allowed to do that here!`);
            }
            
            if (args.length < _cmd.args.length) {
                return reject(`I am sorry but I require more information!\nUsage: ` + _cmd.usage);
            }

            if (_cmd.requireRole !== '') {
                request.get('user/' + message.author.id,
                    (json) => {
                        const guild = client.guilds.cache.find(g => g.id === json.user.orgId);
                        const requiredRole = guild.roles.cache.find(r => r.name === _cmd.requireRole);
                        const member = guild.members.cache.find(u => u.id === message.author.id);
                        if (member.roles.cache.has(requiredRole.id)) {
                            return resolve({
                                message: 'message command validated, member has required role', 
                                guild: guild, 
                                requiredRole: requiredRole, 
                                member: member
                            });
                        }
                        else {
                            return reject('sorry, but you are not an admin in your organization!');
                        }
                    }, 
                    (json) => {
                        return reject('sorry but you do not seem to be registered!');
                    },
                    (err) => {
                        return reject('sorry, but the deregistration failed to complete.');
                    }
                );
            }
            else {
                return resolve('message command validated');
            }
        });
    }

    execute(message, args) {
        console.log('You need to implement what your command "'+this.name+'" needs to do!');
    }

    handleConversation(message, args, dataMessage) {
        let data = {};
        if (!dataMessage) {
            // We are showing the first question in the conversation, initialize the data object.
            data = {
                command: this.name,
                args: args,
                next: Object.keys(this.conversations[args[0]])[0],
                values: {},
            };
        }
        else {
            data = Command.decodeFooter(dataMessage);
        }

        // If question is multiple choice, fetch the chosen next question
        if (typeof data.next === 'object') {
            // TODO validate that it was the correct option
            data.next = data.next[String(message.content).toLowerCase()];
        }
        let currentQuestion = data.next;
        let preStep = this.conversations[args[0]][data.prev];
        let curStep = this.conversations[args[0]][currentQuestion];

        // initialize the values element for this questioon
        if (data.values[currentQuestion] === undefined) {
            if (curStep.getAttachementUri) {
                data.values[currentQuestion] = {uri: ''};
            } else if (curStep.pushToArray) {
                data.values[currentQuestion] = [];
            } else {
                data.values[currentQuestion] = '';
            }
        }

        // --- Handle answer
        // if we have asked a question by seeing the value store is initialized, then save the answer
        console.log('Saving answer to '+data.prev, typeof data.values[data.prev], message.content);
        if (data.values[data.prev] !== undefined) {
            // TODO validate the answer based on regex match, etc.
            if (typeof data.values[data.prev] === 'object') {
                if (Array.isArray(data.values[data.prev])) {
                    data.values[data.prev].push(message.content);
                }
                else {
                    data.values[data.prev].uri = message.attachments.first().url;
                }
            }
            else {
                if (typeof curStep.choices === 'string') {
                }
                data.values[data.prev] = message.content;
            }
        }
        console.log('Saved value', data.values[data.prev]);

        // --- Prepare next question
        let desc = '';
        let prevValue = data.values[data.prev];
        if (curStep.help) {
            desc += curStep.help + '\n';
        }
        console.log('step.choices', typeof curStep.choices, curStep.choices);
        if (curStep.choices) {
            desc += 'Please choose one of the following values, by writting the number for the value in your message to me:\n```\n';
            let stepChoices = curStep.choices;
            if (typeof curStep.choices === 'string') {
                const choices = String(curStep.choices).split(/\|/g);
                const filename = choices.shift();
                const choicesData = require(filename);
                // This is a first level question, so get values from the key
                stepChoices = choicesData.map(m => { return m[choices[0]] });
                if (choices.length === 2) {
                    // This is a second level question, so use first answer to get values
                    prevValue = stepChoices[prevValue - 1];
                    stepChoices = choicesData.find(m => m[choices[0]] === prevValue)[choices[1]];
                }
            }
            // Add choices to description
            stepChoices.forEach((choice, i) => {
                desc += (i + 1) + ') ' + choice + '\n';
            });
            desc += '```\n';
        }
        data.prev = data.next;
        data.next = curStep.next;

        const embed = new Discord.MessageEmbed();
        embed.setDescription(desc);
        embed.setTitle(String(curStep.question).replace(':prevValue', prevValue));
        Command.encodeFooter(embed, data);
        message.reply(embed);
    }

    static decodeFooter(message) {
        if (message.embeds.length) {
            //return JSON.parse(zlib.inflateSync(Buffer.from(message.embeds[0].footer.text, 'base64')));
            return JSON.parse(message.embeds[0].footer.text);
        }
        else {
            return false;
        }
    }

    static encodeFooter(embed, data) {
        //embed.setFooter(zlib.deflateSync(JSON.stringify(data)).toString('base64'));
        embed.setFooter(JSON.stringify(data));
    }
}
