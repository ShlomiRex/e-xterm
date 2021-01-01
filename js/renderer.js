/*
This script is called every time a new terminal tab is opened.
This handles the terminal process.
*/

console.log("renderer js script is executing")
const { ipcRenderer } = require('electron');

var os = require('os');
var pty = require('node-pty');
var Terminal = require('xterm').Terminal;


var Terminal = require('xterm').Terminal;

const CHANNEL = "Renderer";



var session = ipcRenderer.sendSync("test", "test");

console.log("Got instructions from main process");

// Initialize node-pty with an appropriate shell
const shell = process.env[os.platform() === 'win32' ? 'COMSPEC' : 'SHELL'];

const ptyProcess = pty.spawn(shell, ["1.1.1.1"], {
	name: 'xterm-color',
	cols: 80,
	rows: 30,
	cwd: process.cwd(),
	env: process.env
});

console.log("A")

// Initialize xterm.js and attach it to the DOM
const xterm = new Terminal();
if (document.getElementById('xterm')) {
	console.log("Found xterm")
	xterm.open(document.getElementById('xterm'));

	// Setup communication between xterm.js and node-pty
	xterm.onData(data => ptyProcess.write(data));
	ptyProcess.onData((data) => {
		xterm.write(data);
	});

} else {
	console.log("DID NOT Found xterm")
}

console.log("renderer js script is done")