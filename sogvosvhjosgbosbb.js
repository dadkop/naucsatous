(function () {

    API.getWaitListPosition = function(id){
        if(typeof id === 'undefined' || id === null){
            id = API.getUser().id;
        }
        var wl = API.getWaitList();
        for(var i = 0; i < wl.length; i++){
            if(wl[i].id === id){
                return i;
            }
        }
        return -1;
    };

    var kill = function () {
        clearInterval(freeRunBot.room.autodisableInterval);
        clearInterval(freeRunBot.room.afkInterval);
        freeRunBot.status = false;
    };

    var storeToStorage = function () {
        localStorage.setItem("freeRunBotsettings", JSON.stringify(freeRunBot.settings));
        localStorage.setItem("freeRunBotRoom", JSON.stringify(freeRunBot.room));
        var freeRunBotStorageInfo = {
            time: Date.now(),
            stored: true,
            version: freeRunBot.version
        };
        localStorage.setItem("freeRunBotStorageInfo", JSON.stringify(freeRunBotStorageInfo));

    };

    var subChat = function (chat, obj) {
        if (typeof chat === "undefined") {
            API.chatLog("Chýba tam text.");
            console.log("Chýba tam text.");
            return "[Chyba] Žiadny text.";
        }
        var lit = '%%';
        for (var prop in obj) {
            chat = chat.replace(lit + prop.toUpperCase() + lit, obj[prop]);
        }
        return chat;
    };

    var loadChat = function (cb) {
        if (!cb) cb = function () {
        };
        $.get("https://rawgit.com/Yemasthui/freeRunBot/master/lang/langIndex.json", function (json) {
            var link = freeRunBot.chatLink;
            if (json !== null && typeof json !== "undefined") {
                langIndex = json;
                link = langIndex[freeRunBot.settings.language.toLowerCase()];
                if (freeRunBot.settings.chatLink !== freeRunBot.chatLink) {
                    link = freeRunBot.settings.chatLink;
                }
                else {
                    if (typeof link === "undefined") {
                        link = freeRunBot.chatLink;
                    }
                }
                $.get(link, function (json) {
                    if (json !== null && typeof json !== "undefined") {
                        if (typeof json === "string") json = JSON.parse(json);
                        freeRunBot.chat = json;
                        cb();
                    }
                });
            }
            else {
                $.get(freeRunBot.chatLink, function (json) {
                    if (json !== null && typeof json !== "undefined") {
                        if (typeof json === "string") json = JSON.parse(json);
                        freeRunBot.chat = json;
                        cb();
                    }
                });
            }
        });
    };

    var retrieveSettings = function () {
        var settings = JSON.parse(localStorage.getItem("freeRunBotsettings"));
        if (settings !== null) {
            for (var prop in settings) {
                freeRunBot.settings[prop] = settings[prop];
            }
        }
    };

    var retrieveFromStorage = function () {
        var info = localStorage.getItem("freeRunBotStorageInfo");
        if (info === null) API.chatLog(freeRunBot.chat.nodatafound);
        else {
            var settings = JSON.parse(localStorage.getItem("freeRunBotsettings"));
            var room = JSON.parse(localStorage.getItem("freeRunBotRoom"));
            var elapsed = Date.now() - JSON.parse(info).time;
            if ((elapsed < 1 * 60 * 60 * 1000)) {
                API.chatLog(freeRunBot.chat.retrievingdata);
                for (var prop in settings) {
                    freeRunBot.settings[prop] = settings[prop];
                }
                freeRunBot.room.users = room.users;
                freeRunBot.room.afkList = room.afkList;
                freeRunBot.room.historyList = room.historyList;
                freeRunBot.room.mutedUsers = room.mutedUsers;
                freeRunBot.room.autoskip = room.autoskip;
                freeRunBot.room.roomstats = room.roomstats;
                freeRunBot.room.messages = room.messages;
                freeRunBot.room.queue = room.queue;
                freeRunBot.room.newBlacklisted = room.newBlacklisted;
                API.chatLog(freeRunBot.chat.datarestored);
            }
        }
        /*var json_sett = null;
        var roominfo = document.getElementById("room-info");
        info = roominfo.textContent;
        var ref_bot = "@freeRunBot=";
        var ind_ref = info.indexOf(ref_bot);
        if (ind_ref > 0) {
            var link = info.substring(ind_ref + ref_bot.length, info.length);
            var ind_space = null;
            if (link.indexOf(" ") < link.indexOf("\n")) ind_space = link.indexOf(" ");
            else ind_space = link.indexOf("\n");
            link = link.substring(0, ind_space);
            $.get(link, function (json) {
                if (json !== null && typeof json !== "undefined") {
                    json_sett = JSON.parse(json);
                    for (var prop in json_sett) {
                        freeRunBot.settings[prop] = json_sett[prop];
                    }
                }
            });
        }*/

    };

    String.prototype.splitBetween = function (a, b) {
        var self = this;
        self = this.split(a);
        for (var i = 0; i < self.length; i++) {
            self[i] = self[i].split(b);
        }
        var arr = [];
        for (var i = 0; i < self.length; i++) {
            if (Array.isArray(self[i])) {
                for (var j = 0; j < self[i].length; j++) {
                    arr.push(self[i][j]);
                }
            }
            else arr.push(self[i]);
        }
        return arr;
    };

    var linkFixer = function (msg) {
        var parts = msg.splitBetween('<a href="', '<\/a>');
        for (var i = 1; i < parts.length; i = i + 2) {
            var link = parts[i].split('"')[0];
            parts[i] = link;
        }
        var m = '';
        for (var i = 0; i < parts.length; i++) {
            m += parts[i];
        }
        return m;
    };

    var botCreator = "Dávid aka Polkov";
    var botCreatorIDs = ["3610268"];

    var freeRunBot = {
        version: "2.2.2",
        status: false,
        name: "Free-Run Bot",
        loggedInID: null,
        scriptLink: "https://rawgit.com/Yemasthui/freeRunBot/master/freeRunBot.js",
        cmdLink: "http://git.io/245Ppg",
        chatLink: "https://rawgit.com/Yemasthui/freeRunBot/master/lang/en.json",
        chat: null,
        loadChat: loadChat,
        retrieveSettings: retrieveSettings,
        retrieveFromStorage: retrieveFromStorage,
        settings: {
            botName: "Free-Run Bot",
            language: "english",
            chatLink: "https://rawgit.com/Yemasthui/freeRunBot/master/lang/en.json",
            startupCap: 1, // 1-200
            startupVolume: 0, // 0-100
            startupEmoji: false, // true or false
            maximumAfk: 120,
            afkRemoval: true,
            maximumDc: 60,
            bouncerPlus: true,
            blacklistEnabled: true,
            lockdownEnabled: false,
            lockGuard: false,
            maximumLocktime: 10,
            cycleGuard: true,
            maximumCycletime: 10,
            voteSkip: false,
            voteSkipLimit: 10,
            historySkip: true,
            timeGuard: true,
            maximumSongLength: 10,
            autodisable: true,
            commandCooldown: 30,
            usercommandsEnabled: true,
            lockskipPosition: 3,
            lockskipReasons: [
                ["op", "Tento song je v OP liste. "],
                ["history", "Tento song je v histórii. "]
            ],
            afkpositionCheck: 15,
            afkRankCheck: "ambassador",
            motdEnabled: false,
            motdInterval: 5,
            motd: "Správa dňa.",
            filterChat: true,
            etaRestriction: false,
            welcome: true,
            opLink: null,
            rulesLink: null,
            themeLink: null,
            fbLink: null,
            youtubeLink: null,
            website: null,
            intervalMessages: [],
            messageInterval: 5,
            songstats: true,
            commandLiteral: "!",
            blacklists: {
                NSFW: "https://rawgit.com/Yemasthui/freeRunBot-customization/master/blacklists/ExampleNSFWlist.json",
                OP: "https://rawgit.com/Yemasthui/freeRunBot-customization/master/blacklists/ExampleOPlist.json"
            }
        },
        room: {
            users: [],
            afkList: [],
            mutedUsers: [],
            bannedUsers: [],
            skippable: true,
            usercommand: true,
            allcommand: true,
            afkInterval: null,
            autoskip: false,
            autoskipTimer: null,
            autodisableInterval: null,
            autodisableFunc: function () {
                if (freeRunBot.status && freeRunBot.settings.autodisable) {
                    API.sendChat('!afkdisable');
                    API.sendChat('!joindisable');
                }
            },
            queueing: 0,
            queueable: true,
            currentDJID: null,
            historyList: [],
            cycleTimer: setTimeout(function () {
            }, 1),
            roomstats: {
                accountName: null,
                totalWoots: 0,
                totalCurates: 0,
                totalMehs: 0,
                launchTime: null,
                songCount: 0,
                chatmessages: 0
            },
            messages: {
                from: [],
                to: [],
                message: []
            },
            queue: {
                id: [],
                position: []
            },
            blacklists: {

            },
            newBlacklisted: [],
            newBlacklistedSongFunction: null,
            roulette: {
                rouletteStatus: false,
                participants: [],
                countdown: null,
                startRoulette: function () {
                    freeRunBot.room.roulette.rouletteStatus = true;
                    freeRunBot.room.roulette.countdown = setTimeout(function () {
                        freeRunBot.room.roulette.endRoulette();
                    }, 60 * 1000);
                    API.sendChat(freeRunBot.chat.isopen);
                },
                endRoulette: function () {
                    freeRunBot.room.roulette.rouletteStatus = false;
                    var ind = Math.floor(Math.random() * freeRunBot.room.roulette.participants.length);
                    var winner = freeRunBot.room.roulette.participants[ind];
                    freeRunBot.room.roulette.participants = [];
                    var pos = 1;
                    var user = freeRunBot.userUtilities.lookupUser(winner);
                    var name = user.username;
                    API.sendChat(subChat(freeRunBot.chat.winnerpicked, {name: name, position: pos}));
                    setTimeout(function (winner, pos) {
                        freeRunBot.userUtilities.moveUser(winner, pos, false);
                    }, 1 * 1000, winner, pos);
                }
            }
        },
        User: function (id, name) {
            this.id = id;
            this.username = name;
            this.jointime = Date.now();
            this.lastActivity = Date.now();
            this.votes = {
                woot: 0,
                meh: 0,
                curate: 0
            };
            this.lastEta = null;
            this.afkWarningCount = 0;
            this.afkCountdown = null;
            this.inRoom = true;
            this.isMuted = false;
            this.lastDC = {
                time: null,
                position: null,
                songCount: 0
            };
            this.lastKnownPosition = null;
        },
        userUtilities: {
            getJointime: function (user) {
                return user.jointime;
            },
            getUser: function (user) {
                return API.getUser(user.id);
            },
            updatePosition: function (user, newPos) {
                user.lastKnownPosition = newPos;
            },
            updateDC: function (user) {
                user.lastDC.time = Date.now();
                user.lastDC.position = user.lastKnownPosition;
                user.lastDC.songCount = freeRunBot.room.roomstats.songCount;
            },
            setLastActivity: function (user) {
                user.lastActivity = Date.now();
                user.afkWarningCount = 0;
                clearTimeout(user.afkCountdown);
            },
            getLastActivity: function (user) {
                return user.lastActivity;
            },
            getWarningCount: function (user) {
                return user.afkWarningCount;
            },
            setWarningCount: function (user, value) {
                user.afkWarningCount = value;
            },
            lookupUser: function (id) {
                for (var i = 0; i < freeRunBot.room.users.length; i++) {
                    if (freeRunBot.room.users[i].id === id) {
                        return freeRunBot.room.users[i];
                    }
                }
                return false;
            },
            lookupUserName: function (name) {
                for (var i = 0; i < freeRunBot.room.users.length; i++) {
                    var match = freeRunBot.room.users[i].username.trim() == name.trim();
                    if (match) {
                        return freeRunBot.room.users[i];
                    }
                }
                return false;
            },
            voteRatio: function (id) {
                var user = freeRunBot.userUtilities.lookupUser(id);
                var votes = user.votes;
                if (votes.meh === 0) votes.ratio = 1;
                else votes.ratio = (votes.woot / votes.meh).toFixed(2);
                return votes;

            },
            getPermission: function (obj) { //1 requests
                var u;
                if (typeof obj === "object") u = obj;
                else u = API.getUser(obj);
                for (var i = 0; i < botCreatorIDs.length; i++) {
                    if (botCreatorIDs[i].indexOf(u.id) > -1) return 10;
                }
                if (u.gRole < 2) return u.role;
                else {
                    switch (u.gRole) {
                        case 2:
                            return 7;
                        case 3:
                            return 8;
                        case 4:
                            return 9;
                        case 5:
                            return 10;
                    }
                }
                return 0;
            },
            moveUser: function (id, pos, priority) {
                var user = freeRunBot.userUtilities.lookupUser(id);
                var wlist = API.getWaitList();
                if (API.getWaitListPosition(id) === -1) {
                    if (wlist.length < 50) {
                        API.moderateAddDJ(id);
                        if (pos !== 0) setTimeout(function (id, pos) {
                            API.moderateMoveDJ(id, pos);
                        }, 1250, id, pos);
                    }
                    else {
                        var alreadyQueued = -1;
                        for (var i = 0; i < freeRunBot.room.queue.id.length; i++) {
                            if (freeRunBot.room.queue.id[i] === id) alreadyQueued = i;
                        }
                        if (alreadyQueued !== -1) {
                            freeRunBot.room.queue.position[alreadyQueued] = pos;
                            return API.sendChat(subChat(freeRunBot.chat.alreadyadding, {position: freeRunBot.room.queue.position[alreadyQueued]}));
                        }
                        freeRunBot.roomUtilities.booth.lockBooth();
                        if (priority) {
                            freeRunBot.room.queue.id.unshift(id);
                            freeRunBot.room.queue.position.unshift(pos);
                        }
                        else {
                            freeRunBot.room.queue.id.push(id);
                            freeRunBot.room.queue.position.push(pos);
                        }
                        var name = user.username;
                        return API.sendChat(subChat(freeRunBot.chat.adding, {name: name, position: freeRunBot.room.queue.position.length}));
                    }
                }
                else API.moderateMoveDJ(id, pos);
            },
            dclookup: function (id) {
                var user = freeRunBot.userUtilities.lookupUser(id);
                if (typeof user === 'boolean') return freeRunBot.chat.usernotfound;
                var name = user.username;
                if (user.lastDC.time === null) return subChat(freeRunBot.chat.notdisconnected, {name: name});
                var dc = user.lastDC.time;
                var pos = user.lastDC.position;
                if (pos === null) return freeRunBot.chat.noposition;
                var timeDc = Date.now() - dc;
                var validDC = false;
                if (freeRunBot.settings.maximumDc * 60 * 1000 > timeDc) {
                    validDC = true;
                }
                var time = freeRunBot.roomUtilities.msToStr(timeDc);
                if (!validDC) return (subChat(freeRunBot.chat.toolongago, {name: freeRunBot.userUtilities.getUser(user).username, time: time}));
                var songsPassed = freeRunBot.room.roomstats.songCount - user.lastDC.songCount;
                var afksRemoved = 0;
                var afkList = freeRunBot.room.afkList;
                for (var i = 0; i < afkList.length; i++) {
                    var timeAfk = afkList[i][1];
                    var posAfk = afkList[i][2];
                    if (dc < timeAfk && posAfk < pos) {
                        afksRemoved++;
                    }
                }
                var newPosition = user.lastDC.position - songsPassed - afksRemoved;
                if (newPosition <= 0) newPosition = 1;
                var msg = subChat(freeRunBot.chat.valid, {name: freeRunBot.userUtilities.getUser(user).username, time: time, position: newPosition});
                freeRunBot.userUtilities.moveUser(user.id, newPosition, true);
                return msg;
            }
        },

        roomUtilities: {
            rankToNumber: function (rankString) {
                var rankInt = null;
                switch (rankString) {
                    case "admin":
                        rankInt = 10;
                        break;
                    case "ambassador":
                        rankInt = 7;
                        break;
                    case "host":
                        rankInt = 5;
                        break;
                    case "cohost":
                        rankInt = 4;
                        break;
                    case "manager":
                        rankInt = 3;
                        break;
                    case "bouncer":
                        rankInt = 2;
                        break;
                    case "residentdj":
                        rankInt = 1;
                        break;
                    case "user":
                        rankInt = 0;
                        break;
                }
                return rankInt;
            },
            msToStr: function (msTime) {
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
                if (msTime > ms.day) {
                    timeAway.days = Math.floor(msTime / ms.day);
                    msTime = msTime % ms.day;
                }
                if (msTime > ms.hour) {
                    timeAway.hours = Math.floor(msTime / ms.hour);
                    msTime = msTime % ms.hour;
                }
                if (msTime > ms.minute) {
                    timeAway.minutes = Math.floor(msTime / ms.minute);
                    msTime = msTime % ms.minute;
                }
                if (msTime > ms.second) {
                    timeAway.seconds = Math.floor(msTime / ms.second);
                }
                if (timeAway.days !== 0) {
                    msg += timeAway.days.toString() + 'd';
                }
                if (timeAway.hours !== 0) {
                    msg += timeAway.hours.toString() + 'h';
                }
                if (timeAway.minutes !== 0) {
                    msg += timeAway.minutes.toString() + 'm';
                }
                if (timeAway.minutes < 1 && timeAway.hours < 1 && timeAway.days < 1) {
                    msg += timeAway.seconds.toString() + 's';
                }
                if (msg !== '') {
                    return msg;
                } else {
                    return false;
                }
            },
            booth: {
                lockTimer: setTimeout(function () {
                }, 1000),
                locked: false,
                lockBooth: function () {
                    API.moderateLockWaitList(!freeRunBot.roomUtilities.booth.locked);
                    freeRunBot.roomUtilities.booth.locked = false;
                    if (freeRunBot.settings.lockGuard) {
                        freeRunBot.roomUtilities.booth.lockTimer = setTimeout(function () {
                            API.moderateLockWaitList(freeRunBot.roomUtilities.booth.locked);
                        }, freeRunBot.settings.maximumLocktime * 60 * 1000);
                    }
                },
                unlockBooth: function () {
                    API.moderateLockWaitList(freeRunBot.roomUtilities.booth.locked);
                    clearTimeout(freeRunBot.roomUtilities.booth.lockTimer);
                }
            },
            afkCheck: function () {
                if (!freeRunBot.status || !freeRunBot.settings.afkRemoval) return void (0);
                var rank = freeRunBot.roomUtilities.rankToNumber(freeRunBot.settings.afkRankCheck);
                var djlist = API.getWaitList();
                var lastPos = Math.min(djlist.length, freeRunBot.settings.afkpositionCheck);
                if (lastPos - 1 > djlist.length) return void (0);
                for (var i = 0; i < lastPos; i++) {
                    if (typeof djlist[i] !== 'undefined') {
                        var id = djlist[i].id;
                        var user = freeRunBot.userUtilities.lookupUser(id);
                        if (typeof user !== 'boolean') {
                            var plugUser = freeRunBot.userUtilities.getUser(user);
                            if (rank !== null && freeRunBot.userUtilities.getPermission(plugUser) <= rank) {
                                var name = plugUser.username;
                                var lastActive = freeRunBot.userUtilities.getLastActivity(user);
                                var inactivity = Date.now() - lastActive;
                                var time = freeRunBot.roomUtilities.msToStr(inactivity);
                                var warncount = user.afkWarningCount;
                                if (inactivity > freeRunBot.settings.maximumAfk * 60 * 1000) {
                                    if (warncount === 0) {
                                        API.sendChat(subChat(freeRunBot.chat.warning1, {name: name, time: time}));
                                        user.afkWarningCount = 3;
                                        user.afkCountdown = setTimeout(function (userToChange) {
                                            userToChange.afkWarningCount = 1;
                                        }, 90 * 1000, user);
                                    }
                                    else if (warncount === 1) {
                                        API.sendChat(subChat(freeRunBot.chat.warning2, {name: name}));
                                        user.afkWarningCount = 3;
                                        user.afkCountdown = setTimeout(function (userToChange) {
                                            userToChange.afkWarningCount = 2;
                                        }, 30 * 1000, user);
                                    }
                                    else if (warncount === 2) {
                                        var pos = API.getWaitListPosition(id);
                                        if (pos !== -1) {
                                            pos++;
                                            freeRunBot.room.afkList.push([id, Date.now(), pos]);
                                            user.lastDC = {

                                                time: null,
                                                position: null,
                                                songCount: 0
                                            };
                                            API.moderateRemoveDJ(id);
                                            API.sendChat(subChat(freeRunBot.chat.afkremove, {name: name, time: time, position: pos, maximumafk: freeRunBot.settings.maximumAfk}));
                                        }
                                        user.afkWarningCount = 0;
                                    }
                                }
                            }
                        }
                    }
                }
            },
            changeDJCycle: function () {
                var toggle = $(".cycle-toggle");
                if (toggle.hasClass("disabled")) {
                    toggle.click();
                    if (freeRunBot.settings.cycleGuard) {
                        freeRunBot.room.cycleTimer = setTimeout(function () {
                            if (toggle.hasClass("enabled")) toggle.click();
                        }, freeRunBot.settings.cycleMaxTime * 60 * 1000);
                    }
                }
                else {
                    toggle.click();
                    clearTimeout(freeRunBot.room.cycleTimer);
                }
            },
            intervalMessage: function () {
                var interval;
                if (freeRunBot.settings.motdEnabled) interval = freeRunBot.settings.motdInterval;
                else interval = freeRunBot.settings.messageInterval;
                if ((freeRunBot.room.roomstats.songCount % interval) === 0 && freeRunBot.status) {
                    var msg;
                    if (freeRunBot.settings.motdEnabled) {
                        msg = freeRunBot.settings.motd;
                    }
                    else {
                        if (freeRunBot.settings.intervalMessages.length === 0) return void (0);
                        var messageNumber = freeRunBot.room.roomstats.songCount % freeRunBot.settings.intervalMessages.length;
                        msg = freeRunBot.settings.intervalMessages[messageNumber];
                    }
                    API.sendChat('/me ' + msg);
                }
            },
            updateBlacklists: function () {
                for (var bl in freeRunBot.settings.blacklists) {
                    freeRunBot.room.blacklists[bl] = [];
                    if (typeof freeRunBot.settings.blacklists[bl] === 'function') {
                        freeRunBot.room.blacklists[bl] = freeRunBot.settings.blacklists();
                    }
                    else if (typeof freeRunBot.settings.blacklists[bl] === 'string') {
                        if (freeRunBot.settings.blacklists[bl] === '') {
                            continue;
                        }
                        try {
                            (function (l) {
                                $.get(freeRunBot.settings.blacklists[l], function (data) {
                                    if (typeof data === 'string') {
                                        data = JSON.parse(data);
                                    }
                                    var list = [];
                                    for (var prop in data) {
                                        if (typeof data[prop].mid !== 'undefined') {
                                            list.push(data[prop].mid);
                                        }
                                    }
                                    freeRunBot.room.blacklists[l] = list;
                                })
                            })(bl);
                        }
                        catch (e) {
                            API.chatLog('Chyba nastavenia' + bl + 'blacklist.');
                            console.log('Chyba nastavenia' + bl + 'blacklist.');
                            console.log(e);
                        }
                    }
                }
            },
            logNewBlacklistedSongs: function () {
                if (typeof console.table !== 'undefined') {
                    console.table(freeRunBot.room.newBlacklisted);
                }
                else {
                    console.log(freeRunBot.room.newBlacklisted);
                }
            },
            exportNewBlacklistedSongs: function () {
                var list = {};
                for (var i = 0; i < freeRunBot.room.newBlacklisted.length; i++) {
                    var track = freeRunBot.room.newBlacklisted[i];
                    list[track.list] = [];
                    list[track.list].push({
                        title: track.title,
                        author: track.author,
                        mid: track.mid
                    });
                }
                return list;
            }
        },
        eventChat: function (chat) {
            chat.message = linkFixer(chat.message);
            chat.message = chat.message.trim();
            for (var i = 0; i < freeRunBot.room.users.length; i++) {
                if (freeRunBot.room.users[i].id === chat.uid) {
                    freeRunBot.userUtilities.setLastActivity(freeRunBot.room.users[i]);
                    if (freeRunBot.room.users[i].username !== chat.un) {
                        freeRunBot.room.users[i].username = chat.un;
                    }
                }
            }
            if (freeRunBot.chatUtilities.chatFilter(chat)) return void (0);
            if (!freeRunBot.chatUtilities.commandCheck(chat))
                freeRunBot.chatUtilities.action(chat);
        },
        eventUserjoin: function (user) {
            var known = false;
            var index = null;
            for (var i = 0; i < freeRunBot.room.users.length; i++) {
                if (freeRunBot.room.users[i].id === user.id) {
                    known = true;
                    index = i;
                }
            }
            var greet = true;
            var welcomeback = null;
            if (known) {
                freeRunBot.room.users[index].inRoom = true;
                var u = freeRunBot.userUtilities.lookupUser(user.id);
                var jt = u.jointime;
                var t = Date.now() - jt;
                if (t < 10 * 1000) greet = false;
                else welcomeback = true;
            }
            else {
                freeRunBot.room.users.push(new freeRunBot.User(user.id, user.username));
                welcomeback = false;
            }
            for (var j = 0; j < freeRunBot.room.users.length; j++) {
                if (freeRunBot.userUtilities.getUser(freeRunBot.room.users[j]).id === user.id) {
                    freeRunBot.userUtilities.setLastActivity(freeRunBot.room.users[j]);
                    freeRunBot.room.users[j].jointime = Date.now();
                }

            }
            if (freeRunBot.settings.welcome && greet) {
                welcomeback ?
                    setTimeout(function (user) {
                        API.sendChat(subChat(freeRunBot.chat.welcomeback, {name: user.username}));
                    }, 1 * 1000, user)
                    :
                    setTimeout(function (user) {
                        API.sendChat(subChat(freeRunBot.chat.welcome, {name: user.username}));
                    }, 1 * 1000, user);
            }
        },
        eventUserleave: function (user) {
            for (var i = 0; i < freeRunBot.room.users.length; i++) {
                if (freeRunBot.room.users[i].id === user.id) {
                    freeRunBot.userUtilities.updateDC(freeRunBot.room.users[i]);
                    freeRunBot.room.users[i].inRoom = false;
                }
            }
        },
        eventVoteupdate: function (obj) {
            for (var i = 0; i < freeRunBot.room.users.length; i++) {
                if (freeRunBot.room.users[i].id === obj.user.id) {
                    if (obj.vote === 1) {
                        freeRunBot.room.users[i].votes.woot++;
                    }
                    else {
                        freeRunBot.room.users[i].votes.meh++;
                    }
                }
            }

            var mehs = API.getScore().negative;
            var woots = API.getScore().positive;
            var dj = API.getDJ();

            if (freeRunBot.settings.voteSkip) {
                if ((mehs - woots) >= (freeRunBot.settings.voteSkipLimit)) {
                    API.sendChat(subChat(freeRunBot.chat.voteskipexceededlimit, {name: dj.username, limit: freeRunBot.settings.voteSkipLimit}));
                    API.moderateForceSkip();
                }
            }

        },
        eventCurateupdate: function (obj) {
            for (var i = 0; i < freeRunBot.room.users.length; i++) {
                if (freeRunBot.room.users[i].id === obj.user.id) {
                    freeRunBot.room.users[i].votes.curate++;
                }
            }
        },
        eventDjadvance: function (obj) {
            $("#woot").click();
            var user = freeRunBot.userUtilities.lookupUser(obj.dj.id)
            for(var i = 0; i < freeRunBot.room.users.length; i++){
                if(freeRunBot.room.users[i].id === user.id){
                    freeRunBot.room.users[i].lastDC = {
                        time: null,
                        position: null,
                        songCount: 0
                    };
                }
            }

            var lastplay = obj.lastPlay;
            if (typeof lastplay === 'undefined') return;
            if (freeRunBot.settings.songstats) {
                if (typeof freeRunBot.chat.songstatistics === "undefined") {
                    API.sendChat("/me " + lastplay.media.author + " - " + lastplay.media.title + ": " + lastplay.score.positive + "W/" + lastplay.score.grabs + "G/" + lastplay.score.negative + "M.")
                }
                else {
                    API.sendChat(subChat(freeRunBot.chat.songstatistics, {artist: lastplay.media.author, title: lastplay.media.title, woots: lastplay.score.positive, grabs: lastplay.score.grabs, mehs: lastplay.score.negative}))
                }
            }
            freeRunBot.room.roomstats.totalWoots += lastplay.score.positive;
            freeRunBot.room.roomstats.totalMehs += lastplay.score.negative;
            freeRunBot.room.roomstats.totalCurates += lastplay.score.grabs;
            freeRunBot.room.roomstats.songCount++;
            freeRunBot.roomUtilities.intervalMessage();
            freeRunBot.room.currentDJID = obj.dj.id;

            var mid = obj.media.format + ':' + obj.media.cid;
            for (var bl in freeRunBot.room.blacklists) {
                if (freeRunBot.settings.blacklistEnabled) {
                    if (freeRunBot.room.blacklists[bl].indexOf(mid) > -1) {
                        API.sendChat(subChat(freeRunBot.chat.isblacklisted, {blacklist: bl}));
                        return API.moderateForceSkip();
                    }
                }
            }

            /*var alreadyPlayed = false;
            for (var i = 0; i < freeRunBot.room.historyList.length; i++) {
                if (freeRunBot.room.historyList[i][0] === obj.media.cid) {
                    var firstPlayed = freeRunBot.room.historyList[i][1];
                    var plays = freeRunBot.room.historyList[i].length - 1;
                    var lastPlayed = freeRunBot.room.historyList[i][plays];
                    API.sendChat(subChat(freeRunBot.chat.songknown, {plays: plays, timetotal: freeRunBot.roomUtilities.msToStr(Date.now() - firstPlayed), lasttime: freeRunBot.roomUtilities.msToStr(Date.now() - lastPlayed)}));
                    freeRunBot.room.historyList[i].push(+new Date());
                    alreadyPlayed = true;
                }
            }
            if (!alreadyPlayed) {
                freeRunBot.room.historyList.push([obj.media.cid, +new Date()]);
            }*/

            if (freeRunBot.settings.historySkip) {
                var alreadyPlayed = false;
                var apihistory = API.getHistory();
                var name = obj.dj.username;
                for (var i = 0; i < apihistory.length; i++) {
                    if (apihistory[i].media.cid === obj.media.cid) {
                        API.sendChat(subChat(freeRunBot.chat.songknown, {name: name}));
                        API.moderateForceSkip();
                        freeRunBot.room.historyList[i].push(+new Date());
                        alreadyPlayed = true;
                    }
                }
                if (!alreadyPlayed) {
                    freeRunBot.room.historyList.push([obj.media.cid, +new Date()]);
                }
            }
            var newMedia = obj.media;
            if (freeRunBot.settings.timeGuard && newMedia.duration > freeRunBot.settings.maximumSongLength * 60 && !freeRunBot.room.roomevent) {
                var name = obj.dj.username;
                API.sendChat(subChat(freeRunBot.chat.timelimit, {name: name, maxlength: freeRunBot.settings.maximumSongLength}));
                API.moderateForceSkip();
            }
            if (user.ownSong) {
                API.sendChat(subChat(freeRunBot.chat.permissionownsong, {name: user.username}));
                user.ownSong = false;
            }
            clearTimeout(freeRunBot.room.autoskipTimer);
            if (freeRunBot.room.autoskip) {
                var remaining = obj.media.duration * 1000;
                freeRunBot.room.autoskipTimer = setTimeout(function () {
                    console.log("Skipping track.");
                    //API.sendChat('Song stuck, skipping...');
                    API.moderateForceSkip();
                }, remaining + 3000);
            }
            storeToStorage();

        },
        eventWaitlistupdate: function (users) {
            if (users.length < 50) {
                if (freeRunBot.room.queue.id.length > 0 && freeRunBot.room.queueable) {
                    freeRunBot.room.queueable = false;
                    setTimeout(function () {
                        freeRunBot.room.queueable = true;
                    }, 500);
                    freeRunBot.room.queueing++;
                    var id, pos;
                    setTimeout(
                        function () {
                            id = freeRunBot.room.queue.id.splice(0, 1)[0];
                            pos = freeRunBot.room.queue.position.splice(0, 1)[0];
                            API.moderateAddDJ(id, pos);
                            setTimeout(
                                function (id, pos) {
                                    API.moderateMoveDJ(id, pos);
                                    freeRunBot.room.queueing--;
                                    if (freeRunBot.room.queue.id.length === 0) setTimeout(function () {
                                        freeRunBot.roomUtilities.booth.unlockBooth();
                                    }, 1000);
                                }, 1000, id, pos);
                        }, 1000 + freeRunBot.room.queueing * 2500);
                }
            }
            for (var i = 0; i < users.length; i++) {
                var user = freeRunBot.userUtilities.lookupUser(users[i].id);
                freeRunBot.userUtilities.updatePosition(user, API.getWaitListPosition(users[i].id) + 1);
            }
        },
        chatcleaner: function (chat) {
            if (!freeRunBot.settings.filterChat) return false;
            if (freeRunBot.userUtilities.getPermission(chat.uid) > 1) return false;
            var msg = chat.message;
            var containsLetters = false;
            for (var i = 0; i < msg.length; i++) {
                ch = msg.charAt(i);
                if ((ch >= 'a' && ch <= 'z') || (ch >= 'A' && ch <= 'Z') || (ch >= '0' && ch <= '9') || ch === ':' || ch === '^') containsLetters = true;
            }
            if (msg === '') {
                return true;
            }
            if (!containsLetters && (msg.length === 1 || msg.length > 3)) return true;
            msg = msg.replace(/[ ,;.:\/=~+%^*\-\\"'&@#]/g, '');
            var capitals = 0;
            var ch;
            for (var i = 0; i < msg.length; i++) {
                ch = msg.charAt(i);
                if (ch >= 'A' && ch <= 'Z') capitals++;
            }
            if (capitals >= 40) {
                API.sendChat(subChat(freeRunBot.chat.caps, {name: chat.un}));
                return true;
            }
            msg = msg.toLowerCase();
            if (msg === 'skip') {
                API.sendChat(subChat(freeRunBot.chat.askskip, {name: chat.un}));
                return true;
            }
            for (var j = 0; j < freeRunBot.chatUtilities.spam.length; j++) {
                if (msg === freeRunBot.chatUtilities.spam[j]) {
                    API.sendChat(subChat(freeRunBot.chat.spam, {name: chat.un}));
                    return true;
                }
            }
            return false;
        },
        chatUtilities: {
            chatFilter: function (chat) {
                var msg = chat.message;
                var perm = freeRunBot.userUtilities.getPermission(chat.uid);
                var user = freeRunBot.userUtilities.lookupUser(chat.uid);
                var isMuted = false;
                for (var i = 0; i < freeRunBot.room.mutedUsers.length; i++) {
                    if (freeRunBot.room.mutedUsers[i] === chat.uid) isMuted = true;
                }
                if (isMuted) {
                    API.moderateDeleteChat(chat.cid);
                    return true;
                }
                if (freeRunBot.settings.lockdownEnabled) {
                    if (perm === 0) {
                        API.moderateDeleteChat(chat.cid);
                        return true;
                    }
                }
                if (freeRunBot.chatcleaner(chat)) {
                    API.moderateDeleteChat(chat.cid);
                    return true;
                }
                /**
                 var plugRoomLinkPatt = /(\bhttps?:\/\/(www.)?plug\.dj[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;
                 if (plugRoomLinkPatt.exec(msg)) {
                    if (perm === 0) {
                        API.sendChat(subChat(freeRunBot.chat.roomadvertising, {name: chat.un}));
                        API.moderateDeleteChat(chat.cid);
                        return true;
                    }
                }
                 **/
                if (msg.indexOf('http://adf.ly/') > -1) {
                    API.moderateDeleteChat(chat.cid);
                    API.sendChat(subChat(freeRunBot.chat.adfly, {name: chat.un}));
                    return true;
                }
                if (msg.indexOf('autojoin was not enabled') > 0 || msg.indexOf('AFK message was not enabled') > 0 || msg.indexOf('!afkdisable') > 0 || msg.indexOf('!joindisable') > 0 || msg.indexOf('autojoin disabled') > 0 || msg.indexOf('AFK message disabled') > 0) {
                    API.moderateDeleteChat(chat.cid);
                    return true;
                }

                var rlJoinChat = freeRunBot.chat.roulettejoin;
                var rlLeaveChat = freeRunBot.chat.rouletteleave;

                var joinedroulette = rlJoinChat.split('%%NAME%%');
                if (joinedroulette[1].length > joinedroulette[0].length) joinedroulette = joinedroulette[1];
                else joinedroulette = joinedroulette[0];

                var leftroulette = rlLeaveChat.split('%%NAME%%');
                if (leftroulette[1].length > leftroulette[0].length) leftroulette = leftroulette[1];
                else leftroulette = leftroulette[0];

                if ((msg.indexOf(joinedroulette) > -1 || msg.indexOf(leftroulette) > -1) && chat.uid === freeRunBot.loggedInID) {
                    setTimeout(function (id) {
                        API.moderateDeleteChat(id);
                    }, 2 * 1000, chat.cid);
                    return true;
                }
                return false;
            },
            commandCheck: function (chat) {
                var cmd;
                if (chat.message.charAt(0) === '!') {
                    var space = chat.message.indexOf(' ');
                    if (space === -1) {
                        cmd = chat.message;
                    }
                    else cmd = chat.message.substring(0, space);
                }
                else return false;
                var userPerm = freeRunBot.userUtilities.getPermission(chat.uid);
                //console.log("name: " + chat.un + ", perm: " + userPerm);
                if (chat.message !== "!join" && chat.message !== "!leave") {
                    if (userPerm === 0 && !freeRunBot.room.usercommand) return void (0);
                    if (!freeRunBot.room.allcommand) return void (0);
                }
                if (chat.message === '!eta' && freeRunBot.settings.etaRestriction) {
                    if (userPerm < 2) {
                        var u = freeRunBot.userUtilities.lookupUser(chat.uid);
                        if (u.lastEta !== null && (Date.now() - u.lastEta) < 1 * 60 * 60 * 1000) {
                            API.moderateDeleteChat(chat.cid);
                            return void (0);
                        }
                        else u.lastEta = Date.now();
                    }
                }
                var executed = false;

                for (var comm in freeRunBot.commands) {
                    var cmdCall = freeRunBot.commands[comm].command;
                    if (!Array.isArray(cmdCall)) {
                        cmdCall = [cmdCall]
                    }
                    for (var i = 0; i < cmdCall.length; i++) {
                        if (freeRunBot.settings.commandLiteral + cmdCall[i] === cmd) {
                            freeRunBot.commands[comm].functionality(chat, freeRunBot.settings.commandLiteral + cmdCall[i]);
                            executed = true;
                            break;
                        }
                    }
                }

                if (executed && userPerm === 0) {
                    freeRunBot.room.usercommand = false;
                    setTimeout(function () {
                        freeRunBot.room.usercommand = true;
                    }, freeRunBot.settings.commandCooldown * 1000);
                }
                if (executed) {
                    API.moderateDeleteChat(chat.cid);
                    freeRunBot.room.allcommand = false;
                    setTimeout(function () {
                        freeRunBot.room.allcommand = true;
                    }, 5 * 1000);
                }
                return executed;
            },
            action: function (chat) {
                var user = freeRunBot.userUtilities.lookupUser(chat.uid);
                if (chat.type === 'message') {
                    for (var j = 0; j < freeRunBot.room.users.length; j++) {
                        if (freeRunBot.userUtilities.getUser(freeRunBot.room.users[j]).id === chat.uid) {
                            freeRunBot.userUtilities.setLastActivity(freeRunBot.room.users[j]);
                        }

                    }
                }
                freeRunBot.room.roomstats.chatmessages++;
            },
            spam: [
                'hueh', 'hu3', 'brbr', 'heu', 'brbr', 'kkkk', 'spoder', 'mafia', 'zuera', 'zueira',
                'zueria', 'aehoo', 'aheu', 'alguem', 'algum', 'brazil', 'zoeira', 'fuckadmins', 'affff', 'vaisefoder', 'huenaarea',
                'hitler', 'ashua', 'ahsu', 'ashau', 'lulz', 'huehue', 'hue', 'huehuehue', 'merda', 'pqp', 'puta', 'mulher', 'pula', 'retarda', 'caralho', 'filha', 'ppk',
                'gringo', 'fuder', 'foder', 'hua', 'ahue', 'modafuka', 'modafoka', 'mudafuka', 'mudafoka', 'ooooooooooooooo', 'foda'
            ],
            curses: [
                'nigger', 'faggot', 'nigga', 'niqqa', 'motherfucker', 'modafocka'
            ]
        },
        connectAPI: function () {
            this.proxy = {
                eventChat: $.proxy(this.eventChat, this),
                eventUserskip: $.proxy(this.eventUserskip, this),
                eventUserjoin: $.proxy(this.eventUserjoin, this),
                eventUserleave: $.proxy(this.eventUserleave, this),
                eventUserfan: $.proxy(this.eventUserfan, this),
                eventFriendjoin: $.proxy(this.eventFriendjoin, this),
                eventFanjoin: $.proxy(this.eventFanjoin, this),
                eventVoteupdate: $.proxy(this.eventVoteupdate, this),
                eventCurateupdate: $.proxy(this.eventCurateupdate, this),
                eventRoomscoreupdate: $.proxy(this.eventRoomscoreupdate, this),
                eventDjadvance: $.proxy(this.eventDjadvance, this),
                eventDjupdate: $.proxy(this.eventDjupdate, this),
                eventWaitlistupdate: $.proxy(this.eventWaitlistupdate, this),
                eventVoteskip: $.proxy(this.eventVoteskip, this),
                eventModskip: $.proxy(this.eventModskip, this),
                eventChatcommand: $.proxy(this.eventChatcommand, this),
                eventHistoryupdate: $.proxy(this.eventHistoryupdate, this)

            };
            API.on(API.CHAT, this.proxy.eventChat);
            API.on(API.USER_SKIP, this.proxy.eventUserskip);
            API.on(API.USER_JOIN, this.proxy.eventUserjoin);
            API.on(API.USER_LEAVE, this.proxy.eventUserleave);
            API.on(API.USER_FAN, this.proxy.eventUserfan);
            API.on(API.VOTE_UPDATE, this.proxy.eventVoteupdate);
            API.on(API.GRAB_UPDATE, this.proxy.eventCurateupdate);
            API.on(API.ROOM_SCORE_UPDATE, this.proxy.eventRoomscoreupdate);
            API.on(API.ADVANCE, this.proxy.eventDjadvance);
            API.on(API.WAIT_LIST_UPDATE, this.proxy.eventWaitlistupdate);
            API.on(API.MOD_SKIP, this.proxy.eventModskip);
            API.on(API.CHAT_COMMAND, this.proxy.eventChatcommand);
            API.on(API.HISTORY_UPDATE, this.proxy.eventHistoryupdate);
        },
        disconnectAPI: function () {
            API.off(API.CHAT, this.proxy.eventChat);
            API.off(API.USER_SKIP, this.proxy.eventUserskip);
            API.off(API.USER_JOIN, this.proxy.eventUserjoin);
            API.off(API.USER_LEAVE, this.proxy.eventUserleave);
            API.off(API.USER_FAN, this.proxy.eventUserfan);
            API.off(API.VOTE_UPDATE, this.proxy.eventVoteupdate);
            API.off(API.CURATE_UPDATE, this.proxy.eventCurateupdate);
            API.off(API.ROOM_SCORE_UPDATE, this.proxy.eventRoomscoreupdate);
            API.off(API.ADVANCE, this.proxy.eventDjadvance);
            API.off(API.WAIT_LIST_UPDATE, this.proxy.eventWaitlistupdate);
            API.off(API.MOD_SKIP, this.proxy.eventModskip);
            API.off(API.CHAT_COMMAND, this.proxy.eventChatcommand);
            API.off(API.HISTORY_UPDATE, this.proxy.eventHistoryupdate);
        },
        startup: function () {
            Function.prototype.toString = function () {
                return 'Function.'
            };
            var u = API.getUser();
            if (freeRunBot.userUtilities.getPermission(u) < 2) return API.chatLog(freeRunBot.chat.greyuser);
            if (freeRunBot.userUtilities.getPermission(u) === 2) API.chatLog(freeRunBot.chat.bouncer);
            freeRunBot.connectAPI();
            API.moderateDeleteChat = function (cid) {
                $.ajax({
                    url: "https://plug.dj/_/chat/" + cid,
                    type: "DELETE"
                })
            };
            retrieveSettings();
            retrieveFromStorage();
            window.bot = freeRunBot;
            freeRunBot.roomUtilities.updateBlacklists();
            setInterval(freeRunBot.roomUtilities.updateBlacklists, 60 * 60 * 1000);
            freeRunBot.getNewBlacklistedSongs = freeRunBot.roomUtilities.exportNewBlacklistedSongs;
            freeRunBot.logNewBlacklistedSongs = freeRunBot.roomUtilities.logNewBlacklistedSongs;
            if (freeRunBot.room.roomstats.launchTime === null) {
                freeRunBot.room.roomstats.launchTime = Date.now();
            }

            for (var j = 0; j < freeRunBot.room.users.length; j++) {
                freeRunBot.room.users[j].inRoom = false;
            }
            var userlist = API.getUsers();
            for (var i = 0; i < userlist.length; i++) {
                var known = false;
                var ind = null;
                for (var j = 0; j < freeRunBot.room.users.length; j++) {
                    if (freeRunBot.room.users[j].id === userlist[i].id) {
                        known = true;
                        ind = j;
                    }
                }
                if (known) {
                    freeRunBot.room.users[ind].inRoom = true;
                }
                else {
                    freeRunBot.room.users.push(new freeRunBot.User(userlist[i].id, userlist[i].username));
                    ind = freeRunBot.room.users.length - 1;
                }
                var wlIndex = API.getWaitListPosition(freeRunBot.room.users[ind].id) + 1;
                freeRunBot.userUtilities.updatePosition(freeRunBot.room.users[ind], wlIndex);
            }
            freeRunBot.room.afkInterval = setInterval(function () {
                freeRunBot.roomUtilities.afkCheck()
            }, 10 * 1000);
            freeRunBot.room.autodisableInterval = setInterval(function () {
                freeRunBot.room.autodisableFunc();
            }, 60 * 60 * 1000);
            freeRunBot.loggedInID = API.getUser().id;
            freeRunBot.status = true;
            API.sendChat('/cap ' + freeRunBot.settings.startupCap);
            API.setVolume(freeRunBot.settings.startupVolume);
            $("#woot").click();
            if (freeRunBot.settings.startupEmoji) {
                var emojibuttonoff = $(".icon-emoji-off");
                if (emojibuttonoff.length > 0) {
                    emojibuttonoff[0].click();
                }
                API.chatLog(':smile: Emoji zapnuté.');
            }
            else {
                var emojibuttonon = $(".icon-emoji-on");
                if (emojibuttonon.length > 0) {
                    emojibuttonon[0].click();
                }
                API.chatLog('Emojis disabled.');
            }
            API.chatLog('Avatary nastavené na ' + freeRunBot.settings.startupCap);
            API.chatLog('Hlasitosť nastavená na ' + freeRunBot.settings.startupVolume);
            loadChat(API.sendChat(subChat(freeRunBot.chat.online, {botname: freeRunBot.settings.botName, version: freeRunBot.version})));
        },
        commands: {
            executable: function (minRank, chat) {
                var id = chat.uid;
                var perm = freeRunBot.userUtilities.getPermission(id);
                var minPerm;
                switch (minRank) {
                    case 'admin':
                        minPerm = 10;
                        break;
                    case 'ambassador':
                        minPerm = 7;
                        break;
                    case 'host':
                        minPerm = 5;
                        break;
                    case 'cohost':
                        minPerm = 4;
                        break;
                    case 'manager':
                        minPerm = 3;
                        break;
                    case 'mod':
                        if (freeRunBot.settings.bouncerPlus) {
                            minPerm = 2;
                        }
                        else {
                            minPerm = 3;
                        }
                        break;
                    case 'bouncer':
                        minPerm = 2;
                        break;
                    case 'residentdj':
                        minPerm = 1;
                        break;
                    case 'user':
                        minPerm = 0;
                        break;
                    default:
                        API.chatLog('chyba pridelenia minimálneho oprávnenia');
                }
                return perm >= minPerm;

            },
            /**
             command: {
                        command: 'cmd',
                        rank: 'user/bouncer/mod/manager',
                        type: 'startsWith/exact',
                        functionality: function(chat, cmd){
                                if(this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                                if( !freeRunBot.commands.executable(this.rank, chat) ) return void (0);
                                else{
                                
                                }
                        }
                },
             **/

            activeCommand: {
                command: 'active',
                rank: 'bouncer',
                type: 'startsWith',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!freeRunBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var msg = chat.message;
                        var now = Date.now();
                        var chatters = 0;
                        var time;
                        if (msg.length === cmd.length) time = 60;
                        else {
                            time = msg.substring(cmd.length + 1);
                            if (isNaN(time)) return API.sendChat(subChat(freeRunBot.chat.invalidtime, {name: chat.un}));
                        }
                        for (var i = 0; i < freeRunBot.room.users.length; i++) {
                            userTime = freeRunBot.userUtilities.getLastActivity(freeRunBot.room.users[i]);
                            if ((now - userTime) <= (time * 60 * 1000)) {
                                chatters++;
                            }
                        }
                        API.sendChat(subChat(freeRunBot.chat.activeusersintime, {name: chat.un, amount: chatters, time: time}));
                    }
                }
            },

            addCommand: {
                command: 'add',
                rank: 'mod',
                type: 'startsWith',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!freeRunBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var msg = chat.message;
                        if (msg.length === cmd.length) return API.sendChat(subChat(freeRunBot.chat.nouserspecified, {name: chat.un}));
                        var name = msg.substr(cmd.length + 2);
                        var user = freeRunBot.userUtilities.lookupUserName(name);
                        if (msg.length > cmd.length + 2) {
                            if (typeof user !== 'undefined') {
                                if (freeRunBot.room.roomevent) {
                                    freeRunBot.room.eventArtists.push(user.id);
                                }
                                API.moderateAddDJ(user.id);
                            } else API.sendChat(subChat(freeRunBot.chat.invaliduserspecified, {name: chat.un}));
                        }
                    }
                }
            },

            afklimitCommand: {
                command: 'afklimit',
                rank: 'manager',
                type: 'startsWith',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!freeRunBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var msg = chat.message;
                        if (msg.length === cmd.length) return API.sendChat(subChat(freeRunBot.chat.nolimitspecified, {name: chat.un}));
                        var limit = msg.substring(cmd.length + 1);
                        if (!isNaN(limit)) {
                            freeRunBot.settings.maximumAfk = parseInt(limit, 10);
                            API.sendChat(subChat(freeRunBot.chat.maximumafktimeset, {name: chat.un, time: freeRunBot.settings.maximumAfk}));
                        }
                        else API.sendChat(subChat(freeRunBot.chat.invalidlimitspecified, {name: chat.un}));
                    }
                }
            },

            afkremovalCommand: {
                command: 'afkremoval',
                rank: 'mod',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!freeRunBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        if (freeRunBot.settings.afkRemoval) {
                            freeRunBot.settings.afkRemoval = !freeRunBot.settings.afkRemoval;
                            clearInterval(freeRunBot.room.afkInterval);
                            API.sendChat(subChat(freeRunBot.chat.toggleoff, {name: chat.un, 'function': freeRunBot.chat.afkremoval}));
                        }
                        else {
                            freeRunBot.settings.afkRemoval = !freeRunBot.settings.afkRemoval;
                            freeRunBot.room.afkInterval = setInterval(function () {
                                freeRunBot.roomUtilities.afkCheck()
                            }, 2 * 1000);
                            API.sendChat(subChat(freeRunBot.chat.toggleon, {name: chat.un, 'function': freeRunBot.chat.afkremoval}));
                        }
                    }
                }
            },

            afkresetCommand: {
                command: 'afkreset',
                rank: 'bouncer',
                type: 'startsWith',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!freeRunBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var msg = chat.message;
                        if (msg.length === cmd.length) return API.sendChat(subChat(freeRunBot.chat.nouserspecified, {name: chat.un}));
                        var name = msg.substring(cmd.length + 2);
                        var user = freeRunBot.userUtilities.lookupUserName(name);
                        if (typeof user === 'boolean') return API.sendChat(subChat(freeRunBot.chat.invaliduserspecified, {name: chat.un}));
                        freeRunBot.userUtilities.setLastActivity(user);
                        API.sendChat(subChat(freeRunBot.chat.afkstatusreset, {name: chat.un, username: name}));
                    }
                }
            },

            afktimeCommand: {
                command: 'afktime',
                rank: 'bouncer',
                type: 'startsWith',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!freeRunBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var msg = chat.message;
                        if (msg.length === cmd.length) return API.sendChat(subChat(freeRunBot.chat.nouserspecified, {name: chat.un}));
                        var name = msg.substring(cmd.length + 2);
                        var user = freeRunBot.userUtilities.lookupUserName(name);
                        if (typeof user === 'boolean') return API.sendChat(subChat(freeRunBot.chat.invaliduserspecified, {name: chat.un}));
                        var lastActive = freeRunBot.userUtilities.getLastActivity(user);
                        var inactivity = Date.now() - lastActive;
                        var time = freeRunBot.roomUtilities.msToStr(inactivity);
                        API.sendChat(subChat(freeRunBot.chat.inactivefor, {name: chat.un, username: name, time: time}));
                    }
                }
            },

            autodisableCommand: {
                command: 'autodisable',
                rank: 'bouncer',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!freeRunBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        if (freeRunBot.settings.autodisable) {
                            freeRunBot.settings.autodisable = !freeRunBot.settings.autodisable;
                            return API.sendChat(subChat(freeRunBot.chat.toggleoff, {name: chat.un, 'function': freeRunBot.chat.autodisable}));
                        }
                        else {
                            freeRunBot.settings.autodisable = !freeRunBot.settings.autodisable;
                            return API.sendChat(subChat(freeRunBot.chat.toggleon, {name: chat.un, 'function': freeRunBot.chat.autodisable}));
                        }

                    }
                }
            },

            autoskipCommand: {
                command: 'autoskip',
                rank: 'mod',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!freeRunBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        if (freeRunBot.room.autoskip) {
                            freeRunBot.room.autoskip = !freeRunBot.room.autoskip;
                            clearTimeout(freeRunBot.room.autoskipTimer);
                            return API.sendChat(subChat(freeRunBot.chat.toggleoff, {name: chat.un, 'function': freeRunBot.chat.autoskip}));
                        }
                        else {
                            freeRunBot.room.autoskip = !freeRunBot.room.autoskip;
                            return API.sendChat(subChat(freeRunBot.chat.toggleon, {name: chat.un, 'function': freeRunBot.chat.autoskip}));
                        }
                    }
                }
            },

            autowootCommand: {
                command: 'autowoot',
                rank: 'user',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!freeRunBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        API.sendChat(freeRunBot.chat.autowoot);
                    }
                }
            },

            baCommand: {
                command: 'ba',
                rank: 'user',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!freeRunBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        API.sendChat(freeRunBot.chat.brandambassador);
                    }
                }
            },

            banCommand: {
                command: 'ban',
                rank: 'bouncer',
                type: 'startsWith',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!freeRunBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var msg = chat.message;
                        if (msg.length === cmd.length) return API.sendChat(subChat(freeRunBot.chat.nouserspecified, {name: chat.un}));
                        var name = msg.substr(cmd.length + 2);
                        var user = freeRunBot.userUtilities.lookupUserName(name);
                        if (typeof user === 'boolean') return API.sendChat(subChat(freeRunBot.chat.invaliduserspecified, {name: chat.un}));
                        API.moderateBanUser(user.id, 1, API.BAN.DAY);
                    }
                }
            },

            blacklistCommand: {
                command: ['blacklist', 'bl'],
                rank: 'bouncer',
                type: 'startsWith',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!freeRunBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var msg = chat.message;
                        if (msg.length === cmd.length) return API.sendChat(subChat(freeRunBot.chat.nolistspecified, {name: chat.un}));
                        var list = msg.substr(cmd.length + 1);
                        if (typeof freeRunBot.room.blacklists[list] === 'undefined') return API.sendChat(subChat(freeRunBot.chat.invalidlistspecified, {name: chat.un}));
                        else {
                            var media = API.getMedia();
                            var track = {
                                list: list,
                                author: media.author,
                                title: media.title,
                                mid: media.format + ':' + media.cid
                            };
                            freeRunBot.room.newBlacklisted.push(track);
                            freeRunBot.room.blacklists[list].push(media.format + ':' + media.cid);
                            API.sendChat(subChat(freeRunBot.chat.newblacklisted, {name: chat.un, blacklist: list, author: media.author, title: media.title, mid: media.format + ':' + media.cid}));
                            API.moderateForceSkip();
                            if (typeof freeRunBot.room.newBlacklistedSongFunction === 'function') {
                                freeRunBot.room.newBlacklistedSongFunction(track);
                            }
                        }
                    }
                }
            },

            blinfoCommand: {
                command: 'blinfo',
                rank: 'bouncer',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!freeRunBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var author = API.getMedia().author;
                        var title = API.getMedia().title;
                        var name = chat.un;
                        var format = API.getMedia().format;
                        var cid = API.getMedia().cid;
                        var songid = format + ":" + cid;

                        API.sendChat(subChat(freeRunBot.chat.blinfo, {name: name, author: author, title: title, songid: songid}));
                    }
                }
            },

            bouncerPlusCommand: {
                command: 'bouncer+',
                rank: 'mod',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!freeRunBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var msg = chat.message;
                        if (freeRunBot.settings.bouncerPlus) {
                            freeRunBot.settings.bouncerPlus = false;
                            return API.sendChat(subChat(freeRunBot.chat.toggleoff, {name: chat.un, 'function': 'Bouncer+'}));
                        }
                        else {
                            if (!freeRunBot.settings.bouncerPlus) {
                                var id = chat.uid;
                                var perm = freeRunBot.userUtilities.getPermission(id);
                                if (perm > 2) {
                                    freeRunBot.settings.bouncerPlus = true;
                                    return API.sendChat(subChat(freeRunBot.chat.toggleon, {name: chat.un, 'function': 'Bouncer+'}));
                                }
                            }
                            else return API.sendChat(subChat(freeRunBot.chat.bouncerplusrank, {name: chat.un}));
                        }
                    }
                }
            },

            clearchatCommand: {
                command: 'clearchat',
                rank: 'manager',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!freeRunBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var currentchat = $('#chat-messages').children();
                        for (var i = 0; i < currentchat.length; i++) {
                            API.moderateDeleteChat(currentchat[i].getAttribute("data-cid"));
                        }
                        return API.sendChat(subChat(freeRunBot.chat.chatcleared, {name: chat.un}));
                    }
                }
            },

            commandsCommand: {
                command: 'commands',
                rank: 'user',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!freeRunBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        API.sendChat(subChat(freeRunBot.chat.commandslink, {botname: freeRunBot.settings.botName, link: freeRunBot.cmdLink}));
                    }
                }
            },

            cookieCommand: {
                command: 'cookie',
                rank: 'user',
                type: 'startsWith',
                cookies: ['ti dal čokoládový koláč!',
                    'ti poslal plesnivý koláč... FUJ!',
                    'ti poslal omrvinku z koláča, nevydržal to... :/',
                    'ti poslal cukrový koláč.',
                    'ti poslal otrávený koláč. Nejedz ho!',
                    'ti poslal veľkú tortu. Máš narodeniny?',
                    'ti poslal koláč s odkazom "Milujem ťa!"',
                    'ti poslal koláč s odkazom "Zjedz ho a si mŕtvy človek!"',
                    'ti poslal kamenný koláč. Máš dobré zuby naň?'
                ],
                getCookie: function () {
                    var c = Math.floor(Math.random() * this.cookies.length);
                    return this.cookies[c];
                },
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!freeRunBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var msg = chat.message;

                        var space = msg.indexOf(' ');
                        if (space === -1) {
                            API.sendChat(freeRunBot.chat.eatcookie);
                            return false;
                        }
                        else {
                            var name = msg.substring(space + 2);
                            var user = freeRunBot.userUtilities.lookupUserName(name);
                            if (user === false || !user.inRoom) {
                                return API.sendChat(subChat(freeRunBot.chat.nousercookie, {name: name}));
                            }
                            else if (user.username === chat.un) {
                                return API.sendChat(subChat(freeRunBot.chat.selfcookie, {name: name}));
                            }
                            else {
                                return API.sendChat(subChat(freeRunBot.chat.cookie, {nameto: user.username, namefrom: chat.un, cookie: this.getCookie()}));
                            }
                        }
                    }
                }
            },

            cycleCommand: {
                command: 'cycle',
                rank: 'manager',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!freeRunBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        freeRunBot.roomUtilities.changeDJCycle();
                    }
                }
            },

            cycleguardCommand: {
                command: 'cycleguard',
                rank: 'bouncer',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!freeRunBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        if (freeRunBot.settings.cycleGuard) {
                            freeRunBot.settings.cycleGuard = !freeRunBot.settings.cycleGuard;
                            return API.sendChat(subChat(freeRunBot.chat.toggleoff, {name: chat.un, 'function': freeRunBot.chat.cycleguard}));
                        }
                        else {
                            freeRunBot.settings.cycleGuard = !freeRunBot.settings.cycleGuard;
                            return API.sendChat(subChat(freeRunBot.chat.toggleon, {name: chat.un, 'function': freeRunBot.chat.cycleguard}));
                        }

                    }
                }
            },

            cycletimerCommand: {
                command: 'cycletimer',
                rank: 'manager',
                type: 'startsWith',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!freeRunBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var msg = chat.message;
                        var cycleTime = msg.substring(cmd.length + 1);
                        if (!isNaN(cycleTime) && cycleTime !== "") {
                            freeRunBot.settings.maximumCycletime = cycleTime;
                            return API.sendChat(subChat(freeRunBot.chat.cycleguardtime, {name: chat.un, time: freeRunBot.settings.maximumCycletime}));
                        }
                        else return API.sendChat(subChat(freeRunBot.chat.invalidtime, {name: chat.un}));

                    }
                }
            },

            voteskipCommand: {
                command: 'voteskip',
                rank: 'manager',
                type: 'startsWith',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!freeRunBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var msg = chat.message;
                        if (msg.length <= cmd.length + 1) return API.sendChat(subChat(freeRunBot.chat.voteskiplimit, {name: chat.un, limit: freeRunBot.settings.voteSkipLimit}));
                        var argument = msg.substring(cmd.length + 1);
                        if (!freeRunBot.settings.voteSkip) freeRunBot.settings.voteSkip = !freeRunBot.settings.voteSkip;
                        if (isNaN(argument)) {
                            API.sendChat(subChat(freeRunBot.chat.voteskipinvalidlimit, {name: chat.un}));
                        }
                        else {
                            freeRunBot.settings.voteSkipLimit = argument;
                            API.sendChat(subChat(freeRunBot.chat.voteskipsetlimit, {name: chat.un, limit: freeRunBot.settings.voteSkipLimit}));
                        }
                    }
                }
            },

            togglevoteskipCommand: {
                command: 'togglevoteskip',
                rank: 'bouncer',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!freeRunBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        if (freeRunBot.settings.voteSkip) {
                            freeRunBot.settings.voteSkip = !freeRunBot.settings.voteSkip;
                            API.sendChat(subChat(freeRunBot.chat.toggleoff, {name: chat.un, 'function': freeRunBot.chat.voteskip}));
                        }
                        else {
                            freeRunBot.settings.voteskip = !freeRunBot.settings.voteskip;
                            API.sendChat(subChat(freeRunBot.chat.toggleon, {name: chat.un, 'function': freeRunBot.chat.voteskip}));
                        }
                    }
                }
            },

            dclookupCommand: {
                command: ['dclookup', 'dc'],
                rank: 'user',
                type: 'startsWith',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!freeRunBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var msg = chat.message;
                        var name;
                        if (msg.length === cmd.length) name = chat.un;
                        else {
                            name = msg.substring(cmd.length + 2);
                            var perm = freeRunBot.userUtilities.getPermission(chat.uid);
                            if (perm < 2) return API.sendChat(subChat(freeRunBot.chat.dclookuprank, {name: chat.un}));
                        }
                        var user = freeRunBot.userUtilities.lookupUserName(name);
                        if (typeof user === 'boolean') return API.sendChat(subChat(freeRunBot.chat.invaliduserspecified, {name: chat.un}));
                        var toChat = freeRunBot.userUtilities.dclookup(user.id);
                        API.sendChat(toChat);
                    }
                }
            },

            /*deletechatCommand: {
                command: 'deletechat',
                rank: 'mod',
                type: 'startsWith',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!freeRunBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var msg = chat.message;
                        if (msg.length === cmd.length) return API.sendChat(subChat(freeRunBot.chat.nouserspecified, {name: chat.un}));
                        var name = msg.substring(cmd.length + 2);
                        var user = freeRunBot.userUtilities.lookupUserName(name);
                        if (typeof user === 'boolean') return API.sendChat(subChat(freeRunBot.chat.invaliduserspecified, {name: chat.un}));
                        var chats = $('.from');
                        for (var i = 0; i < chats.length; i++) {
                            var n = chats[i].textContent;
                            if (name.trim() === n.trim()) {
                                var cid = $(chats[i]).parent()[0].getAttribute('data-cid');
                                API.moderateDeleteChat(cid);
                            }
                        }
                        API.sendChat(subChat(freeRunBot.chat.deletechat, {name: chat.un, username: name}));
                    }
                }
            },*/

            emojiCommand: {
                command: 'emoji',
                rank: 'user',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!freeRunBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var link = 'http://www.emoji-cheat-sheet.com/';
                        API.sendChat(subChat(freeRunBot.chat.emojilist, {link: link}));
                    }
                }
            },

            etaCommand: {
                command: 'eta',
                rank: 'user',
                type: 'startsWith',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!freeRunBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var perm = freeRunBot.userUtilities.getPermission(chat.uid);
                        var msg = chat.message;
                        var name;
                        if (msg.length > cmd.length) {
                            if (perm < 2) return void (0);
                            name = msg.substring(cmd.length + 2);
                        } else name = chat.un;
                        var user = freeRunBot.userUtilities.lookupUserName(name);
                        if (typeof user === 'boolean') return API.sendChat(subChat(freeRunBot.chat.invaliduserspecified, {name: chat.un}));
                        var pos = API.getWaitListPosition(user.id);
                        if (pos < 0) return API.sendChat(subChat(freeRunBot.chat.notinwaitlist, {name: name}));
                        var timeRemaining = API.getTimeRemaining();
                        var estimateMS = ((pos + 1) * 4 * 60 + timeRemaining) * 1000;
                        var estimateString = freeRunBot.roomUtilities.msToStr(estimateMS);
                        API.sendChat(subChat(freeRunBot.chat.eta, {name: name, time: estimateString}));
                    }
                }
            },

            fbCommand: {
                command: 'fb',
                rank: 'user',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!freeRunBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        if (typeof freeRunBot.settings.fbLink === "string")
                            API.sendChat(subChat(freeRunBot.chat.facebook, {link: freeRunBot.settings.fbLink}));
                    }
                }
            },

            filterCommand: {
                command: 'filter',
                rank: 'bouncer',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!freeRunBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        if (freeRunBot.settings.filterChat) {
                            freeRunBot.settings.filterChat = !freeRunBot.settings.filterChat;
                            return API.sendChat(subChat(freeRunBot.chat.toggleoff, {name: chat.un, 'function': freeRunBot.chat.chatfilter}));
                        }
                        else {
                            freeRunBot.settings.filterChat = !freeRunBot.settings.filterChat;
                            return API.sendChat(subChat(freeRunBot.chat.toggleon, {name: chat.un, 'function': freeRunBot.chat.chatfilter}));
                        }
                    }
                }
            },

            helpCommand: {
                command: 'jshofhohfslhfslugho',
                rank: 'user',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!freeRunBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var link = "http://i.imgur.com/SBAso1N.jpg";
                        API.sendChat(subChat(freeRunBot.chat.starterhelp, {link: link}));
                    }
                }
            },

            historyskipCommand: {
                command: 'historyskip',
                rank: 'bouncer',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!freeRunBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        if (freeRunBot.settings.historySkip) {
                            freeRunBot.settings.historySkip = !freeRunBot.settings.historySkip;
                            API.sendChat(subChat(freeRunBot.chat.toggleoff, {name: chat.un, 'function': freeRunBot.chat.historyskip}));
                        }
                        else {
                            freeRunBot.settings.historySkip = !freeRunBot.settings.historySkip;
                            API.sendChat(subChat(freeRunBot.chat.toggleon, {name: chat.un, 'function': freeRunBot.chat.historyskip}));
                        }
                    }
                }
            },

            joinCommand: {
                command: 'join',
                rank: 'user',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!freeRunBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        if (freeRunBot.room.roulette.rouletteStatus && freeRunBot.room.roulette.participants.indexOf(chat.uid) < 0) {
                            freeRunBot.room.roulette.participants.push(chat.uid);
                            API.sendChat(subChat(freeRunBot.chat.roulettejoin, {name: chat.un}));
                        }
                    }
                }
            },

            jointimeCommand: {
                command: 'jointime',
                rank: 'bouncer',
                type: 'startsWith',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!freeRunBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var msg = chat.message;
                        if (msg.length === cmd.length) return API.sendChat(subChat(freeRunBot.chat.nouserspecified, {name: chat.un}));
                        var name = msg.substring(cmd.length + 2);
                        var user = freeRunBot.userUtilities.lookupUserName(name);
                        if (typeof user === 'boolean') return API.sendChat(subChat(freeRunBot.chat.invaliduserspecified, {name: chat.un}));
                        var join = freeRunBot.userUtilities.getJointime(user);
                        var time = Date.now() - join;
                        var timeString = freeRunBot.roomUtilities.msToStr(time);
                        API.sendChat(subChat(freeRunBot.chat.jointime, {namefrom: chat.un, username: name, time: timeString}));
                    }
                }
            },

            kickCommand: {
                command: 'kick',
                rank: 'bouncer',
                type: 'startsWith',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!freeRunBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var msg = chat.message;
                        var lastSpace = msg.lastIndexOf(' ');
                        var time;
                        var name;
                        if (lastSpace === msg.indexOf(' ')) {
                            time = 0.25;
                            name = msg.substring(cmd.length + 2);
                        }
                        else {
                            time = msg.substring(lastSpace + 1);
                            name = msg.substring(cmd.length + 2, lastSpace);
                        }

                        var user = freeRunBot.userUtilities.lookupUserName(name);
                        var from = chat.un;
                        if (typeof user === 'boolean') return API.sendChat(subChat(freeRunBot.chat.nouserspecified, {name: chat.un}));

                        var permFrom = freeRunBot.userUtilities.getPermission(chat.uid);
                        var permTokick = freeRunBot.userUtilities.getPermission(user.id);

                        if (permFrom <= permTokick)
                            return API.sendChat(subChat(freeRunBot.chat.kickrank, {name: chat.un}));

                        if (!isNaN(time)) {
                            API.sendChat(subChat(freeRunBot.chat.kick, {name: chat.un, username: name, time: time}));
                            if (time > 24 * 60 * 60) API.moderateBanUser(user.id, 1, API.BAN.PERMA);
                            else API.moderateBanUser(user.id, 1, API.BAN.DAY);
                            setTimeout(function (id, name) {
                                API.moderateUnbanUser(id);
                                console.log('Unbanned @' + name + '. (' + id + ')');
                            }, time * 60 * 1000, user.id, name);
                        }
                        else API.sendChat(subChat(freeRunBot.chat.invalidtime, {name: chat.un}));
                    }
                }
            },

            killCommand: {
                command: 'kill',
                rank: 'bouncer',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!freeRunBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        storeToStorage();
                        API.sendChat(freeRunBot.chat.kill);
                        freeRunBot.disconnectAPI();
                        setTimeout(function () {
                            kill();
                        }, 1000);
                    }
                }
            },

            leaveCommand: {
                command: 'leave',
                rank: 'user',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!freeRunBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var ind = freeRunBot.room.roulette.participants.indexOf(chat.uid);
                        if (ind > -1) {
                            freeRunBot.room.roulette.participants.splice(ind, 1);
                            API.sendChat(subChat(freeRunBot.chat.rouletteleave, {name: chat.un}));
                        }
                    }
                }
            },

            linkCommand: {
                command: 'link',
                rank: 'user',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!freeRunBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var media = API.getMedia();
                        var from = chat.un;
                        var user = freeRunBot.userUtilities.lookupUser(chat.uid);
                        var perm = freeRunBot.userUtilities.getPermission(chat.uid);
                        var dj = API.getDJ().id;
                        var isDj = false;
                        if (dj === chat.uid) isDj = true;
                        if (perm >= 1 || isDj) {
                            if (media.format === 1) {
                                var linkToSong = "https://www.youtube.com/watch?v=" + media.cid;
                                API.sendChat(subChat(freeRunBot.chat.songlink, {name: from, link: linkToSong}));
                            }
                            if (media.format === 2) {
                                SC.get('/tracks/' + media.cid, function (sound) {
                                    API.sendChat(subChat(freeRunBot.chat.songlink, {name: from, link: sound.permalink_url}));
                                });
                            }
                        }
                    }
                }
            },

            lockCommand: {
                command: 'lock',
                rank: 'mod',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!freeRunBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        freeRunBot.roomUtilities.booth.lockBooth();
                    }
                }
            },

            lockdownCommand: {
                command: 'lockdown',
                rank: 'mod',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!freeRunBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var temp = freeRunBot.settings.lockdownEnabled;
                        freeRunBot.settings.lockdownEnabled = !temp;
                        if (freeRunBot.settings.lockdownEnabled) {
                            return API.sendChat(subChat(freeRunBot.chat.toggleon, {name: chat.un, 'function': freeRunBot.chat.lockdown}));
                        }
                        else return API.sendChat(subChat(freeRunBot.chat.toggleoff, {name: chat.un, 'function': freeRunBot.chat.lockdown}));
                    }
                }
            },

            lockguardCommand: {
                command: 'lockguard',
                rank: 'bouncer',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!freeRunBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        if (freeRunBot.settings.lockGuard) {
                            freeRunBot.settings.lockGuard = !freeRunBot.settings.lockGuard;
                            return API.sendChat(subChat(freeRunBot.chat.toggleoff, {name: chat.un, 'function': freeRunBot.chat.lockdown}));
                        }
                        else {
                            freeRunBot.settings.lockGuard = !freeRunBot.settings.lockGuard;
                            return API.sendChat(subChat(freeRunBot.chat.toggleon, {name: chat.un, 'function': freeRunBot.chat.lockguard}));
                        }
                    }
                }
            },

            lockskipCommand: {
                command: 'lockskip',
                rank: 'bouncer',
                type: 'startsWith',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!freeRunBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        if (freeRunBot.room.skippable) {
                            var dj = API.getDJ();
                            var id = dj.id;
                            var name = dj.username;
                            var msgSend = '@' + name + ': ';
                            freeRunBot.room.queueable = false;

                            if (chat.message.length === cmd.length) {
                                API.sendChat(subChat(freeRunBot.chat.usedlockskip, {name: chat.un}));
                                freeRunBot.roomUtilities.booth.lockBooth();
                                setTimeout(function (id) {
                                    API.moderateForceSkip();
                                    freeRunBot.room.skippable = false;
                                    setTimeout(function () {
                                        freeRunBot.room.skippable = true
                                    }, 5 * 1000);
                                    setTimeout(function (id) {
                                        freeRunBot.userUtilities.moveUser(id, freeRunBot.settings.lockskipPosition, false);
                                        freeRunBot.room.queueable = true;
                                        setTimeout(function () {
                                            freeRunBot.roomUtilities.booth.unlockBooth();
                                        }, 1000);
                                    }, 1500, id);
                                }, 1000, id);
                                return void (0);
                            }
                            var validReason = false;
                            var msg = chat.message;
                            var reason = msg.substring(cmd.length + 1);
                            for (var i = 0; i < freeRunBot.settings.lockskipReasons.length; i++) {
                                var r = freeRunBot.settings.lockskipReasons[i][0];
                                if (reason.indexOf(r) !== -1) {
                                    validReason = true;
                                    msgSend += freeRunBot.settings.lockskipReasons[i][1];
                                }
                            }
                            if (validReason) {
                                API.sendChat(subChat(freeRunBot.chat.usedlockskip, {name: chat.un}));
                                freeRunBot.roomUtilities.booth.lockBooth();
                                setTimeout(function (id) {
                                    API.moderateForceSkip();
                                    freeRunBot.room.skippable = false;
                                    API.sendChat(msgSend);
                                    setTimeout(function () {
                                        freeRunBot.room.skippable = true
                                    }, 5 * 1000);
                                    setTimeout(function (id) {
                                        freeRunBot.userUtilities.moveUser(id, freeRunBot.settings.lockskipPosition, false);
                                        freeRunBot.room.queueable = true;
                                        setTimeout(function () {
                                            freeRunBot.roomUtilities.booth.unlockBooth();
                                        }, 1000);
                                    }, 1500, id);
                                }, 1000, id);
                                return void (0);
                            }
                        }
                    }
                }
            },

            lockskipposCommand: {
                command: 'lockskippos',
                rank: 'manager',
                type: 'startsWith',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!freeRunBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var msg = chat.message;
                        var pos = msg.substring(cmd.length + 1);
                        if (!isNaN(pos)) {
                            freeRunBot.settings.lockskipPosition = pos;
                            return API.sendChat(subChat(freeRunBot.chat.lockskippos, {name: chat.un, position: freeRunBot.settings.lockskipPosition}));
                        }
                        else return API.sendChat(subChat(freeRunBot.chat.invalidpositionspecified, {name: chat.un}));
                    }
                }
            },

            locktimerCommand: {
                command: 'locktimer',
                rank: 'manager',
                type: 'startsWith',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!freeRunBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var msg = chat.message;
                        var lockTime = msg.substring(cmd.length + 1);
                        if (!isNaN(lockTime) && lockTime !== "") {
                            freeRunBot.settings.maximumLocktime = lockTime;
                            return API.sendChat(subChat(freeRunBot.chat.lockguardtime, {name: chat.un, time: freeRunBot.settings.maximumLocktime}));
                        }
                        else return API.sendChat(subChat(freeRunBot.chat.invalidtime, {name: chat.un}));
                    }
                }
            },

            maxlengthCommand: {
                command: 'maxlength',
                rank: 'manager',
                type: 'startsWith',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!freeRunBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var msg = chat.message;
                        var maxTime = msg.substring(cmd.length + 1);
                        if (!isNaN(maxTime)) {
                            freeRunBot.settings.maximumSongLength = maxTime;
                            return API.sendChat(subChat(freeRunBot.chat.maxlengthtime, {name: chat.un, time: freeRunBot.settings.maximumSongLength}));
                        }
                        else return API.sendChat(subChat(freeRunBot.chat.invalidtime, {name: chat.un}));
                    }
                }
            },

            motdCommand: {
                command: 'motd',
                rank: 'bouncer',
                type: 'startsWith',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!freeRunBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var msg = chat.message;
                        if (msg.length <= cmd.length + 1) return API.sendChat('/me MotD: ' + freeRunBot.settings.motd);
                        var argument = msg.substring(cmd.length + 1);
                        if (!freeRunBot.settings.motdEnabled) freeRunBot.settings.motdEnabled = !freeRunBot.settings.motdEnabled;
                        if (isNaN(argument)) {
                            freeRunBot.settings.motd = argument;
                            API.sendChat(subChat(freeRunBot.chat.motdset, {msg: freeRunBot.settings.motd}));
                        }
                        else {
                            freeRunBot.settings.motdInterval = argument;
                            API.sendChat(subChat(freeRunBot.chat.motdintervalset, {interval: freeRunBot.settings.motdInterval}));
                        }
                    }
                }
            },

            moveCommand: {
                command: 'move',
                rank: 'mod',
                type: 'startsWith',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!freeRunBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var msg = chat.message;
                        if (msg.length === cmd.length) return API.sendChat(subChat(freeRunBot.chat.nouserspecified, {name: chat.un}));
                        var firstSpace = msg.indexOf(' ');
                        var lastSpace = msg.lastIndexOf(' ');
                        var pos;
                        var name;
                        if (isNaN(parseInt(msg.substring(lastSpace + 1)))) {
                            pos = 1;
                            name = msg.substring(cmd.length + 2);
                        }
                        else {
                            pos = parseInt(msg.substring(lastSpace + 1));
                            name = msg.substring(cmd.length + 2, lastSpace);
                        }
                        var user = freeRunBot.userUtilities.lookupUserName(name);
                        if (typeof user === 'boolean') return API.sendChat(subChat(freeRunBot.chat.invaliduserspecified, {name: chat.un}));
                        if (user.id === freeRunBot.loggedInID) return API.sendChat(subChat(freeRunBot.chat.addbotwaitlist, {name: chat.un}));
                        if (!isNaN(pos)) {
                            API.sendChat(subChat(freeRunBot.chat.move, {name: chat.un}));
                            freeRunBot.userUtilities.moveUser(user.id, pos, false);
                        } else return API.sendChat(subChat(freeRunBot.chat.invalidpositionspecified, {name: chat.un}));
                    }
                }
            },

            muteCommand: {
                command: 'mute',
                rank: 'bouncer',
                type: 'startsWith',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!freeRunBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var msg = chat.message;
                        if (msg.length === cmd.length) return API.sendChat(subChat(freeRunBot.chat.nouserspecified, {name: chat.un}));
                        var lastSpace = msg.lastIndexOf(' ');
                        var time = null;
                        var name;
                        if (lastSpace === msg.indexOf(' ')) {
                            name = msg.substring(cmd.length + 2);
                            time = 45;
                        }
                        else {
                            time = msg.substring(lastSpace + 1);
                            if (isNaN(time) || time == "" || time == null || typeof time == "undefined") {
                                return API.sendChat(subChat(freeRunBot.chat.invalidtime, {name: chat.un}));
                            }
                            name = msg.substring(cmd.length + 2, lastSpace);
                        }
                        var from = chat.un;
                        var user = freeRunBot.userUtilities.lookupUserName(name);
                        if (typeof user === 'boolean') return API.sendChat(subChat(freeRunBot.chat.invaliduserspecified, {name: chat.un}));
                        var permFrom = freeRunBot.userUtilities.getPermission(chat.uid);
                        var permUser = freeRunBot.userUtilities.getPermission(user.id);
                        if (permFrom > permUser) {
                            /*
                             freeRunBot.room.mutedUsers.push(user.id);
                             if (time === null) API.sendChat(subChat(freeRunBot.chat.mutednotime, {name: chat.un, username: name}));
                             else {
                             API.sendChat(subChat(freeRunBot.chat.mutedtime, {name: chat.un, username: name, time: time}));
                             setTimeout(function (id) {
                             var muted = freeRunBot.room.mutedUsers;
                             var wasMuted = false;
                             var indexMuted = -1;
                             for (var i = 0; i < muted.length; i++) {
                             if (muted[i] === id) {
                             indexMuted = i;
                             wasMuted = true;
                             }
                             }
                             if (indexMuted > -1) {
                             freeRunBot.room.mutedUsers.splice(indexMuted);
                             var u = freeRunBot.userUtilities.lookupUser(id);
                             var name = u.username;
                             API.sendChat(subChat(freeRunBot.chat.unmuted, {name: chat.un, username: name}));
                             }
                             }, time * 60 * 1000, user.id);
                             }
                             */
                            if (time > 45) {
                                API.sendChat(subChat(freeRunBot.chat.mutedmaxtime, {name: chat.un, time: "45"}));
                                API.moderateMuteUser(user.id, 1, API.MUTE.LONG);
                            }
                            else if (time === 45) {
                                API.moderateMuteUser(user.id, 1, API.MUTE.LONG);
                                API.sendChat(subChat(freeRunBot.chat.mutedtime, {name: chat.un, username: name, time: time}));

                            }
                            else if (time > 30) {
                                API.moderateMuteUser(user.id, 1, API.MUTE.LONG);
                                API.sendChat(subChat(freeRunBot.chat.mutedtime, {name: chat.un, username: name, time: time}));
                                setTimeout(function (id) {
                                    API.moderateUnmuteUser(id);
                                }, time * 60 * 1000, user.id);
                            }
                            else if (time > 15) {
                                API.moderateMuteUser(user.id, 1, API.MUTE.MEDIUM);
                                API.sendChat(subChat(freeRunBot.chat.mutedtime, {name: chat.un, username: name, time: time}));
                                setTimeout(function (id) {
                                    API.moderateUnmuteUser(id);
                                }, time * 60 * 1000, user.id);
                            }
                            else {
                                API.moderateMuteUser(user.id, 1, API.MUTE.SHORT);
                                API.sendChat(subChat(freeRunBot.chat.mutedtime, {name: chat.un, username: name, time: time}));
                                setTimeout(function (id) {
                                    API.moderateUnmuteUser(id);
                                }, time * 60 * 1000, user.id);
                            }
                        }
                        else API.sendChat(subChat(freeRunBot.chat.muterank, {name: chat.un}));
                    }
                }
            },

            opCommand: {
                command: 'op',
                rank: 'user',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!freeRunBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        if (typeof freeRunBot.settings.opLink === "string")
                            return API.sendChat(subChat(freeRunBot.chat.oplist, {link: freeRunBot.settings.opLink}));
                    }
                }
            },

            pingCommand: {
                command: 'ping',
                rank: 'user',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!freeRunBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        API.sendChat(freeRunBot.chat.pong)
                    }
                }
            },

            ping2Command: {
                command: 'pong',
                rank: 'user',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!freeRunBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        API.sendChat(freeRunBot.chat.pong2)
                    }
                }
            },

            refreshCommand: {
                command: 'refresh',
                rank: 'manager',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!freeRunBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        storeToStorage();
                        freeRunBot.disconnectAPI();
                        setTimeout(function () {
                            window.location.reload(false);
                        }, 1000);

                    }
                }
            },

            reloadCommand: {
                command: 'reload',
                rank: 'bouncer',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!freeRunBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        API.sendChat(freeRunBot.chat.reload);
                        storeToStorage();
                        freeRunBot.disconnectAPI();
                        kill();
                        setTimeout(function () {
                            $.getScript(freeRunBot.scriptLink);
                        }, 2000);
                    }
                }
            },

            removeCommand: {
                command: 'remove',
                rank: 'mod',
                type: 'startsWith',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!freeRunBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var msg = chat.message;
                        if (msg.length > cmd.length + 2) {
                            var name = msg.substr(cmd.length + 2);
                            var user = freeRunBot.userUtilities.lookupUserName(name);
                            if (typeof user !== 'boolean') {
                                user.lastDC = {
                                    time: null,
                                    position: null,
                                    songCount: 0
                                };
                                if (API.getDJ().id === user.id) {
                                    API.moderateForceSkip();
                                    setTimeout(function () {
                                        API.moderateRemoveDJ(user.id);
                                    }, 1 * 1000, user);
                                }
                                else API.moderateRemoveDJ(user.id);
                            } else API.sendChat(subChat(freeRunBot.chat.removenotinwl, {name: chat.un, username: name}));
                        } else API.sendChat(subChat(freeRunBot.chat.nouserspecified, {name: chat.un}));
                    }
                }
            },

            restrictetaCommand: {
                command: 'restricteta',
                rank: 'bouncer',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!freeRunBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        if (freeRunBot.settings.etaRestriction) {
                            freeRunBot.settings.etaRestriction = !freeRunBot.settings.etaRestriction;
                            return API.sendChat(subChat(freeRunBot.chat.toggleoff, {name: chat.un, 'function': freeRunBot.chat.etarestriction}));
                        }
                        else {
                            freeRunBot.settings.etaRestriction = !freeRunBot.settings.etaRestriction;
                            return API.sendChat(subChat(freeRunBot.chat.toggleon, {name: chat.un, 'function': freeRunBot.chat.etarestriction}));
                        }
                    }
                }
            },

            rouletteCommand: {
                command: 'roulette',
                rank: 'mod',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!freeRunBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        if (!freeRunBot.room.roulette.rouletteStatus) {
                            freeRunBot.room.roulette.startRoulette();
                        }
                    }
                }
            },

            rulesCommand: {
                command: 'rules',
                rank: 'user',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!freeRunBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        if (typeof freeRunBot.settings.rulesLink === "string")
                            return API.sendChat(subChat(freeRunBot.chat.roomrules, {link: freeRunBot.settings.rulesLink}));
                    }
                }
            },

            sessionstatsCommand: {
                command: 'sessionstats',
                rank: 'bouncer',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!freeRunBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var from = chat.un;
                        var woots = freeRunBot.room.roomstats.totalWoots;
                        var mehs = freeRunBot.room.roomstats.totalMehs;
                        var grabs = freeRunBot.room.roomstats.totalCurates;
                        API.sendChat(subChat(freeRunBot.chat.sessionstats, {name: from, woots: woots, mehs: mehs, grabs: grabs}));
                    }
                }
            },

            skipCommand: {
                command: 'skip',
                rank: 'bouncer',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!freeRunBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        API.sendChat(subChat(freeRunBot.chat.skip, {name: chat.un}));
                        API.moderateForceSkip();
                        freeRunBot.room.skippable = false;
                        setTimeout(function () {
                            freeRunBot.room.skippable = true
                        }, 5 * 1000);

                    }
                }
            },

            songstatsCommand: {
                command: 'songstats',
                rank: 'mod',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!freeRunBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        if (freeRunBot.settings.songstats) {
                            freeRunBot.settings.songstats = !freeRunBot.settings.songstats;
                            return API.sendChat(subChat(freeRunBot.chat.toggleoff, {name: chat.un, 'function': freeRunBot.chat.songstats}));
                        }
                        else {
                            freeRunBot.settings.songstats = !freeRunBot.settings.songstats;
                            return API.sendChat(subChat(freeRunBot.chat.toggleon, {name: chat.un, 'function': freeRunBot.chat.songstats}));
                        }
                    }
                }
            },

            sourceCommand: {
                command: 'source',
                rank: 'user',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!freeRunBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        API.sendChat('/me Tento bot bol vytvorený pre Free-Run komunitu. Vytvoril ' + botCreator + '.');
                    }
                }
            },

            statusCommand: {
                command: 'status',
                rank: 'bouncer',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!freeRunBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var from = chat.un;
                        var msg = '/me [@' + from + '] ';

                        msg += freeRunBot.chat.afkremoval + ': ';
                        if (freeRunBot.settings.afkRemoval) msg += 'ON';
                        else msg += 'OFF';
                        msg += '. ';
                        msg += freeRunBot.chat.afksremoved + ": " + freeRunBot.room.afkList.length + '. ';
                        msg += freeRunBot.chat.afklimit + ': ' + freeRunBot.settings.maximumAfk + '. ';

                        msg += 'Bouncer+: ';
                        if (freeRunBot.settings.bouncerPlus) msg += 'ON';
                        else msg += 'OFF';
                        msg += '. ';
												
                        msg += freeRunBot.chat.blacklist + ': ';
                        if (freeRunBot.settings.blacklistEnabled) msg += 'ON';
                        else msg += 'OFF';
                        msg += '. ';

                        msg += freeRunBot.chat.lockguard + ': ';
                        if (freeRunBot.settings.lockGuard) msg += 'ON';
                        else msg += 'OFF';
                        msg += '. ';

                        msg += freeRunBot.chat.cycleguard + ': ';
                        if (freeRunBot.settings.cycleGuard) msg += 'ON';
                        else msg += 'OFF';
                        msg += '. ';

                        msg += freeRunBot.chat.timeguard + ': ';
                        if (freeRunBot.settings.timeGuard) msg += 'ON';
                        else msg += 'OFF';
                        msg += '. ';

                        msg += freeRunBot.chat.chatfilter + ': ';
                        if (freeRunBot.settings.filterChat) msg += 'ON';
                        else msg += 'OFF';
                        msg += '. ';

                        msg += freeRunBot.chat.historyskip + ': ';
                        if (freeRunBot.settings.historySkip) msg += 'ON';
                        else msg += 'OFF';
                        msg += '. ';

                        msg += freeRunBot.chat.voteskip + ': ';
                        if (freeRunBot.settings.voteskip) msg += 'ON';
                        else msg += 'OFF';
                        msg += '. ';

                        var launchT = freeRunBot.room.roomstats.launchTime;
                        var durationOnline = Date.now() - launchT;
                        var since = freeRunBot.roomUtilities.msToStr(durationOnline);
                        msg += subChat(freeRunBot.chat.activefor, {time: since});

                        return API.sendChat(msg);
                    }
                }
            },

            swapCommand: {
                command: 'swap',
                rank: 'mod',
                type: 'startsWith',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!freeRunBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var msg = chat.message;
                        if (msg.length === cmd.length) return API.sendChat(subChat(freeRunBot.chat.nouserspecified, {name: chat.un}));
                        var firstSpace = msg.indexOf(' ');
                        var lastSpace = msg.lastIndexOf(' ');
                        var name1 = msg.substring(cmd.length + 2, lastSpace);
                        var name2 = msg.substring(lastSpace + 2);
                        var user1 = freeRunBot.userUtilities.lookupUserName(name1);
                        var user2 = freeRunBot.userUtilities.lookupUserName(name2);
                        if (typeof user1 === 'boolean' || typeof user2 === 'boolean') return API.sendChat(subChat(freeRunBot.chat.swapinvalid, {name: chat.un}));
                        if (user1.id === freeRunBot.loggedInID || user2.id === freeRunBot.loggedInID) return API.sendChat(subChat(freeRunBot.chat.addbottowaitlist, {name: chat.un}));
                        var p1 = API.getWaitListPosition(user1.id) + 1;
                        var p2 = API.getWaitListPosition(user2.id) + 1;
                        if (p1 < 0 || p2 < 0) return API.sendChat(subChat(freeRunBot.chat.swapwlonly, {name: chat.un}));
                        API.sendChat(subChat(freeRunBot.chat.swapping, {'name1': name1, 'name2': name2}));
                        if (p1 < p2) {
                            freeRunBot.userUtilities.moveUser(user2.id, p1, false);
                            setTimeout(function (user1, p2) {
                                freeRunBot.userUtilities.moveUser(user1.id, p2, false);
                            }, 2000, user1, p2);
                        }
                        else {
                            freeRunBot.userUtilities.moveUser(user1.id, p2, false);
                            setTimeout(function (user2, p1) {
                                freeRunBot.userUtilities.moveUser(user2.id, p1, false);
                            }, 2000, user2, p1);
                        }
                    }
                }
            },

            themeCommand: {
                command: 'theme',
                rank: 'user',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!freeRunBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        if (typeof freeRunBot.settings.themeLink === "string")
                            API.sendChat(subChat(freeRunBot.chat.genres, {link: freeRunBot.settings.themeLink}));
                    }
                }
            },

            timeguardCommand: {
                command: 'timeguard',
                rank: 'bouncer',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!freeRunBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        if (freeRunBot.settings.timeGuard) {
                            freeRunBot.settings.timeGuard = !freeRunBot.settings.timeGuard;
                            return API.sendChat(subChat(freeRunBot.chat.toggleoff, {name: chat.un, 'function': freeRunBot.chat.timeguard}));
                        }
                        else {
                            freeRunBot.settings.timeGuard = !freeRunBot.settings.timeGuard;
                            return API.sendChat(subChat(freeRunBot.chat.toggleon, {name: chat.un, 'function': freeRunBot.chat.timeguard}));
                        }

                    }
                }
            },

            toggleblCommand: {
                command: 'togglebl',
                rank: 'bouncer',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!freeRunBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var temp = freeRunBot.settings.blacklistEnabled;
                        freeRunBot.settings.blacklistEnabled = !temp;
                        if (freeRunBot.settings.blacklistEnabled) {
                          return API.sendChat(subChat(freeRunBot.chat.toggleon, {name: chat.un, 'function': freeRunBot.chat.blacklist}));
                        }
                        else return API.sendChat(subChat(freeRunBot.chat.toggleoff, {name: chat.un, 'function': freeRunBot.chat.blacklist}));
                    }
                }
            },
						
            togglemotdCommand: {
                command: 'togglemotd',
                rank: 'bouncer',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!freeRunBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        if (freeRunBot.settings.motdEnabled) {
                            freeRunBot.settings.motdEnabled = !freeRunBot.settings.motdEnabled;
                            API.sendChat(subChat(freeRunBot.chat.toggleoff, {name: chat.un, 'function': freeRunBot.chat.motd}));
                        }
                        else {
                            freeRunBot.settings.motdEnabled = !freeRunBot.settings.motdEnabled;
                            API.sendChat(subChat(freeRunBot.chat.toggleon, {name: chat.un, 'function': freeRunBot.chat.motd}));
                        }
                    }
                }
            },

            unbanCommand: {
                command: 'unban',
                rank: 'bouncer',
                type: 'startsWith',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!freeRunBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        $(".icon-population").click();
                        $(".icon-ban").click();
                        setTimeout(function (chat) {
                            var msg = chat.message;
                            if (msg.length === cmd.length) return API.sendChat();
                            var name = msg.substring(cmd.length + 2);
                            var bannedUsers = API.getBannedUsers();
                            var found = false;
                            var bannedUser = null;
                            for (var i = 0; i < bannedUsers.length; i++) {
                                var user = bannedUsers[i];
                                if (user.username === name) {
                                    bannedUser = user;
                                    found = true;
                                }
                            }
                            if (!found) {
                                $(".icon-chat").click();
                                return API.sendChat(subChat(freeRunBot.chat.notbanned, {name: chat.un}));
                            }
                            API.moderateUnbanUser(bannedUser.id);
                            console.log("Unbanned " + name);
                            setTimeout(function () {
                                $(".icon-chat").click();
                            }, 1000);
                        }, 1000, chat);
                    }
                }
            },

            unlockCommand: {
                command: 'unlock',
                rank: 'mod',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!freeRunBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        freeRunBot.roomUtilities.booth.unlockBooth();
                    }
                }
            },

            unmuteCommand: {
                command: 'unmute',
                rank: 'bouncer',
                type: 'startsWith',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!freeRunBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var msg = chat.message;
                        var permFrom = freeRunBot.userUtilities.getPermission(chat.uid);
                        /**
                         if (msg.indexOf('@') === -1 && msg.indexOf('all') !== -1) {
                            if (permFrom > 2) {
                                freeRunBot.room.mutedUsers = [];
                                return API.sendChat(subChat(freeRunBot.chat.unmutedeveryone, {name: chat.un}));
                            }
                            else return API.sendChat(subChat(freeRunBot.chat.unmuteeveryonerank, {name: chat.un}));
                        }
                         **/
                        var from = chat.un;
                        var name = msg.substr(cmd.length + 2);

                        var user = freeRunBot.userUtilities.lookupUserName(name);

                        if (typeof user === 'boolean') return API.sendChat(subChat(freeRunBot.chat.invaliduserspecified, {name: chat.un}));

                        var permUser = freeRunBot.userUtilities.getPermission(user.id);
                        if (permFrom > permUser) {
                            /*
                             var muted = freeRunBot.room.mutedUsers;
                             var wasMuted = false;
                             var indexMuted = -1;
                             for (var i = 0; i < muted.length; i++) {
                             if (muted[i] === user.id) {
                             indexMuted = i;
                             wasMuted = true;
                             }
                             }
                             if (!wasMuted) return API.sendChat(subChat(freeRunBot.chat.notmuted, {name: chat.un}));
                             freeRunBot.room.mutedUsers.splice(indexMuted);
                             API.sendChat(subChat(freeRunBot.chat.unmuted, {name: chat.un, username: name}));
                             */
                            try {
                                API.moderateUnmuteUser(user.id);
                                API.sendChat(subChat(freeRunBot.chat.unmuted, {name: chat.un, username: name}));
                            }
                            catch (e) {
                                API.sendChat(subChat(freeRunBot.chat.notmuted, {name: chat.un}));
                            }
                        }
                        else API.sendChat(subChat(freeRunBot.chat.unmuterank, {name: chat.un}));
                    }
                }
            },

            usercmdcdCommand: {
                command: 'usercmdcd',
                rank: 'manager',
                type: 'startsWith',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!freeRunBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var msg = chat.message;
                        var cd = msg.substring(cmd.length + 1);
                        if (!isNaN(cd)) {
                            freeRunBot.settings.commandCooldown = cd;
                            return API.sendChat(subChat(freeRunBot.chat.commandscd, {name: chat.un, time: freeRunBot.settings.commandCooldown}));
                        }
                        else return API.sendChat(subChat(freeRunBot.chat.invalidtime, {name: chat.un}));
                    }
                }
            },

            usercommandsCommand: {
                command: 'usercommands',
                rank: 'manager',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!freeRunBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        if (freeRunBot.settings.usercommandsEnabled) {
                            API.sendChat(subChat(freeRunBot.chat.toggleoff, {name: chat.un, 'function': freeRunBot.chat.usercommands}));
                            freeRunBot.settings.usercommandsEnabled = !freeRunBot.settings.usercommandsEnabled;
                        }
                        else {
                            API.sendChat(subChat(freeRunBot.chat.toggleon, {name: chat.un, 'function': freeRunBot.chat.usercommands}));
                            freeRunBot.settings.usercommandsEnabled = !freeRunBot.settings.usercommandsEnabled;
                        }
                    }
                }
            },

            voteratioCommand: {
                command: 'voteratio',
                rank: 'bouncer',
                type: 'startsWith',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!freeRunBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var msg = chat.message;
                        if (msg.length === cmd.length) return API.sendChat(subChat(freeRunBot.chat.nouserspecified, {name: chat.un}));
                        var name = msg.substring(cmd.length + 2);
                        var user = freeRunBot.userUtilities.lookupUserName(name);
                        if (user === false) return API.sendChat(subChat(freeRunBot.chat.invaliduserspecified, {name: chat.un}));
                        var vratio = user.votes;
                        var ratio = vratio.woot / vratio.meh;
                        API.sendChat(subChat(freeRunBot.chat.voteratio, {name: chat.un, username: name, woot: vratio.woot, mehs: vratio.meh, ratio: ratio.toFixed(2)}));
                    }
                }
            },

            welcomeCommand: {
                command: 'welcome',
                rank: 'mod',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!freeRunBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        if (freeRunBot.settings.welcome) {
                            freeRunBot.settings.welcome = !freeRunBot.settings.welcome;
                            return API.sendChat(subChat(freeRunBot.chat.toggleoff, {name: chat.un, 'function': freeRunBot.chat.welcomemsg}));
                        }
                        else {
                            freeRunBot.settings.welcome = !freeRunBot.settings.welcome;
                            return API.sendChat(subChat(freeRunBot.chat.toggleon, {name: chat.un, 'function': freeRunBot.chat.welcomemsg}));
                        }
                    }
                }
            },

            websiteCommand: {
                command: 'sidhvboehvoehbe',
                rank: 'user',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!freeRunBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        if (typeof freeRunBot.settings.website === "string")
                            API.sendChat(subChat(freeRunBot.chat.website, {link: freeRunBot.settings.website}));
                    }
                }
            },

            youtubeCommand: {
                command: 'aôhfôovaôhboôsb',
                rank: 'user',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!freeRunBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        if (typeof freeRunBot.settings.youtubeLink === "string")
                            API.sendChat(subChat(freeRunBot.chat.youtube, {name: chat.un, link: freeRunBot.settings.youtubeLink}));
                    }
                }
            }
        }
    };

    loadChat(freeRunBot.startup);
}).call(this);
