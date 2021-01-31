import { app, BrowserWindow, ipcMain, dialog } from "electron";
import * as path from "path";
import { SSHSession } from "./session";

import { Tab, Tabs } from './tabs'

//node-pty is not context aware
app.allowRendererProcessReuse = false
const Store = require('electron-store');

try {
	require('electron-reloader')(module);
} catch {
	console.warn("Production, not loading dev modules")
}


//give permission for renderer process to use electron-store
Store.initRenderer();

let mainWindow: BrowserWindow = undefined

function createWindow() {
	// Create the browser window.
	mainWindow = new BrowserWindow({
		width: 1600,
		height: 800,
		webPreferences: {
			preload: path.join(__dirname, "preload.js"),
			nodeIntegration: false, // is default value after Electron v5
			contextIsolation: true, // protect against prototype pollution
			enableRemoteModule: false, // turn off remote
		},
		show: false
	});

	// and load the index.html of the app.
	mainWindow.loadFile(path.join(__dirname, "../html/index.html"));

	// Open the DevTools.
	//mainWindow.webContents.openDevTools();

	
	mainWindow.once('ready-to-show', () => {
		mainWindow.show()
	});



	//on resize
	mainWindow.on('resize', function () {
		var size = mainWindow.getSize();
		var width = size[0];
		var height = size[1];

		mainWindow.webContents.send("WindowResize", size)
	});
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on("ready", () => {
	createWindow();

	app.on("activate", function () {
		// On macOS it's common to re-create a window in the app when the
		// dock icon is clicked and there are no other windows open.
		if (BrowserWindow.getAllWindows().length === 0) createWindow();
	});
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
	if (process.platform !== "darwin") {
		app.quit();
	}
});

// In this file you can include the rest of your app"s specific main process
// code. You can also put them in separate files and require them here.


var isRenderer = require('is-electron-renderer')
console.log("main - isRenderer? : ", isRenderer)


ipcMain.on("OpenLoginWindow", (event, session: SSHSession) => {
	console.log("Main - got OpenLoginWindow")
	const loginWindow = new BrowserWindow({
		width: 300,
		height: 200,
		show: true,
		autoHideMenuBar: true,
		parent: mainWindow,
		modal: true,
		webPreferences: {
			nodeIntegration: true,
			enableRemoteModule: true
		}
	});

	loginWindow.loadFile(path.join(__dirname, "../html/password_login.html"));

	ipcMain.once("LoginWindowPassword", (event, password: string) => {
		//We have session and password. Start SSH.

		//TODO: Remove this
		session.remote_host = "127.0.0.1"
		session.username = "test"
		session.port = 22
		password = "test"


		mainWindow.webContents.send("StartSSH", session, password)

		//TODO: Don't use this line
		//let tab: Tab = Tabs.getInstance().addSSHTerminal(session, password)
		//mainWindow.webContents.send("Password", password)
	});
	
});

ipcMain.on("OpenNewSession", (ev, args) => {
	console.log("Opening new session window")

	const newSessionWindow = new BrowserWindow({
		width: 800,
		height: 600,
		show: true,
		autoHideMenuBar: true,
		parent: mainWindow,
		modal: true,
		webPreferences: {
			nodeIntegration: true,
			enableRemoteModule: true,
			contextIsolation: false,
			preload: path.join(__dirname, "./NewSession/preload.js"),
		}
	});

	newSessionWindow.loadFile(path.join(__dirname, "../html/new_session.html"));
});
