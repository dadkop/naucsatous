//vytvorené na bot účely :D
var emojibuttonon = $(".icon-emoji-on");
if (emojibuttonon.length > 0) {
	emojibuttonon[0].click();
}
API.setVolume(0);

API.on(API.CHAT, chat);
API.on(API.ADVANCE, advance);

function advance(obj) {
	$('#woot').click();
}

function chat(data) {
	var msg = data.message;
	var from = data.un;

	if(from === "-Vitaly") {
		if(msg === "!meh") {
			$('#meh').click();
		}
		if(msg === "!woot") {
			$('#woot').click();
		}
	}

	if(from === "Polkov") {
		if(msg === "!meh") {
			$('#meh').click();
		}
		if(msg === "!woot") {
			$('#woot').click();
		}
	}

	if(from === "♚ ҚRUㄕQUՏ ♚") {
		if(msg === "!meh") {
			$('#meh').click();
		}
		if(msg === "!woot") {
			$('#woot').click();
		}
	}
}
