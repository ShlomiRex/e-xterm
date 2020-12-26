

const term = new Terminal();
//exports.term = term;
term.open(document.getElementById('terminal'));

var shellprompt = '$ ';

term.prompt = function () {
	term.write('\r\n' + shellprompt);
};

term.prompt();
term.setOption('cursorBlink', true);
term.setOption('rightClickSelectsWord', true);

var cmd = ''; //Buffer for current command



term.onKey(function (obj) {
	const keyCode = obj.domEvent.keyCode;
	const key = obj.key;
	if (keyCode == 13) {
		if (cmd === 'clear') {
			term.clear();
		}
		cmd = '';
		term.prompt();
	} else if (keyCode == 8) {
		// Do not delete the prompt
		if (cmd.length > 0) {
			cmd = cmd.slice(0, -1);
			term.write('\b \b');
			console.log(cmd)
		}
	} else {
		cmd += key;
		term.write(key);
	}

});

