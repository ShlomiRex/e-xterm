/*
This script is called every time a new terminal tab is opened.
This handles the terminal process.
*/

console.log("renderer js script is executing")



const { ipcRenderer } = require('electron');
const { FitAddon } = require('xterm-addon-fit');
const os = require('os');
const pty = require('node-pty');

const Terminal = require('xterm').Terminal;
const fitAddon = new FitAddon();



const CHANNEL = "Renderer";



var session = ipcRenderer.sendSync(CHANNEL, "GetSessionToOpen");
//const remote_host = session["remote_host"];
//console.log("Remote host: " + remote_host)

var session = ipcRenderer.sendSync(CHANNEL, "GetSessionToOpen");
//const remote_host = session["remote_host"];
//console.log("Remote host: " + remote_host)

console.log("Got instructions from main process");

// Initialize node-pty with an appropriate shell
const WINDOWS = os.platform() === 'win32';
const shell = process.env[WINDOWS ? 'COMSPEC' : 'SHELL'];

const ptyProcess = pty.spawn(shell, [], {
	name: 'xterm-color',
	cols: 100,
	rows: 50,
	cwd: process.cwd(),
	env: process.env
});

if(session) {
	console.log("Loading session: ")
	console.dir(session)
} else {
	console.log("Loading default terminal")
}


if (session) {

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
}


console.log("Loading session: ")
console.dir(session)

if (session) {

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

xterm.loadAddon(fitAddon);
const containerElement = document.getElementById("terminal-container")
xterm.open(containerElement);
fitAddon.fit();

// Setup communication between xterm.js and node-pty
xterm.onData(data => ptyProcess.write(data));
ptyProcess.onData((data) => {
	xterm.write(data);
});

console.log("renderer js script is done")
