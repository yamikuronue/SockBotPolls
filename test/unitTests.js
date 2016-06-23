'use strict';

const chai = require('chai'),
    sinon = require('sinon');

//promise library plugins
require('sinon-as-promised');
chai.use(require('chai-as-promised'));

chai.should();


const sockPolls = require('../src/sockpolls');

describe('sockPolls', () => {
    let sandbox, command;
    beforeEach(() => {
        sandbox = sinon.sandbox.create();
        command = {
            reply: sandbox.stub(),
            getPost: sandbox.stub().resolves({
                topicId: 'someChannel',
                authorId: 'someDude'
            }),
            args: []
        };
            
    });
    afterEach(() => {
        sandbox.restore();
    });

    describe('addPoll', () => {

        beforeEach(() => {
            sockPolls.polls = {};
        });

        it('Should create a poll', () => {
            command.args = ['who', 'is', 'better:', 'accalia', 'yamikuronue'];

            return sockPolls.addPoll(command).then(() => {
                //output
                command.reply.called.should.be.true;
                command.reply.firstCall.args[0].should.equal('Poll added. Let the voting commence!');

                //Internal state
                Object.keys(sockPolls.polls).should.contain('someChannel');
                sockPolls.polls.someChannel.should.be.an('object');
                sockPolls.polls.someChannel.creator.should.equal('someDude');
            });
        });
        
        it('Should not create a poll in a chan with a poll', () => {
            command.args = ['who', 'is', 'better:', 'accalia', 'yamikuronue'];
            sockPolls.polls.someChannel = {};

            return sockPolls.addPoll(command).then(() => {
                //output
                command.reply.called.should.be.true;
                command.reply.firstCall.args[0].should.equal('Please wait until the current poll in this channel is closed.');
            });
        });

        it('Should parse standalone colon', () => {
            command.args = ['who', 'is', 'better', ':', 'accalia', 'yamikuronue'];

            return sockPolls.addPoll(command).then(() => {
                //Internal state
                Object.keys(sockPolls.polls).should.contain('someChannel');
                sockPolls.polls.someChannel.should.be.an('object');
                sockPolls.polls.someChannel.question.should.equal('who is better:');
                Object.keys(sockPolls.polls.someChannel.options).should.contain('accalia');
                Object.keys(sockPolls.polls.someChannel.options).should.contain('yamikuronue');
            });
        });

        it('Should parse joined colon', () => {
            command.args = ['who', 'is', 'better:', 'accalia', 'yamikuronue'];

            return sockPolls.addPoll(command).then(() => {
                //Internal state
                Object.keys(sockPolls.polls).should.contain('someChannel');
                sockPolls.polls.someChannel.should.be.an('object');
                sockPolls.polls.someChannel.question.should.equal('who is better:');
                Object.keys(sockPolls.polls.someChannel.options).should.contain('accalia');
                Object.keys(sockPolls.polls.someChannel.options).should.contain('yamikuronue');
            });
        });
    });
    
    describe('vote', () => {
        beforeEach(() => {
            sockPolls.polls = {
                'someChannel': {
                    question: 'Vanilla or chocolate?',
                    options: {
                        'vanilla': 0,
                        'chocolate': 0
                    }
                }
            };
        });

        it('Should register a vote', () => {
            command.args = ['vanilla'];
            return sockPolls.vote(command).then(() => {
                command.reply.firstCall.args[0].should.equal('Your vote has been registered');
                sockPolls.polls.someChannel.options.vanilla.should.equal(1);
               
            });
        });
        
        it('Should register a vote for the right option', () => {
            command.args = ['chocolate'];
            return sockPolls.vote(command).then(() => {
                sockPolls.polls.someChannel.options.vanilla.should.equal(0);
                sockPolls.polls.someChannel.options.chocolate.should.equal(1);
            });
        });
        
        it('Should not register a vote for an invalid option', () => {
            command.args = ['strawberry'];
            return sockPolls.vote(command).then(() => {
                command.reply.firstCall.args[0].should.equal('That is not a valid option in this poll. Valid options are: vanilla chocolate');
                
                sockPolls.polls.someChannel.options.vanilla.should.equal(0);
                sockPolls.polls.someChannel.options.chocolate.should.equal(0);
            });
        });
        
        it('Should not register a vote if there is no poll', () => {
            command.args = ['vanilla'];
            sockPolls.polls = {};
            return sockPolls.vote(command).then(() => {
                command.reply.firstCall.args[0].should.equal('There is no active poll in this room');
            });
        });
    });
    
     describe('endPoll', () => {
        beforeEach(() => {
            sockPolls.polls = {
                'someChannel': {
                    question: 'Vanilla or chocolate?',
                    options: {
                        'vanilla': 5,
                        'chocolate': 6
                    },
                    creator: 'someDude'
                }
            };
        });
        
        it('Should close the poll', () => {
            return sockPolls.endPoll(command).then(() => {
                command.reply.firstCall.args[0].should.equal('Poll closed! The winner is chocolate with 6 votes!');
                Object.keys(sockPolls.polls).should.not.contain('someChannel');
            });
        });
        
        it('Should not close someone else\'s poll', () => {
            sockPolls.polls.someChannel.creator = 'someOtherDude';
            
            return sockPolls.endPoll(command).then(() => {
                command.reply.firstCall.args[0].should.equal('Only someOtherDude can close this poll');
                Object.keys(sockPolls.polls).should.contain('someChannel');
            });
        });
        
         it('Should not close a different poll', () => {
            sockPolls.polls.someOtherChannel = {
                question: 'Vanilla or chocolate?',
                options: {
                    'vanilla': 5,
                    'chocolate': 6
                },
                creator: 'someDude'
            };
            
            return sockPolls.endPoll(command).then(() => {
                Object.keys(sockPolls.polls).should.contain('someOtherChannel');
                Object.keys(sockPolls.polls).should.not.contain('someChannel');
            });
        });
        
        it('Should not close a nonexistant poll', () => {
            sockPolls.polls = {
                'someOtherChannel': {
                    question: 'Vanilla or chocolate?',
                    options: {
                        'vanilla': 5,
                        'chocolate': 6
                    },
                    creator: 'someDude'
                }
            };
            
            return sockPolls.endPoll(command).then(() => {
                command.reply.firstCall.args[0].should.equal('There is no active poll in this room');
                Object.keys(sockPolls.polls).should.contain('someOtherChannel');
            });
        });
        
     });
});
