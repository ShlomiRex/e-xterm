
const electron = require('electron');
const app = electron.app;

app.on('ready', function () {
	const mainWindow = new electron.BrowserWindow({
		webPreferences: {
			nodeIntegration: true,
			webviewTag: true
		}
	});
	mainWindow.loadURL('file://' + __dirname + '/index.html');
	mainWindow.on('ready-to-show', function () {
		mainWindow.show();
		mainWindow.focus();
	});
	/*
	//This works
	var os = require('os');
	var pty = require('node-pty');
	
	var shell = os.platform() === 'win32' ? 'powershell.exe' : 'bash';
	
	var ptyProcess = pty.spawn(shell, [], {
		name: 'xterm-color',
		cols: 80,
		rows: 30,
		cwd: process.env.HOME,
		env: process.env
	});
	
	ptyProcess.on('data', function (data) {
		process.stdout.write(data);
	});
	
	ptyProcess.write('ls\r');
	ptyProcess.resize(100, 40);
	ptyProcess.write('ls\r');
	
	console.log("Pty process:" , ptyProcess)
	*/


	/*
	var term_module = require("./js/terminal");
	console.log("term", term_module.term)
	*/
});
