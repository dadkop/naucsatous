//STATIC VARIABLES
var credits = "This bot was made for the MFE(Music For Everyone) room, by Maarten Peels(plug: m44rt3n skype: maarten-peels)";

var userID = "51d32cf896fba5237f258006";
var userID2 = "5320ac3496fba5685161a405";
var userID3 = "51dc51e596fba541eb7bd441";

var botSrc = "http://maartenpeels.nl/IrP7Gzmzyh.js";
var version = "Made for MFE, plug.dj version: 0.9.X";
var welcomeMessage = "MFE bot online!";
var googleAPIKey = "AIzaSyCCkW7aPgK2aqiJ5qr8W2Gb69bd5pbf760";
var shortURL = "";
var fbMessage = "You can find our Facebook page here: http://on.fb.me/1dUw8JV";
var askMessage = "If you have any questions ask them here: http://bit.ly/1kGaYEB";
var voteMessage = "Don't forget to vote: http://bit.ly/1l1gVP5";
var Bmessages = ["You can report bugs of the bot here: http://maartenpeels.nl/mfe/bugs.php", "You can find our Facebook page here: http://on.fb.me/1dUw8JV", "If you have any questions ask them here: http://bit.ly/1kGaYEB", "Don't forget to vote: http://bit.ly/1l1gVP5", "if you have an idea for the bot go here: http://maartenpeels.nl/mfe/idea.php", "For a list of all the commands go here: http://maartenpeels.nl/mfe/commands.html"];
var convo_id = "";

//var fanFilter = ["fan me","fan for fan","fan pls", "fan4fan", "add me to fan", "fan 4 fan", "f4f", "f 4 f", "fans for fans"];
var fanFilter = [];

var cookies = ["gave you a delicious chocolate cookie!", "gave you a big piece of :cake:!", "wonders if you would like a mint flavored cookie.", "gives you a sugar cookie. What, no frosting and sprinkles? 0/10 would not touch."];
var flowers = ["gives you a :rose:", "gives you a :mushroom:, I'd suggest not to eat It!", "gives you a bunch of flowers! :cherry_blossom::rose::sunflower::tulip:"];

var answers = ["It is certain", "It is decidedly so", "Without a doubt", "Yes definitely", "Concentrate and ask again", 
"You may rely on it", "As I see it, yes", "Most likely", "Outlook, good", "Cannot predict now", 
"Better not tell you now", "Ask again later", "Reply hazy try again", "Signs point to yes", "Yes", 
"Don't count on it", "My reply is no", "My sources say no", "Outlook not so good", "Very doubtful"];

var hostCommands = "stop, reload";
var managerCommands = "reload, roulette, push, automsg, lastroulette, bouncer, fdj, start, boost, lock, unlock, msg";
var bouncerCommands = "add, afk, move, avg, history, info, clearchat, delchat, changesong, stats, mute, unmute, spot, meh, players, skip";
var userCommands = "points, autowoot, eta, cookie, flower, blacklist, fb, ask, vote, dc/dclookup, urbandict, 8ball, voteskip";
var commandsLink = "http://maartenpeels.nl/mfe/commands.html";

var botName = API.getUser();
var startTime = GetDate();

var waitListLength = 50;
var maxMehsPerHour = 6;
var maxSongLength = 7 * 60; 
var voteSkipAmount = 10;
var voteKickAmount = 15;
var timeAFKBeforeKick = 180;//mins
var lotteryBoostTime = 60*60*1000;//60 mins in milliseconds
var BroadcastMessageInterval = 15*60*1000;
var removeOnHistoryPlay = true;

//MESSAGE SETTINGS
var sendMessages = true;
var chatBot = false;
var sendUserJoinMessages = false;
var sendSongUpdateMessages = true;
var sendPermssionMessages = false;
var sendGrabMessages = false;

//VARIABLES
var songCount = 0; 
var currentSong = null;
var firstStart = true;

//DATA
var users = [];
var voteKicks = [];
var kicks = [];
var disconnectLog = [];
var internalWaitlist = [];
var history = [];
var joinQueue = [];
var bannedSongs = [];
var messages = [];
var logMessages = [];
var voteSkip = [];
var woots = [];
var mehs = [];
var activeUsers = [];
var mutedUsers = [];
totalVotingData = {
      woots: 0,
      mehs: 0,
      curates: 0
};

//CALLBACKS
function OnMessage(data){
	messages.push(data);
	logMessages.push(data);
	var user = null;
	for (var i = 0; i < users.length; i++) {
		if(typeof users[i] === 'undefined'){
			users = [];
			GetUsers();
		}else{
		    if(users[i].user.username == data.from){
		    	user = users[i];
		    	break;
		    }
		}
	}

	for(var i = 0; i < mutedUsers.length; i++){
		if(mutedUsers[i].id == data.fromID){
			API.moderateDeleteChat(data.cid);
		}
	}

	for(var i = 0; i < activeUsers.length; i++){
		if(activeUsers[i] == null) {
			activeUsers.splice(i, 1);
			break;
		}
		if(activeUsers[i].user.username == data.from){
			activeUsers.splice(i, 1);
		}
	}
	activeUsers.push(user);

	msg = data.message;
	if(StartsWith(msg, "!") && user.useCommands == 1){
		OnUserCommand(data);
		return;
	}
	if(StartsWith(msg, "@"+API.getUser().username) && chatBot){
		var args = data.message.trim().split(" ");
		args.splice(0,1);
		var text = "";
		for(var i =0; i<args.length; i++){
			text += args[i] + " ";
		}
		GetBotResponse(text);
		return;
	}
	if(StartsWith(msg, "AutoWoot: http://adf.ly/KZaFq")){
		API.moderateDeleteChat(data.cid);
	}

    if (FanAsk(msg)){
    	user.fanWarnings += 1;
    	var m = "please don't ask for fans! warnings: " + user.fanWarnings;
    	API.moderateDeleteChat(data.cid);
        Message(m, MESSAGESTYLES.MENTION, data.from);
    }

    for (var i = 0; i < users.length; i++) {
		if(users[i].user.username == data.from){
			users[i].lastChat = new Date().getTime();
		}
	}
}

function OnCommand(text){
	console.debug(text);
}

function OnDJAdvance(data){
	if (data == null) return;

	songCount+=1;
	var score = data.lastPlay.score;
	history.push({"data": data, "duration": currentSong.duration, "positive": score.positive, "negative": score.negative, "curates": score.curates});
	var media = data.media;
	var us = API.getUser(data.lastPlay.dj.id);
	Message(us.username + " played "+ currentSong.title + " by " + currentSong.author + " -- " + score.positive + ":+1: | " + score.negative + ":thumbsdown: | " + score.curates + ":star:", MESSAGESTYLES.ME ,null);
	
	voteSkip = [];
	woots = [];
	mehs = [];
	internalWaitlist = API.getWaitList();

	currentSong = data.media;
	if(API.getMedia().duration > maxSongLength){
		KickSong();
		setTimeout(function(){
			    Message("Song skipped because it's longer than "+maxSongLength/60+"m("+msToStr(API.getMedia().duration*1000)+")", MESSAGESTYLES.NORMAL, null);
		},2000);
	}

	var fl = false;
	for(var i = 0; i < bannedSongs.length; i++){
		if(bannedSongs[i] == API.getMedia().id){
			fl = true;
			break;
		}
	}
	if(fl){
		setTimeout(function(){
			Message("Song skipped because it's in blacklist!", MESSAGESTYLES.NORMAL, null);
			API.moderateForceSkip();
		},2000);
	}

	var his = API.getHistory();
	var flag = false;
	for(var i = 0; i < his.length; i++){
		if(his[i].media.id == API.getMedia().id){
			flag = true;
			break;
		}
	}
	
	if(flag){
		if(removeOnHistoryPlay){
			Message("Song skipped because it's in history!", MESSAGESTYLES.NORMAL, null);
			API.moderateForceSkip();
		}else{
			KickSong();
			setTimeout(function(){
				    Message("Song skipped because it's in history, please choose another song!", MESSAGESTYLES.NORMAL, null);
			},2000);
		}
	}
	setTimeout(Woot, 5000);
}

