const request = require('./requests');

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

    }
}
