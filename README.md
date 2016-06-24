# SockBotPolls
[![Build Status](https://travis-ci.org/yamikuronue/SockBotPolls.svg?branch=master)](https://travis-ci.org/yamikuronue/SockBotPolls)

Polls, for sockbot! This is intended for chat-like clients, but it will work just fine in forum-like clients. 

##Installation
See [Sockbot](https://github.com/SockDrawer/SockBot) install instructions.

##Usage
* `!addPoll` or just `!poll` to start a new poll. You must include a colon so it knows where the question stops and the answers begin; answers are separated by a space. One poll may be open per topic.
** Example: `!poll Which is better? : Chocolate Vanilla`
** Example: `!addPoll Which is better: Chocolate Vanilla`
* `!vote [option]` to cast a vote. 
* `!close` or `!endPoll` to close the poll and output the winner. 

##Sample output
```
yamikuronue [1:12 PM]  
!addPoll which is better: chocolate or vanilla

sockbot BOT [1:12 PM]  
Poll added. Let the voting commence!

yamikuronue [1:12 PM]  
!vote vanilla

sockbot BOT [1:12 PM]  
Your vote has been registered

yamikuronue [1:12 PM]  
!close

sockbot BOT [1:13 PM]  
Poll closed! The winner is vanilla with 1 votes!
```