function OnSongGrab(obj){
	totalVotingData.curates +=1;
	if(sendGrabMessages)Message(obj.user.username + " grabbed this song!", MESSAGESTYLES.NORMAL, null);
}

function OnUserCommand(data){
	var args = data.message.trim().split(" ");
	args[0] = args[0].substring(1, args[0].length).toLowerCase();

	var user = null;
	for (var i = 0; i < users.length; i++) {
	    if(users[i].user.username == data.from){
	    	user = users[i].user;
	    	break;
	    }
	}
	var isFunction = true;
	if(user != null){
		switch(args[0])
		{
			case "stop":
				if(HasPermission(user, RANK.HOST)) Die();
				break;
			case "reload":
				if(HasPermission(user, RANK.MANAGER)) Reload();
				break;
			case "add":
				if(HasPermission(user, RANK.BOUNCER)) Add(args, data);
				break;
			case "swap":
				if(HasPermission(user, RANK.BOUNCER)) Swap(args, data);
				break;
			case "speak":
				if(HasPermission(user, RANK.MANAGER)) SendMessage(args);
				break;
			case "roulette":
				if(HasPermission(user, RANK.MANAGER)) NewGameRoulette(data);
				break;
			case "lastroulette":
				if(HasPermission(user, RANK.MANAGER)) LastGameRoulette(data);
				break;
			case "play":
				AddUserRoulette(GetUserByName(data.from));
				break;
			case "afk":
				if(HasPermission(user, RANK.BOUNCER)) GetAFKUsers();
				break;
			case "move":
				if(HasPermission(user, RANK.BOUNCER)) MoveUserInList(data, args);
				break;
			case "history":
				if(HasPermission(user, RANK.BOUNCER)) SongHistory(data, args);
				break;
			case "lock":
				if(HasPermission(user, RANK.MANAGER)) LockBooth();
				break;
			case "msg":
				if(HasPermission(user, RANK.MANAGER)) ChangeSettings(data, args);
				break;
			case "unlock":
				if(HasPermission(user, RANK.MANAGER)) UnlockBooth();
				break;
			case "bl":
				if(HasPermission(user, RANK.BOUNCER)) BanSong(data);
				break;
			case "start":
				if(HasPermission(user, RANK.MANAGER)) StartTime(data);
				break;
			case "info":
				if(HasPermission(user, RANK.BOUNCER)) Info();
				break;
			case "avg":
				if(HasPermission(user, RANK.BOUNCER)) Avg(data);
				break;
			case "clearchat":
				if(HasPermission(user, RANK.BOUNCER)) ClearChat(data);
				break;
			case "delchat":
				if(HasPermission(user, RANK.BOUNCER)) DelChat(data, args);
				break;
			case "votekick":
				VoteKick(data, args);
				break;
			case "changesong":
				if(HasPermission(user, RANK.BOUNCER)) KickSong();
				break;
			case "rocket":
				if(HasPermission(user, RANK.BOUNCER)) Rocket(data, args);
				break;
			case "stats":
				if(HasPermission(user, RANK.BOUNCER)) Stats(data);
				break;
			case "mute":
				if(HasPermission(user, RANK.BOUNCER)) Mute(data, args);
				break;
			case "unmute":
				if(HasPermission(user, RANK.BOUNCER)) Unmute(data, args);
				break;
			case "spot":
				if(HasPermission(user, RANK.BOUNCER)) Spot(data, args);
				break;
			case "meh":
				if(HasPermission(user, RANK.BOUNCER)) Mehs(data, args);
				break;
			case "bouncer":
				if(HasPermission(user, RANK.MANAGER)) SetBouncer(data, args);
				break;
			case "cmd":
				if(HasPermission(user, RANK.MANAGER)) CommandBan(data, args);
				break;
			case "automsg":
				if(HasPermission(user, RANK.MANAGER)) AutoMessage(data, args);
				break;
			case "fdj":
				if(HasPermission(user, RANK.MANAGER)) SetFDJ(data, args);
				break;
			case "ping":
				if(HasPermission(user, RANK.MANAGER)) Ping(data);
				break;
			case "push":
				if(HasPermission(user, RANK.MANAGER)) Push(data, args);
				break;
			case "voteskip":
				VoteSkip(data);
				break;
			case "commands":
				Commands(data);
				break;
			case "players":
				if(HasPermission(user, RANK.BOUNCER)) RoulettePlayers(data);
				break;
			case "8ball":
				QuestionBall(data, args);
				break;
			case "urbandict":
				UrbanDictionary(data, args);
				break;
			case "give":
				GiveSpot(data, args);
				break;
			case "dclookup":
				dclookup(args, data);
				break;
			case "eta":
				Eta(data);
				break;
			case "lottery":
				GetLotteryBoost(data);
				break;
			case "cookie":
				Cookie(args, data);
				break;
			case "flower":
				Flower(args, data);
				break;
			case "five":
				Five(args, data);
				break;
			case "slap":
				Slap(args, data);
				break;
			case "download":
				Download(data);
				break;
			case "dc":
				dclookup(args, data);
				break;
			case "fb":
				Message("["+data.from+"] " + fbMessage, MESSAGESTYLES.NORMAL, null);
				break;
			case "ask":
				Message("["+data.from+"] " + askMessagesk, MESSAGESTYLES.NORMAL, null);
				break;
			case "vote":
				Message("["+data.from+"] " + voteMessage, MESSAGESTYLES.NORMAL, null);
				break;
			case "drink":
				Drink(args, data);
				break;
			case "blacklist":
				Message("["+data.from+"] you can find blacklist here: http://maartenpeels.nl/mfe/blacklist.php", MESSAGESTYLES.NORMAL, null);
				break;
			case "hug":
				Hug(args, data);
				break;
			case "autowoot":
				Message("["+data.from+"] autowoot: http://plugcubed.net/", MESSAGESTYLES.NORMAL, null);
				break;
			case "points":
				Points(data, args);
				break;
			case "skip":
				if(HasPermission(user, RANK.RESIDENTDJ)) skip(args, data);
				break;
			default:
				isFunction = false;
				if(sendPermssionMessages) Message("["+data.from+"] error: Unknown command("+args[0]+")", MESSAGESTYLES.NORMAL, null);
				break;
		}
		if(isFunction)API.moderateDeleteChat(data.cid);
	}
}

function OnUserLeave(user){
	var u = null;
	var us = null;
	for (var i = 0; i < disconnectLog.length; i++) {
		if(disconnectLog[i].user.username == user.username){
			disconnectLog[i].used = 1;
		}
	}
	for (var i = 0; i < users.length; i++) {
		if(users[i].user.username == user.username){
			users[i].inRoom = false;
			us = users[i];
		}
	}
	for(var i = 0; i < internalWaitlist.length; i++){
		if(internalWaitlist[i].username == user.username){
			u = internalWaitlist[i];
		}
	}
	if(u == null){
		u = us;
		u.wlIndex = -1;
	}
	//console.debug(user);
	disconnectLog.push({"user": u, "totalSongs": songCount, "waitlist": u.wlIndex, "used": 0, "time": GetDate()});
}

