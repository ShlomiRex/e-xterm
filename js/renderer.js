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
const { removeListener, removeAllListeners } = require('process');

const CHANNEL = "Renderer";



var session = ipcRenderer.sendSync(CHANNEL, "GetSessionToOpoen");
//const remote_host = session["remote_host"];
//console.log("Remote host: " + remote_host)

console.log("Got instructions from main process");

// Initialize node-pty with an appropriate shell
const WINDOWS = os.platform() === 'win32';
const shell = process.env[WINDOWS ? 'COMSPEC' : 'SHELL'];

const ptyProcess = pty.spawn(shell, [], {
	name: 'xterm-color',
	cols: 80,
	rows: 30,
	cwd: process.cwd(),
	env: process.env
});

const PROTOCOL = session["protocol"];
const REMOTE_HOST = session["remote_host"];
const USERNAME = session["username_checkbox"] == "true" ? session["username"] : null;

if (PROTOCOL == "SSH") {
	if (USERNAME) {
		ptyProcess.write("ssh " + USERNAME + "@" + REMOTE_HOST + "\n\r");
	} else {
		ptyProcess.write("ssh " + REMOTE_HOST + "\n\r");
	}
}

// Never use this to automate ssh logins!
/*
const IDisposable = ptyProcess.onData((data) => {
	if (data) {
		console.log(data);
		if (data.endsWith("password: ")) {
			console.log("Writing password")
			ptyProcess.write("<your password goes here>\n\r");
			IDisposable.dispose();
		}
	}
});
*/

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