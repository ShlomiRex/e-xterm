import { app, BrowserWindow, ipcMain, dialog, session } from "electron";
import * as path from "path";
import { MyBookmarks } from "./bookmarks";
import { SSHSession } from "./session";
try {
	require('electron-reloader')(module);
} catch {
	console.warn("Production, not loading dev modules")
}


//node-pty is not context aware
app.allowRendererProcessReuse = false

const Store = require('electron-store');
var isRenderer = require('is-electron-renderer')

let mainWindow: BrowserWindow = undefined

//Init

//give permission for renderer process to use electron-store
Store.initRenderer();
console.log("main - isRenderer? : ", isRenderer)

let uiPopulateCallback = (sshSession: SSHSession) => {
	console.log("Populate callback called")
};

let uiDeleteCallback = (bookmarkId: number) => {
	console.log("Delete callback called")

	//TODO: Call renderer and tell him to remove the bookmark	
};
MyBookmarks.createInstance(uiPopulateCallback, uiDeleteCallback);

function createMainWindow() {
	// Create the browser window.
	mainWindow = new BrowserWindow({
		width: 1600,
		height: 800,
		webPreferences: {
			preload: path.join(__dirname, "preload.js"),
			nodeIntegration: true
		},
		show: false
	});

	// and load the index.html of the app.
	mainWindow.loadFile(path.join(__dirname, "../html/index.html"));

	// Open the DevTools.
	//mainWindow.webContents.openDevTools();

	const sessions: Array<SSHSession> = MyBookmarks.getInstance().getSessions();

	mainWindow.webContents.once("dom-ready", () => {
		for(let s of sessions) {
			mainWindow.webContents.send("PopulateBookmark", s)
		}
	});

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
	createMainWindow();

	app.on("activate", function () {
		// On macOS it's common to re-create a window in the app when the
		// dock icon is clicked and there are no other windows open.
		if (BrowserWindow.getAllWindows().length === 0) createMainWindow();
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




ipcMain.on("OpenLoginWindow", (ev, sessionUUID: string) => {
	console.log("Main - got OpenLoginWindow with sessionId:", sessionUUID)
	let session: SSHSession = MyBookmarks.getInstance().getBookmarkById(sessionUUID);

	console.log("Opening session:", session)

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
		console.log("Login window returned password. Password length:", password.length)
		mainWindow.webContents.send("StartSSH", session, password)
	});

});

ipcMain.on("OpenNewSessionWindow", () => {
	console.log("Opening new session window")

	const newSessionWindow = new BrowserWindow({
		width: 800,
		height: 700,
		show: true,
		autoHideMenuBar: true,
		parent: mainWindow,
		modal: true,
		webPreferences: {
			nodeIntegration: true,
			enableRemoteModule: true,
			contextIsolation: false
		}
	});

	newSessionWindow.loadFile(path.join(__dirname, "../html/new_session.html"));

	newSessionWindow.on("close", (ev: any) => {
		console.log("New session window closed");
	});

	ipcMain.once("NewBookmark", (ev, json: SSHSession) => {
		console.log("Main - NewBookmark called")
		MyBookmarks.getInstance().newBookmark(json)
	})
});

ipcMain.on("OpenBookmarkSettings", (ev, sessionUUID: string) => {
	console.log("Opening bookmark " + sessionUUID + " settings...")

	let sshSession: SSHSession = MyBookmarks.getInstance().getBookmarkById(sessionUUID);

	const bookmarkSettings = new BrowserWindow({
		width: 800,
		height: 700,
		show: false,
		autoHideMenuBar: true,
		parent: mainWindow,
		modal: true,
		webPreferences: {
			nodeIntegration: true,
			enableRemoteModule: true,
			contextIsolation: false
		}
	});

	bookmarkSettings.loadFile(path.join(__dirname, "../html/bookmark_settings.html"));

	bookmarkSettings.webContents.once("did-finish-load", () => {
		bookmarkSettings.webContents.send("get-args", sessionUUID, sshSession);
	});

	bookmarkSettings.once("ready-to-show", () => {
		bookmarkSettings.show();
	});

	ipcMain.once("DeleteBookmark", (ev, bookmarkId: number) => {
		console.log("Main - DeleteBookmark called with bookmark id: ", bookmarkId)
		MyBookmarks.getInstance().deleteBookmark(bookmarkId);
	});

});