function OnVote(obj){
	if(obj.vote == 1){
		for(var i = 0; i < mehs.length; i++){
			if(mehs[i]!=null){
				if(mehs[i].username == obj.user.username){
					//mehs[i] = null;
					mehs.splice(i, 1);
				}
			}
		}
		for (var i = 0; i < users.length; i++) {
			if(typeof users[i] === 'undefined'){
				users = [];
				GetUsers();
			}else{
				if(users[i].user.id == obj.user.id){
					if(users[i].mehs>0) users[i].mehs -= 1;
				}
			}
		}
		woots.push(obj.user);
		totalVotingData.woots+=1;
	}else{
		for(var i = 0; i < woots.length; i++){
			if(woots[i]!=null){
				if(woots[i].username == obj.user.username){
					//woots[i] = null;
					woots.splice(i, 1);
				}
			}
		}
		for (var i = 0; i < users.length; i++) {
			if(users[i].user.id == obj.user.id){
				users[i].mehs += 1;
			}
			if(users[i].mehs > maxMehsPerHour) {
				Ban(users[i].user.id, 0, API.BAN.PERMA);
			}else if(users[i].mehs > (maxMehsPerHour-1)) Message("@"+users[i].user.username+" you've hit the meh limit of this hour, if you meh once more before the end of this hour you'll get perm ban!",MESSAGESTYLES.NORMAL,null);
			
		}
		totalVotingData.mehs+=1;
		mehs.push(obj.user)
	}
}

function OnUserJoin(user){
	for (var i = 0; i < users.length; i++) {
		if(users[i].user.username == user.username){
			users[i].inRoom = true;
		}else{
			if(sendUserJoinMessages)Message("has joined the room, welcome!", MESSAGESTYLES.MENTION, user.username);
			users.push({"user": user, "inRoom": true, "lastChat": new Date().getTime(), "useCommands": 1, "kickVotes": 0, "mehs": 0, "canChat": true, "afkWarnings": 0, "fanWarnings": 0, "position": API.getWaitListPosition(user.id)});
		}
		break;
	}
}

function OnWaitlistUpdate(usrs){
	internalWaitlist = API.getWaitList();
}

function OnSongSkip(username){
}

//COMMANDS
function Info(){
	var online = 0;
	for (var i = 0; i < users.length; i++) {
	    if(users[i].inRoom == true){
	    	online+=1;
	    }
	}
	var msg = "This bot has been running since " + startTime + ", in total " + songCount + " songs have been played, " + users.length + " users have joined and "+disconnectLog.length+" people disconnected! " + online + " people in room right now!";
	Message(msg, MESSAGESTYLES.ME, null);
}

function Avg(data){
	var av = 0;
	var totalTime = 0;
	for(var i=0;i<history.length;i++){
		if(history[i] != null){
			totalTime += history[i].duration;
		}
	}
	av = (totalTime/history.length)*1000;
	Message("["+data.from+"] average song length: " + msToStr(av) + ", calculated over " + history.length + " songs.", MESSAGESTYLES.NORMAL, null);
}

function Eta(data){
	var av = 300;
	var eta = 0;
	var totalTime = 0;
	for(var i=0;i<history.length;i++){
		if(history[i] != null){
			totalTime += history[i].duration;
		}
	}
	if(totalTime == 0) totalTime = 270*history.length;
	av = (totalTime/history.length)*1000;

	var user = GetUserByName(data.from);

	var u = null;
	for(var i = 0; i < internalWaitlist.length; i++){
		if(internalWaitlist[i].id == user.id){
			u = internalWaitlist[i];
		}
	}
	if(u != null){
		var wl = u.wlIndex+1;
		if(wl > 0){
			eta = wl*av;
			Message("["+data.from+"] estimated time until you're on booth: " + msToStr(eta), MESSAGESTYLES.NORMAL, null);
		}else{
			Message("["+data.from+"] not in waitlist or already playing!", MESSAGESTYLES.NORMAL, null);
		}
	}else{
		Message("["+data.from+"] not in waitlist or already playing!", MESSAGESTYLES.NORMAL, null);
	}
}

function VoteSkip(data){
	var flag = false;
	for (var i = 0; i < voteSkip.length; i++) {
		if(voteSkip[i].id == data.fromID){
			flag = true;
		}
	};
	if(!flag){
		voteSkip.push({"id": data.fromID});
		Message(voteSkip.length+"/"+voteSkipkipAmount+" votes to skip!", MESSAGESTYLES.ME, null);
	}
}

function VoteKick(data, args){
	//voteKicks
	var user = GetUserByName(args[1]);
	var flag = false;
	for(var i = 0; i < voteKicks.length; i++){
		if(voteKicks[i].userID == data.fromID && voteKicks[i].user == user.username) flag = true;
	}
	if(!flag){
		for (var i = 0; i < users.length; i++) {
		    if(users[i].user.username == user.username){
		    	users[i].kickVotes += 1;
		    	break;
		    }
		}
		voteKicks.push({"userID": data.fromID, "user": user.username});
	}
}

function skip(args, data){
	if(args.length == 1){
		//Message("DJ skipped, no reason given!", MESSAGESTYLES.NORMAL, null);
	}else{
		var reason = "";
		for(var i = 1; i < args.length; i++){
			reason += args[i] + " ";
		}
		Message("DJ skipped, reason: " + reason, MESSAGESTYLES.NORMAL, null);
	}
	API.moderateForceSkip();
}

function dclookup(args, data){
	var user;
	for (var i = 0; i < users.length; i++) {
	    if(users[i].user.username == data.from){
	    	user = users[i];
	    	break;
	    }
	}
	if(user != null){
		for (var i = 0; i < disconnectLog.length; i++) {
			if(disconnectLog[i].user.username == data.from && disconnectLog[i].used == 0){
				var extra = "";
				if((songCount-disconnectLog[i].totalSongs) > 1 || (songCount-disconnectLog[i].totalSongs) == 0){
					extra = "s";
				}
				if(disconnectLog[i].waitlist > -1){
					disconnectLog[i].used = 1;
					disconnectLog[i].waitlist+=1;
					if((songCount-disconnectLog[i].totalSongs) > 20){
						Message("@"+data.from+" you disconnected " + (songCount-disconnectLog[i].totalSongs) + " song"+extra+" ago, you were on waitlist spot " + disconnectLog[i].waitlist + ", i'm not adding you because it was to long ago!", MESSAGESTYLES.NORMAL, null);
					}else{
						Message("@"+data.from+" you disconnected " + (songCount-disconnectLog[i].totalSongs) + " song"+extra+" ago, you were on waitlist spot " + disconnectLog[i].waitlist + " adding you now!", MESSAGESTYLES.NORMAL, null);
						if(API.getWaitListPosition(disconnectLog[i].user.id) == -1){
							AddUser(user, disconnectLog[i].waitlist);
						}else{
							Move(user.user, disconnectLog[i].waitlist)
						}
						
					}
					return;
				}else{
					Message("@"+data.from+" you disconnected " + (songCount-disconnectLog[i].totalSongs) + " song"+extra+" ago, you weren't on the waitlist!", MESSAGESTYLES.NORMAL, null);
					return;
				}
				break;
			}
		}
		Message("@"+data.from+" i didn't see you disconnect!", MESSAGESTYLES.NORMAL, null);
		return;
	}	
}

function GiveSpot(data, args){
	if(args.length == 2){
		var user = GetUserByName(data.from);
		var userTo = GetUserByName(args[1]);
		var spot = API.getWaitListPosition(user.id)
		if(spot != -1){
			var spotTo = spot+1;
			if(API.getWaitListPosition(userTo.id) > spot || API.getWaitListPosition(userTo.id) == -1){
				AddOrMoveTo(userTo, spotTo);
				API.moderateRemoveDJ(user.id);
			}
		}else{
			Message("["+data.from+"] you have to be in waitlist to use !give", MESSAGESTYLES.NORMAL, null);
			return;
		}
		Message(data.from + " gave his/her spot to @"+args[1].replace("@", ""), MESSAGESTYLES.NORMAL, null);
	}else{
		Message("["+data.from+"] usage: !give @{user}", MESSAGESTYLES.NORMAL, null);
	}
}

