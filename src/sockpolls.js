'use strict';

exports.polls  =  {};

/**
 * Plugin generation function.
 *
 * Returns a plugin object bound to the provided forum provider
 *
 * @param {Provider} forum Active forum Provider
 * @returns {Plugin} An instance of the Echo plugin
 */
exports.plugin = function plugin(forum) {
    
    /**
     * Activate the plugin.
     *
     * Register the command `echo` to the forum instance this plugin is bound to
     *
     * @returns {Promise} Resolves when plugin is fully activated
     */
    function activate() {
        return Promise.all([
            forum.Commands.add('addPoll', 'Add a poll. One per channel. ' +
                'Usage: `!addPoll where shold we go for lunch?: Applebees TGI_Fridays Nowhere`', addPoll),
            forum.Commands.add('vote', 'Vote in a current poll. Usage: `!vote Applebees`', vote),
            forum.Commands.add('closePoll', 'Close the poll in this room. Creator of poll only.', endPoll),
            forum.Commands.addAlias('endPoll', endPoll),
            forum.Commands.addAlias('close', endPoll),
            forum.Commands.addAlias('poll', addPoll)
        ]);
    }

    return {
        activate: activate,
        deactivate: () => {},
    };
};

    
function addPoll(command) {
    return command.getPost().then((post) => {
        const chan = post.topicId;
        
        if (exports.polls[chan]) {
            return command.reply('Please wait until the current poll in this channel is closed.');
        }
        
        let question = '';
        const options = {};
        let answers = false;
        
        for (let i = 0; i < command.args.length; i++) {
            if (!answers && command.args[i]  === ':') {
                question = command.args.slice(0, i).join(' ') + ':';
                answers = true;
                continue;
            }
            
            if (!answers && command.args[i].substr(command.args[i].length - 1) === ':') {
                question = command.args.slice(0, i + 1).join(' ');
                answers = true;
                continue;
            }
            
            if (answers) {
                options[command.args[i].toLowerCase()] = 0;
            }
        }
        
        exports.polls[chan] =  {
            question: question,
            creator: post.authorId,
            options: options
        };

        return command.reply('Poll added. Let the voting commence!');
    }).catch((err) => {
        return command.reply('ERR_' + err);
    });
}

function vote(command) {
    const option = command.args[0].toLowerCase();
    const polls = exports.polls;
    
     return command.getPost().then((post) => {
        const chan = post.topicId;
        if (!polls[chan]) {
            return command.reply('There is no active poll in this room');
        }
        
        if (!(option in polls[chan].options)) {
            return command.reply('That is not a valid option in this poll. Valid options are: ' + Object.keys(polls[chan].options).join(' '));
        }
        
        polls[chan].options[option]++;
        return command.reply('Your vote has been registered');
    });
}

function endPoll(command) {
     const polls = exports.polls;
     return command.getPost().then((post) => {
        const chan = post.topicId;
        if (!polls[chan]) {
            return command.reply('There is no active poll in this room');
        }
        
        if (post.authorId !== polls[chan].creator) {
            return command.reply('Only ' + polls[chan].creator + ' can close this poll');
        }
        
        const arrOptions = Object.keys(polls[chan].options);
        let maxVotes = 0;
        let winner = arrOptions[0];
       
        
        for (let i = 0; i < arrOptions.length; i++) {
            if (polls[chan].options[arrOptions[i]] >  maxVotes) {
                winner = arrOptions[i];
                maxVotes = polls[chan].options[arrOptions[i]];
            }
        }
        
        delete polls[chan];
        const text = `Poll closed! The winner is ${winner} with ${maxVotes} votes!`;
        return command.reply(text);
    });
}

exports.addPoll = addPoll;
exports.vote = vote;
exports.endPoll = endPoll;
