function ascii_to_hexa(str) {
	var arr1 = [];
	for (var n = 0, l = str.length; n < l; n++) {
		var hex = Number(str.charCodeAt(n)).toString(16);
		arr1.push(hex);
	}
	return arr1.join('');
}

var term = new Terminal();
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



/*
term.on('paste', function (data, ev) {
  term.write(data);
});
*/

/*
term.write('$ ')

term.onData(e => {
	term.write(e)
	console.log(ascii_to_hexa(e))
});

term.on("key", function(key) {
	console.log(key)
})

term.write("\nTest")
*/