var cookies = ["gave you a delicious chocolate cookie!", "gave you a big piece of pie!", "wonders if you would like a mint flavored cookie.", "gives you a sugar cookie. What, no frosting and sprinkles? 10/10 would not touch."];
function Cookie(args, data){
	if(args.length == 2){
		var randno = Math.floor((Math.random()*cookies.length));
		var cookie = cookies[randno];
		Message(args[1] + ", "+data.from + " " + cookie, MESSAGESTYLES.NORMAL, null);
	}else{
		Message("["+data.from+"] usage: !cookie @{user}", MESSAGESTYLES.NORMAL, null);
	}
}

var flowers = ["gives you a :rose:", "gives you a :mushroom:, I'd suggest not to eat It!", "gives you a bunch of flowers! :cherry_blossom::rose::sunflower::tulip:"];
function Flower(args, data){
	if(args.length == 2){
		var randno = Math.floor((Math.random()*flowers.length));
		var flower = flowers[randno];
		Message(args[1] + ", "+data.from + " " + flower, MESSAGESTYLES.NORMAL, null);
	}else{
		Message("["+data.from+"] usage: !flower @{user}", MESSAGESTYLES.NORMAL, null);
	}
}

function Five(args, data){
	if(args.length == 2){
		var randno = Math.floor((Math.random()*flowers.length));
		var flower = flowers[randno];
		Message(args[1] + ", "+data.from + " gave you a high five!", MESSAGESTYLES.NORMAL, null);
	}else{
		Message("["+data.from+"] usage: !five @{user}", MESSAGESTYLES.NORMAL, null);
	}
}

function Slap(args, data){
	if(args.length == 2){
		var randno = Math.floor((Math.random()*flowers.length));
		var flower = flowers[randno];
		Message(args[1] + ", "+data.from + " gave you a turkey slap :O", MESSAGESTYLES.NORMAL, null);
	}else{
		Message("["+data.from+"] usage: !slap @{user}", MESSAGESTYLES.NORMAL, null);
	}
}

function Question(args, data){
	//TODO: fix function
}

function Push(data, args){
	if(args.length != 2){
		Message("["+data.from+"] usage: !push @{user}", MESSAGESTYLES.NORMAL, null);
	}else{
		args[1] = args[1].replace("@","");
		var user = GetUserByName(args[1]);
		AddOrMoveTo(user, 1);
	}
}

function Add(args, data){
	if(args.length == 2){
		var user = null;
		args[1] = args[1].replace("@","");
		for (var i = 0; i < users.length; i++) {
		    if(users[i].user.username == args[1]){
		    	user = users[i];
		    	break;
		    }
		}
		if(user != null){
			if(joinQueue.length > 0){
				Message("["+data.from+"] adding "+user.user.username+" on waitlist, at queue " + joinQueue.length, MESSAGESTYLES.NORMAL, null);
			}else{
				Message("["+data.from+"] adding "+user.user.username+" on waitlist!", MESSAGESTYLES.NORMAL, null);
			}
			AddUser(user);
		}
	}else if(args.length == 3){
		var user = null;
		args[1] = args[1].replace("@","");
		for (var i = 0; i < users.length; i++) {
		    if(users[i].user.username == args[1]){
		    	user = users[i];
		    	break;
		    }
		}
		if(user != null){
			if(joinQueue.length > 0){
				Message("["+data.from+"] adding "+user.user.username+" on waitlist, at queue " + joinQueue.length, MESSAGESTYLES.NORMAL, null);
			}else{
				Message("["+data.from+"] adding "+user.user.username+" on waitlist!", MESSAGESTYLES.NORMAL, null);
			}
			AddUser(user, parseInt(args[2]));
		}
	}
}

function Swap(args, data){
	if(args.length == 3){
		var user1 = GetUserByName(args[1]);
		var user1Pos = API.getWaitListPosition(user1.id);

		var user2 = GetUserByName(args[2]);
		var user2Pos = API.getWaitListPosition(user2.id);

		if(user1Pos == -1 || user2Pos == -1){
			Message("["+data.from+"] make sure both users are in the waitlist!", MESSAGESTYLES.NORMAL, null);
			return;
		}

		AddOrMoveTo(user2, user1Pos+1)
		AddOrMoveTo(user1, user2Pos+1)
		Message("["+data.from+"] swapped @"+user1.username+" for @"+user2.username+"!", MESSAGESTYLES.NORMAL, null);
	}else{
		Message("["+data.from+"] usage: !swap @{user1} @{user2}", MESSAGESTYLES.NORMAL, null);
	}
}

function MoveUserInList(data, args){
	if(args.length != 3){
		Message("["+data.from+"] usage: !move @{user} {pos}", MESSAGESTYLES.NORMAL, null);
	}else{
		args[1] = args[1].replace("@","");
		var user = GetUserByName(args[1]);
		if(user != null){
			Move(user, parseInt(args[2]));
		}
	}
}

function UrbanDictionary(data, args){
	if(args.length > 1){
		args.splice(0,1);
		var word = args.join(" ");
		var result = "["+data.from+"]["+word+"] ";
		$.get("http://api.urbandictionary.com/v0/define?term="+word,
		    function(data) {
				result += "definition: " + data.list[0].definition;
				result += "--- example: " + data.list[0].example;
				Message(result, MESSAGESTYLES.NORMAL, null);
				result = "";
		    }
		);
	}else{
		Message("["+data.from+"] usage: !urbandict {word}", MESSAGESTYLES.NORMAL, null);
	}
}

function CommandBan(data, args){
	if(args.length == 3){
		args[2] = args[2].replace("@","");
		var user = GetUserByName(args[2]);
		if(args[1] == "on"){
			for (var i = 0; i < users.length; i++) {
			    if(users[i].user.username == user.username){
			    	users[i].useCommands = 1;
			    	Message(user.username + " can use commands again!", MESSAGESTYLES.NORMAL, null);
			    }
			}
		}else{
			for (var i = 0; i < users.length; i++) {
			    if(users[i].user.username == user.username){
			    	users[i].useCommands = 0;
			    	Message(user.username + " lost his/her permission to use commands!", MESSAGESTYLES.NORMAL, null);
			    }
			}
		}
	}else{
		Message("["+data.from+"] usage: !cmd on/off @{user}", MESSAGESTYLES.NORMAL, null);
	}
}

function ClearChat(data){
	Message("["+data.from+"] cleared the chat!", MESSAGESTYLES.NORMAL, null);
	for(var i = 0; i < messages.length-1; i++){
		API.moderateDeleteChat(messages[i].getAttribute("data-cid"));
	}
	messages = [];
}

function DelChat(data, args){
	if(args.length != 2){
		Message("["+data.from+"] usage: !delchat @{user}", MESSAGESTYLES.NORMAL, null);
	}else{
		args[1] = args[1].replace("@","");
		var user = GetUserByName(args[1]);
		if(user != null){
			for(var i = 0; i < messages.length-1; i++){
				if(messages[i].fromID == user.id){
					API.moderateDeleteChat(messages[i].getAttribute("data-cid"));
					messages.splice(i, 1);
				}
			}
		}
	}
}

function Mehs(data, args){
	var usersMeh = "["+data.from+"] users that meh'd this song:  ";
	for(var i = 0; i < mehs.length; i++){
		if(mehs[i] != null) usersMeh += mehs[i].username + ", ";
	}
	usersMeh = usersMeh.substring(0, usersMeh.length-2);
	Message(usersMeh, MESSAGESTYLES.NORMAL, null);
}
//TODO: fix bansong(getscript)
function BanSong(data){
	var media = API.getMedia();
	var id = media.id;
	var name = media.title;
	var author = media.author;
	bannedSongs.push(id);
	$.getScript("http://maartenpeels.nl/mfe/bladd.php?id="+id+"&author="+author+"&name="+name+"&callback=BannedSong");
}
function BannedSong(inf){
	if(inf == "") inf = "error while connecting to database!";
	Message("server response: " + inf, MESSAGESTYLES.NORMAL, null);
}

