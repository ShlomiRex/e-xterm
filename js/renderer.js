console.log("renderer js script is executing")
var os = require('os');
var pty = require('node-pty');
var Terminal = require('xterm').Terminal;

// Initialize node-pty with an appropriate shell
const shell = process.env[os.platform() === 'win32' ? 'COMSPEC' : 'SHELL'];



const ptyProcess = pty.spawn("ping", ["1.1.1.1"], {
	name: 'xterm-color',
	cols: 80,
	rows: 30,
	cwd: process.cwd(),
	env: process.env
});

// Initialize xterm.js and attach it to the DOM
const xterm = new Terminal();
if (document.getElementById('xterm')) {
	console.log("Found xterm")
	xterm.open(document.getElementById('xterm'));

	// Setup communication between xterm.js and node-pty
	xterm.onData(data => ptyProcess.write(data));
	ptyProcess.on('data', function (data) {
		xterm.write(data);
	});

} else {
	console.log("DID NOT Found xterm")
}