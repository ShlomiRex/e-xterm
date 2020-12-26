const { app, BrowserWindow, ipcMain } = require("electron");
const pty = require("node-pty");
const os = require("os");
var shell = os.platform() === "win32" ? "powershell.exe" : "bash";

const path = require('path') 
const is_dev = process.env.NODE_ENV || 'development'; 
  
// If development environment 
if (is_dev === 'development') { 
	require('electron-reload')(__dirname, { 
        electron: path.join(__dirname, 'node_modules', '.bin', 'electron'), 
        hardResetMethod: 'exit'
    }); 
}

let mainWindow;
function createWindow() {
	mainWindow = new BrowserWindow({
		height: 800,
		width: 1200,
		webPreferences: {
			nodeIntegration: true
		}
	});
	mainWindow.loadURL(`file://${__dirname}/index.html`);
	mainWindow.on("closed", function () {
		mainWindow = null;
	});
	mainWindow.on('resize', function(event) {
		console.log(mainWindow.siz);
	});

	var ptyProcess = pty.spawn(shell, [], {
		name: "xterm-color",
		cols: 80,
		rows: 30,
		cwd: process.env.HOME,
		env: process.env
	});

	ptyProcess.onData(function(data) {
		mainWindow.webContents.send("terminal.incomingData", data);
		console.log("Data sent");
		console.log(data);
	});

	ipcMain.on("terminal.keystroke", (event, key) => {
		ptyProcess.write(key);
	});




}

app.on("ready", createWindow);

app.on("window-all-closed", function () {
	if (process.platform !== "darwin") {
		app.quit();
	}
});

app.on("activate", function () {
	if (mainWindow === null) {
		createWindow();
	}
});