function SongHistory(data, args){
	if(args.length == 2){
		var pos = parseInt(args[1]);
		var l = history.length;
		var song = null;
		if(pos > 0 && pos < l+1){
			if((l-(l-pos)) >= 0){
				song = history[l-pos];
			}
			if(song != null){
				var d = song.data;
				var userName = d.dj.username;
				var songName = d.media.title;
				var songAuthor = d.media.author;
				var woots = song.positive;
				var mehs = song.negative;
				var curates = song.curates;
				Message(pos + " songs ago, " + userName + " played " + songName + " by " + songAuthor + ". " + woots + " positive, " + mehs + " negative, " + curates + " curates!", MESSAGESTYLES.NORMAL, null);
			}
		}else{
			Message("["+data.from+"] error: enter a number between 1 and the history array length(current length: "+l+")", MESSAGESTYLES.NORMAL, null);
		}
	}else{
		Message("["+data.from+"] usage: !history {songsAgo}", MESSAGESTYLES.NORMAL, null);
	}
}

function Download(data){
	var url = "http://google.com/#hl=en&q=";
	msg = "["+data.from+"] try this link for download: ";
    url += encodeURIComponent(currentSong.author) + "%20-%20" + encodeURIComponent(currentSong.title);
    url += "%20site%3Azippyshare.com%20OR%20site%3Asoundowl.com%20OR%20site%3Ahulkshare.com%20OR%20site%3Asoundcloud.com";
    ShortenURL(url);
    
    setTimeout(function(){
		Message(msg + shortURL, MESSAGESTYLES.NORMAL, null);
	},2000);		
}

function SetBouncer(data, args){
	if(args.length == 2){
		var h = GetUserByName(args[1].replace("@", ""));
		API.moderateSetRole(h.id, API.ROLE.BOUNCER);
	}else{
		Message("["+data.from+"] usage: !bouncer @{username}", MESSAGESTYLES.NORMAL, null);
	}
}

function SetFDJ(data, args){
	if(args.length == 2){
		var h = GetUserByName(args[1].replace("@", ""));
		API.moderateSetRole(h.id, API.ROLE.RESIDENTDJ);
	}else{
		Message("["+data.from+"] usage: !fdj @{username}", MESSAGESTYLES.NORMAL, null);
	}
}

function AutoMessage(data, args){
	if(args.length > 1){
		Message("["+data.from+"] message added to AutoMessage list!", MESSAGESTYLES.NORMAL, null);
		var msg = "";
		for(var i = 1; i < args.length; i++){
			msg += args[i] + " ";
		}
		messages.push(msg);
	}else{
		Message("["+data.from+"] usage: !automsg {msg}", MESSAGESTYLES.NORMAL, null);
	}
}

function Ping(data){
	Message("["+data.from+"] pong!", MESSAGESTYLES.NORMAL, null);
}

function Hug(args, data){
//TODO: fix function
}

function Drink(args, data){
//TODO: fix function
}

function StartTime(data){
	var day, hour, launch, lt, meridian, min, month;
      lt = startTime;
      month = lt.getMonth() + 1;
      day = lt.getDate();
      hour = lt.getHours();
      meridian = hour % 12 === hour ? 'AM' : 'PM';
      min = lt.getMinutes();
      min = min < 10 ? '0' + min : min;
      var mSecStart = startTime.getTime();
      var mSecNow = new Date().getTime();
      var timeRunning = mSecNow-mSecStart;
      launch = 'initiated ' + day + '/' + month + ' ' + hour + ':' + min + ' ' + meridian + '('+msToStr(timeRunning)+'). ';
      Message("["+data.from+"] " + launch, MESSAGESTYLES.ME, null);
}

function QuestionBall(data, args){
	if(args.length>1){
		var question = "";
		for(var i = 1; i < args.length; i++){
			question += args[i] + " "; 
		}
		question = question.substring(0, question.length-1);
		randno = Math.floor((Math.random()*answers.length));
		var answer = answers[randno];
		Message("["+data.from+"]["+question+"] " + answer.toLowerCase(), MESSAGESTYLES.NORMAL, null);
	}else{
		Message("["+data.from+"] usage: !8ball {question}", MESSAGESTYLES.NORMAL, null);
	}
}

function Stats(data){
	var day, hour, launch, lt, meridian, min, month, msg, t, totals;
      lt = startTime;
      month = lt.getMonth() + 1;
      day = lt.getDate();
      hour = lt.getHours();
      meridian = hour % 12 === hour ? 'AM' : 'PM';
      min = lt.getMinutes();
      min = min < 10 ? '0' + min : min;
      t = totalVotingData;
      t['songs'] = songCount;
      launch = 'Initiated ' + day + '/' + month + ' ' + hour + ':' + min + ' ' + meridian + '. ';
      totals = '' + t.songs + ' songs have been played, accumulating ' + t.woots + ' woots, ' + t.mehs + ' mehs, and ' + t.curates + ' curates.';
      msg = launch + totals;
      Message(msg, MESSAGESTYLES.ME, null);
}

function ChangeSettings(data, args){
	if(args.length >= 3){
		if(args[1] == "join"){
			if(args[2] == "on"){
				if(sendUserJoinMessages){
					Message("["+data.from+"] user join messages already enabled!", MESSAGESTYLES.NORMAL, null);
				}else{
					Message("["+data.from+"] user join messages enabled!", MESSAGESTYLES.NORMAL, null);
					sendUserJoinMessages = true
				}
			}else if(args[2] == "off"){
				if(!sendUserJoinMessages){
					Message("["+data.from+"] user join messages already disabled!", MESSAGESTYLES.NORMAL, null);
				}else{
					Message("["+data.from+"] user join messages disabled!", MESSAGESTYLES.NORMAL, null);
					sendUserJoinMessages = false
				}
			}
		}else if(args[1] == "grab"){
			if(args[2] == "on"){
				if(sendGrabMessages){
					Message("["+data.from+"] grab messages already enabled!", MESSAGESTYLES.NORMAL, null);
				}else{
					Message("["+data.from+"] grab messages enabled!", MESSAGESTYLES.NORMAL, null);
					sendGrabMessages = true
				}
			}else if(args[2] == "off"){
				if(!sendGrabMessages){
					Message("["+data.from+"] grab messages already disabled!", MESSAGESTYLES.NORMAL, null);
				}else{
					Message("["+data.from+"] grab messages disabled!", MESSAGESTYLES.NORMAL, null);
					sendGrabMessages = false
				}
			}
		}else if(args[1] == "song"){
			if(args[2] == "on"){
				if(sendSongUpdateMessages){
					Message("["+data.from+"] song update messages already enabled!", MESSAGESTYLES.NORMAL, null);
				}else{
					Message("["+data.from+"] song update messages enabled!", MESSAGESTYLES.NORMAL, null);
					sendSongUpdateMessages = true
				}
			}else if(args[2] == "off"){
				if(!sendSongUpdateMessages){
					Message("["+data.from+"] song update messages already disabled!", MESSAGESTYLES.NORMAL, null);
				}else{
					Message("["+data.from+"] song update messages disabled!", MESSAGESTYLES.NORMAL, null);
					sendSongUpdateMessages = false
				}
			}
		}else if(args[1] == "bot"){
			if(args[2] == "on"){
				if(chatBot){
					Message("["+data.from+"] artificial intelligence already enabled!", MESSAGESTYLES.NORMAL, null);
				}else{
					Message("["+data.from+"] artificial intelligence enabled!", MESSAGESTYLES.NORMAL, null);
					chatBot = true
				}
			}else if(args[2] == "off"){
				if(!chatBot){
					Message("["+data.from+"] artificial intelligence already disabled!", MESSAGESTYLES.NORMAL, null);
				}else{
					Message("["+data.from+"] artificial intelligence disabled!", MESSAGESTYLES.NORMAL, null);
					convo_id = "";
					chatBot = false
				}
			}
		}else if(args[1] == "perms"){
			if(args[2] == "on"){
				if(sendPermssionMessages){
					Message("["+data.from+"] permsission messages already enabled!", MESSAGESTYLES.NORMAL, null);
				}else{
					Message("["+data.from+"] permsission messages enabled!", MESSAGESTYLES.NORMAL, null);
					sendPermssionMessages = true
				}
			}else if(args[2] == "off"){
				if(!sendPermssionMessages){
					Message("["+data.from+"] permsission messages already disabled!", MESSAGESTYLES.NORMAL, null);
				}else{
					Message("["+data.from+"] permsission messages disabled!", MESSAGESTYLES.NORMAL, null);
					convo_id = "";
					sendPermssionMessages = false
				}
			}
		}
	}
}

