//vytvorené na bot účely :D

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