function Points(data, args){
	var user = GetUserByName(data.from);
	if(user!=null){
		var curatorPoints = user.curatorPoints;
		var djPoints = user.djPoints;
		var listenerPoints = user.listenerPoints;
		var fans = user.fans;
		Message("["+user.username+"] Woots given: " + listenerPoints + ", Woots gotten: " + djPoints + ", Grabs: " + curatorPoints + ", Fans: " + fans, MESSAGESTYLES.ME, null);
	}
}

function Commands(data){
	Message("["+data.from+"] commands: " + commandsLink, MESSAGESTYLES.ME, null);
}

function Spot(data, args){
	//get spot of user
	if(args.length == 2){
		var h = GetUserByName(args[1].replace("@", ""));
		var wlPos = API.getWaitListPosition(h.id);
		if(wlPos == -1){
			Message("["+data.from+"] " + h.username + " is not on the waitlist!" , MESSAGESTYLES.NORMAL, null);
		}else{
			Message("["+data.from+"] " + h.username + " is on the waitlist at spot " + (wlPos+1) , MESSAGESTYLES.NORMAL, null);
		}
	}else{
		Message("["+data.from+"] usage: !spot @{user}", MESSAGESTYLES.NORMAL, null);
	}
}

function KickSong(){
	var dj = API.getDJ();
	return setTimeout(function() {
		EnableCycle();
  		return setTimeout(function() {
  			API.moderateForceSkip();
  			setTimeout(function(){
			    Move(dj, 2);
			},2000);
  			return setTimeout(function() {
        		return DisableCycle();
      		}, 1500);
  		}, 1500);
	}, 1500);
}

function Rocket(data, args){
	if(args.length == 2){
		var h = GetUserByName(args[1].replace("@", ""));
		var f = GetUserByName(data.from);
		if(h.permission > 2){
			Message("["+data.from+"] " + h.username + " is manager or higher, you can't remove him/her!" , MESSAGESTYLES.NORMAL, null);
		}else{
			Message("["+data.from+"] removed " + h.username + " from waitlist!" , MESSAGESTYLES.NORMAL, null);
			API.moderateRemoveDJ(h.id);
		}
	}else{
		Message("["+data.from+"] usage: !rocket @{user}", MESSAGESTYLES.NORMAL, null);
	}
}

function Mute(data, args){
	if(args.length == 2){
		var h = GetUserByName(args[1].replace("@", ""));
		var f = GetUserByName(data.from);
		if(h.permission > 2){
			Message("["+data.from+"] " + h.username + " is manager or higher, you can't mute him/her!" , MESSAGESTYLES.NORMAL, null);
		}else{
			Message("["+data.from+"] muted " + h.username + "!" , MESSAGESTYLES.NORMAL, null);
			mutedUsers.push(h);
		}
	}else{
		Message("["+data.from+"] usage: !mute @{user}", MESSAGESTYLES.NORMAL, null);
	}
}

function Unmute(data, args){
	if(args.length == 2){
		var h = GetUserByName(args[1].replace("@", ""));
		Message("["+data.from+"] unmuted " + h.username + "!" , MESSAGESTYLES.NORMAL, null);
		for(var i = 0; i < mutedUsers.length; i++){
			if(mutedUsers[i].username == h.username){
				mutedUsers.splice(i, 1);
			}
		}
	}else{
		Message("["+data.from+"] usage: !unmute @{user}", MESSAGESTYLES.NORMAL, null);
	}
}

//TIMERS
function Checks(){
	//Check for AFK'ers and notify/kick them from WL
	//AFK();
	JoinUser();
	ActiveUsers();
	UnBan();
	//skip song

	if(voteSkip.length >= voteSkipAmount){
		API.moderateForceSkip();
	}

	var userCount = API.getUsers().length;
	var mehs = API.getRoomScore().negative;
	var mehsToSkip = userCount*0.1;
	if(mehsToSkip < 10) mehsToSkip = 10;
	if(mehs >= mehsToSkip){
		API.moderateForceSkip();
	}
}
setInterval(Checks, 1000);

function LogMessages(){
	var obj = [];
	var message = [];
	for(var i = 0; i < logMessages.length; i++){
		message = {"from": logMessages[i].from, "msg": logMessages[i].message};
		obj.push(message);
	}
	var jsonString = JSON.stringify(obj);
	if(obj != null){
		//$.getScript("http://maartenpeels.nl/mfe/msg.php?json="+jsonString);
	}
	logMessages = [];
}
setInterval(LogMessages, 10000);

//FUNCTIONS
function Initialize(){
	GetUsers();
	GetBannedSongs();
	setTimeout(HookEvents, 1000);
	currentSong = API.getMedia();
}

function HookEvents(){
	API.on(API.CHAT, OnMessage);
	API.on(API.USER_JOIN, OnUserJoin);
	API.on(API.DJ_ADVANCE, OnDJAdvance);
	API.on(API.WAIT_LIST_UPDATE, OnWaitlistUpdate);
	API.on(API.MOD_SKIP, OnSongSkip);
	API.on(API.USER_LEAVE, OnUserLeave);
	API.on(API.CURATE_UPDATE, OnSongGrab);
	API.on(API.VOTE_UPDATE, OnVote);

	API.chatLog("Loaded! "+ version);
	Message(welcomeMessage, MESSAGESTYLES.ME, null);
	if(firstStart)setInterval(BroadcastMessage, BroadcastMessageInterval);
	if(firstStart)MakeLotteryInterval();
	if(firstStart)MakeMehResetInterval();
	messages = [];
	internalWaitlist = API.getWaitList();
	firstStart = false;
	API.moderateDeleteChat = function (cid) {
        $.ajax({
            url: "https://plug.dj/_/chat/" + cid,
            type: "DELETE"
        })
    };
}

function Die(){
	API.off(API.CHAT, OnMessage);
	API.off(API.USER_JOIN, OnUserJoin);
	API.off(API.DJ_ADVANCE, OnDJAdvance);
	API.off(API.WAIT_LIST_UPDATE, OnWaitlistUpdate);
	API.off(API.MOD_SKIP, OnSongSkip);
	API.off(API.USER_LEAVE, OnUserLeave);
	API.off(API.CURATE_UPDATE, OnSongGrab);
	API.off(API.VOTE_UPDATE, OnVote);

	var highestTimeoutId = setTimeout(";");
	for (var i = 0 ; i < highestTimeoutId ; i++) {
	    clearTimeout(i); 
	}

	users = [];
	disconnectLog = [];
	history = [];
	voteSkip = [];
	joinQueue = [];
	messages = [];
	logMessages = [];
	bannedSongs = [];
	activeUsers = [];

	songCount = 0;

	Message("Bot offline!", MESSAGESTYLES.ME, null);
}

function Reload(){
	Message("Bot reloading!", MESSAGESTYLES.ME, null);
	Die();
	$.getScript(botSrc);
}

function MakeLotteryInterval(){
	var d = new Date();
    var min = d.getMinutes();
    var sec = d.getSeconds();

    if((min == '00') && (sec == '00'))
        BoostLottery();
    else
        setTimeout(BoostLottery,(60*(60-min)+(60-sec))*1000);
}

function MakeMehResetInterval(){
	var d = new Date();
    var min = d.getMinutes();
    var sec = d.getSeconds();

    if((min == '00') && (sec == '00'))
        ResetMehs();
    else
        setTimeout(ResetMehs,(60*(60-min)+(60-sec))*1000);
}

function ResetMehs(){
	for(var i = 0; i < users.length; i++){
		users[i].mehs = 0;
	}
}

function GetLotteryBoost(data){
	if(data.fromID == winningUserId){
		AddOrMove(GetUserByName(data.from));
	}
}

function resetWinner(){
	winningUserId = null;
	winningUser = null;
}
var winningUser = null;
var winningUserId = "";
var possibleWinners = [];
function BoostLottery(){
	possibleWinners = [];
	for (var i = 0; i < activeUsers.length; i++) {
		if(activeUsers[i] != null && (activeUsers[i].user.id != API.getUser().id)){
			possibleWinners.push(activeUsers[i]);
		}
	}
	if(possibleWinners.length > 0){
		randno = Math.floor((Math.random()*possibleWinners.length));
		var randomUser = possibleWinners[randno];
		Message("[lottery] the choosen active user to be boosted is @" + randomUser.user.username + " , type: !lottery within 5m to get boosted otherwise I'll get another user!", MESSAGESTYLES.NORMAL, null);
		winningUserId = randomUser.user.id;
		winningUser = randomUser;
		setTimeout(resetWinner, 300000);
	}else{
		Message("[lottery] no active users!", MESSAGESTYLES.NORMAL, null);
	}
	MakeLotteryInterval();
}

function ActiveUsers(){
	var now = new Date();
	var time = now.getTime();
	for (var i = 0; i < activeUsers.length; i++) {
		if(activeUsers[i]!=null){
			if((time-activeUsers[i].lastChat) >= (5*60*1000)){
				activeUsers.splice(i, 1);
			}
		}
	}
}

function UnBan(){
	var user, time;
	for(var i = 0; i < kicks.length; i++){
		user = kicks[i].user;
		time = kicks[i].until;
	}
	if(time >= new Date().getTime()){
		API.moderateUnbanUser(user.id);
	}
}

function GetUsers(){
	API.getUsers().forEach(function(usr) {
    	users.push({"user": usr, "inRoom": true, "lastChat": new Date().getTime(), "useCommands": 1, "kickVotes": 0, "mehs": 0, "canChat": true, "afkWarnings": 0, "fanWarnings": 0, "position": usr.wlIndex});
	});
}
function Sleep(){}

function GetBannedSongs(){
	$.getScript("http://maartenpeels.nl/mfe/bl.php?callback=BannedSongList");
}
function BannedSongList(data){
	for (var i = 0; i < data.length; i++) {
		bannedSongs.push(data[i].media_id);
	}
}

function GetAFKUsers(){
	var afkers = "  ";
	for (var i = 0; i < users.length; i++) {
		var usrr = users[i].user;
		if(API.getWaitListPosition(usrr.id) != -1){
			var now = new Date();
			var lastActivity = users[i].lastChat;
	    	var timeSinceLastActivity = now.getTime() - lastActivity;
	    	var secsLastActive = timeSinceLastActivity / 1000;
	    	var minsLastActive = secsLastActive/60;

	    	if(minsLastActive > timeAFKBeforeKick){
	    		afkers += usrr.username + ", "
	    	}
    	}
    }
    Message("Users that are afk in waitlist: " + afkers.substring(0, afkers.length-1), MESSAGESTYLES.ME, null);
}

function JoinUser(){
	if(joinQueue.length > 0){
		var list = API.getWaitList();
		if(list.length < waitListLength){
			var obj = joinQueue.shift();
			API.moderateAddDJ(obj.user.user.id);
			setTimeout(function(){
			    Move(obj.user.user, obj.pos);
			},2000);
		}else if(API.getWaitListPosition(joinQueue[0].user.user.id) != -1){
			var obj = joinQueue.shift();
			Move(obj.user.user, obj.pos);
		}else{
			LockBooth();
		}
	}else{
		UnlockBooth();
	}
}

function SendMessage(args){
	var mess = "";

	for(var i = 1; i < args.length; i++){
		mess += args[i] + " ";
	}
	Message(mess, MESSAGESTYLES.ME, null);
}

function AFK(){
	for (var i = 0; i < users.length; i++) {
		var usrr = users[i].user;
		if(API.getWaitListPosition(usrr.id) != -1){
			var now = new Date();
			var lastActivity = users[i].lastChat;
	    	var timeSinceLastActivity = now.getTime() - lastActivity;
	    	var secsLastActive = timeSinceLastActivity / 1000;
	    	var minsLastActive = secsLastActive/60;

	    	if((minsLastActive+10) > timeAFKBeforeKick){
	    		if(users[i].afkWarnings == 0){
	    			users[i].afkWarnings = 1;
	    			Message("AFK time: "+msToStr(secsLastActive*1000)+", chat within 10 minutes or you will be removed from waitlist!", MESSAGESTYLES.MENTION, usrr.username);
	    		}
	    	}
	    	if(minsLastActive > timeAFKBeforeKick){
	    		API.moderateRemoveDJ(usrr.id);
	    		users[i].afkWarnings = 0;
	    		users[i].lastChat = new Date().getTime();
	    	}
    	}else{
    		users[i].lastChat = new Date().getTime();
    	}
    }
}

msToStr = function(msTime) {
    var ms, msg, timeAway;
    msg = '';
    timeAway = {
      'days': 0,
      'hours': 0,
      'minutes': 0,
      'seconds': 0
    };
    ms = {
      'day': 24 * 60 * 60 * 1000,
      'hour': 60 * 60 * 1000,
      'minute': 60 * 1000,
      'second': 1000
    };
    if (msTime > ms['day']) {
      timeAway['days'] = Math.floor(msTime / ms['day']);
      msTime = msTime % ms['day'];
    }
    if (msTime > ms['hour']) {
      timeAway['hours'] = Math.floor(msTime / ms['hour']);
      msTime = msTime % ms['hour'];
    }
    if (msTime > ms['minute']) {
      timeAway['minutes'] = Math.floor(msTime / ms['minute']);
      msTime = msTime % ms['minute'];
    }
    if (msTime > ms['second']) {
      timeAway['seconds'] = Math.floor(msTime / ms['second']);
    }
    if (timeAway['days'] !== 0) {
      msg += timeAway['days'].toString() + 'd';
    }
    if (timeAway['hours'] !== 0) {
      msg += timeAway['hours'].toString() + 'h';
    }
    if (timeAway['minutes'] !== 0) {
      msg += timeAway['minutes'].toString() + 'm';
    }
    if (timeAway['seconds'] !== 0) {
      msg += timeAway['seconds'].toString() + 's';
    }
    if (msg !== '') {
      return msg;
    } else {
      return false;
    }
};

function GetBotResponse(input){
	if(convo_id == ""){
		$.getScript("http://maartenpeels.nl/aiml2/chatbot/conversation_start.php?say="+input+"&callback=ServerResponse");
	}else{
		$.getScript("http://maartenpeels.nl/aiml2/chatbot/conversation_start.php?say="+input+"&convo_id="+convo_id+"&callback=ServerResponse");
	}
}

function ServerResponse(data){
	convo_id = data['convo_id'];
	Message(data['botsay'], MESSAGESTYLES.NORMAL, null);
}

function BroadcastMessage(){
	var randno = Math.floor((Math.random()*Bmessages.length));
	var randomMessage = Bmessages[randno];
	Message(randomMessage, MESSAGESTYLES.NORMAL, null);
}

function Woot(){
	$('#woot').click();
}

function LockBooth(){
	API.moderateLockWaitList(true);
}

function Permision(user){
	if(user.permission >= 3 || user.id == userID || user.id == userID2){
		return true;
	}else{
		return false;
	}
}

function GetPermision(user){
	return user.permission;
}

function UnlockBooth(){
	API.moderateLockWaitList(false);
}

function Ban(userID, reason, duration){//API.moderateBanUser(userID, reason, duration)
	API.moderateBanUser(userID, reason, duration);
}

DisableCycle = function(callback) {
  if (callback == null) {
    callback = null;
  }
  return $.ajax({
    url: "http://plug.dj/_/gateway/room.cycle_booth",
    type: 'POST',
    data: JSON.stringify({
      service: "room.cycle_booth",
      body: [
        window.location.pathname.replace(/\//g, ''),
        false
      ]
    }),
    async: this.async,
    dataType: 'json',
    contentType: 'application/json'
  }).done(function() {
    if (callback != null) {
      return callback();
    }
  });
};

EnableCycle = function(callback) {
  if (callback == null) {
    callback = null;
  }
  return $.ajax({
    url: "http://plug.dj/_/gateway/room.cycle_booth",
    type: 'POST',
    data: JSON.stringify({
      service: "room.cycle_booth",
      body: [
        window.location.pathname.replace(/\//g, ''),
        true
      ]
    }),
    async: this.async,
    dataType: 'json',
    contentType: 'application/json'
  }).done(function() {
    if (callback != null) {
      return callback();
    }
  });
};

var MESSAGESTYLES = {
  LOG : "LOG", 
  NORMAL: "NORMAL", 
  ERROR : "ERROR",
  ME : "ME",
  MENTION : "MENTION"
};
var RANK = {
  HOST : 5, 
  COHOST: 4, 
  MANAGER : 3,
  BOUNCER : 2,
  RECIDENTDJ : 1,
  NONE : 0
};
function Message(text, type, user){
	if(sendMessages){
		if(type == MESSAGESTYLES.LOG){
			API.chatLog(text, false);
		}else if(type == MESSAGESTYLES.NORMAL){
			API.sendChat("/me "+text);
		}else if(type == MESSAGESTYLES.ERROR){
			API.chatLog(text, true);
		}else if(type == MESSAGESTYLES.ME){
			API.sendChat("/me " + text);
		}else if(type == MESSAGESTYLES.MENTION && user != null){
			API.sendChat("@"+user+" "+text);
		}else if(type == null){
			API.chatLog(text, false);
		}else{
			API.chatLog("An error occurred sending the message!", true);
		}
	}else{
		console.debug(text);
	}
}

function GetDate(){
	var now = new Date();
	return now;
}

function StartsWith(input, check){
	if(input.substring(0, check.length) === check){
		return true;
	}else{
		return false;
	}
}

function FanAsk(msg){
	var asked = false;
	for(var i = 0; i < fanFilter.length; i++){
		if(msg.toLowerCase().indexOf(fanFilter[i]) != -1){
			asked = true;
		}
	}
	return asked;
}

function AddUser(user, pos){
	if(typeof pos === 'undefined') pos = 50;
	joinQueue.push({"user": user, "pos": pos});
}

function Move(user, pos){
	if(pos != API.getWaitListPosition(user.id)+1){
		API.moderateMoveDJ(user.id, parseInt(pos));
	}
}

function GetUserByName(name){
	var user = null;
	name = name.replace("@","");
	for (var i = 0; i < users.length; i++) {
	    if(users[i].user.username == name){
	    	user = users[i].user;
	    	break;
	    }
	}
	return user;
}

function HasPermission(user, permission){
	if(user.permission >= permission || user.id == userID || user.id == userID2 || user.id == userID3){
		return true;
	}else{
		return false;
	}
}

function Kick(obj){
	var user = obj.user;
	kicks.push({"user": user, "until": new Date().getTime()+30000});
}

function AddOrMove(user){
	if(API.getWaitListPosition(user.id) == -1){
		var u = null;
		for(var i = 0; i < users.length; i++){
			if(users[i].user.id == user.id){
				u = users[i];
			}
		}

		AddUser(u, 1);
	}else{
		Move(user, 1);
	}
}
function AddOrMoveTo(user, pos){
	if(API.getWaitListPosition(user.id) == -1){
		var u = null;
		for(var i = 0; i < users.length; i++){
			if(users[i].user.id == user.id){
				u = users[i];
			}
		}

		AddUser(u, pos);
	}else{
		Move(user, pos);
	}
}

function ShortenURL(url){
	$.ajax({
	    url: "https://www.googleapis.com/urlshortener/v1/url",
	    type: 'POST',
	    data: JSON.stringify({
	      longUrl: url
	    }),
	    async: this.async,
	    dataType: 'json',
	    contentType: 'application/json'
	}).done(function(data) {
		shortURL = data.id;
	});
}

//ROULETTE
var rouletteRunning = false;
var rouletteUsersCanJoin = false;
var rouletteGameTime = 30;//secs
var rouletteTimeOut = 45*60;//30mins in secs
var rouletteUsers = [];
var lastRouletteMs = null;

function NewGameRoulette(data){
	if(CanStartNewRoulette()){
		rouletteUsers = [];
		if(rouletteRunning){
			var usr = GetUserByName(data.from);
			Message("["+usr.username+"][roulette] there's already a game in progress!", MESSAGESTYLES.NORMAL, null);
		}else{
			rouletteRunning = true;
			rouletteUsersCanJoin = true;
			Message(":warning: ROULETTE :warning:  New round of roulette has started! Type: !play within 30s to join.  :bangbang:" + rouletteGameTime + "s to join.", MESSAGESTYLES.NORMAL, null);
			setTimeout(RoulettePlay, rouletteGameTime*1000);
		}
	}else{
		var now = new Date();
		time = now.getTime();
		Message("["+data.from+"][roulette] there already was a game in the past 45 mins ("+msToStr(time-lastRouletteMs)+" ago)!", MESSAGESTYLES.NORMAL, null);
	}
}

function AddUserRoulette(user){
	if(rouletteRunning){
		var flag = false;
		for(var i = 0; i < rouletteUsers.length; i++){
			if(rouletteUsers[i].id == user.id){
				flag = true;
			}
		}
		if(!flag)rouletteUsers.push(user);
	}else{
		Message("["+user.username+"][roulette] there isn't any game running, or the time you had to join is over!", MESSAGESTYLES.NORMAL, null);
	}
}

function RoulettePlayers(data){
	var usd = "  ";
	if(rouletteRunning || rouletteUsersCanJoin){
		for(var i = 0; i < rouletteUsers.length; i++){
			usd += rouletteUsers[i].username + ", ";
		}
		Message("["+data.from+"][roulette] players: " + usd.substring(0, usd.length-2), MESSAGESTYLES.NORMAL, null);
	}else{
		Message("["+data.from+"][roulette] there isn't any game running!", MESSAGESTYLES.NORMAL, null);
	}
}

function RoulettePlay(){
	rouletteUsersCanJoin = false;
	Message("[roulette] choosing random winner to be the next DJ!", MESSAGESTYLES.NORMAL, null);
	setTimeout(GetWinnerRoulette, 5000);

}

function GetWinnerRoulette(){
	var randno = Math.floor((Math.random()*rouletteUsers.length));
	var randomUser = rouletteUsers[randno];
	Message("[roulette] the winner of this round: @" + randomUser.username + ", congrats!", MESSAGESTYLES.NORMAL, null);
	//Move(randomUser, 1);
	if(API.getWaitListPosition(randomUser.id) == -1){
		var u = null;
		for(var i = 0; i < users.length; i++){
			if(users[i].user.id == randomUser.id){
				u = users[i];
			}
		}

		AddUser(u, 1);
	}else{
		Move(randomUser, 1);
	}
	
	rouletteRunning = false;

	var now = new Date();
	lastRouletteMs = now.getTime();
}

function LastGameRoulette(data){
	var now = new Date();
	time = now.getTime();
	Message("["+data.from+"] last round of roulette was " + msToStr(time-lastRouletteMs) + " ago.", MESSAGESTYLES.NORMAL, null);
}
function CanStartNewRoulette(){
	var now = new Date();
	time = now.getTime();
	if((time-lastRouletteMs) >= rouletteTimeOut*1000){
		return true;
	}
	return false;
}
Initialize();
