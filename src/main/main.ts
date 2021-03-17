import { app, BrowserWindow, ipcMain, dialog, shell, nativeTheme } from "electron";
import { IpcMainEvent } from "electron/main";
import * as path from "path";
import { MyBookmarks } from "./bookmarks";
import { SSHSession } from "../shared/session";
import * as Store from 'electron-store';

try {
	require('electron-reloader')(module);
} catch {
	console.warn("Production, not loading dev modules")
}

const isMac = process.platform === 'darwin'

nativeTheme.themeSource = 'dark'

//node-pty is not context aware
app.allowRendererProcessReuse = false

console.log("Electron app path:", app.getAppPath());

let mainWindow: BrowserWindow = undefined

//Init
const store = new Store();
console.log("electron-store path: ", store.path)

//give permission for renderer process to use electron-store
Store.initRenderer();

let uiPopulateCallback = (sshSession: SSHSession) => {
	console.log("Populate callback called")
	mainWindow.webContents.send("Renderer_BookmarksUI_AddBookmark", sshSession);
};

let uiDeleteCallback = (bookmarkId: string) => {
	console.log("Delete callback called")
	mainWindow.webContents.send("Renderer_BookmarksUI_RemoveBookmark", bookmarkId);
};
MyBookmarks.createInstance(uiPopulateCallback, uiDeleteCallback);

function createMainWindow() {
	// Create the browser window.
	mainWindow = new BrowserWindow({
		width: 1600,
		height: 800,
		webPreferences: {
			nodeIntegration: true,
			enableRemoteModule: true,
			contextIsolation: false,
			webviewTag: true
		},
		show: false
	});

	// and load the index.html of the app.
	mainWindow.loadFile(path.join(__dirname, "../../html/index.html"));

	// Open the DevTools.
	mainWindow.webContents.openDevTools();

	const sessions: Array<SSHSession> = MyBookmarks.getInstance().getSessions();

	mainWindow.webContents.on("dom-ready", () => {
		for(let s of sessions) {
			mainWindow.webContents.send("Renderer_BookmarksUI_AddBookmark", s)
		}
	});

	mainWindow.once('ready-to-show', () => {
		mainWindow.show()
	});



	//on resize
	mainWindow.on('resize', function () {
		var size = mainWindow.getSize();
		mainWindow.webContents.send("WindowResize", size)
	});

	mainWindow.on("maximize", (ev: any) => {
		var size = mainWindow.getSize();
		mainWindow.webContents.send("WindowResize", size)
	});

	mainWindow.on("unmaximize", (ev: any) => {
		var size = mainWindow.getSize();
		mainWindow.webContents.send("WindowResize", size)

	});

	/*
	mainWindow.on("restore", (ev: any) => {
		console.log("Window restore:", ev)
		var size = mainWindow.getSize();
		console.log("Window size:", size)
	})

	mainWindow.on("minimize", (ev: any) => {
		console.log("Window minimize:", ev)
		var size = mainWindow.getSize();
		console.log("Window size:", size)
	})
	*/


}

function createTestWindow() {
	let testWindow = new BrowserWindow({
		width: 1600,
		height: 800,
		webPreferences: {
			nodeIntegration: true,
			enableRemoteModule: true,
			contextIsolation: false,
			webviewTag: true
		},
		show: true
	});
	testWindow.loadFile(path.join(__dirname, "../../html/test.html"));

	testWindow.webContents.openDevTools();
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on("ready", () => {
	createMainWindow();

	//For testing purposes
	//createTestWindow()

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
	if (! isMac) {
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
		show: false,
		autoHideMenuBar: true,
		parent: mainWindow,
		modal: true,
		webPreferences: {
			nodeIntegration: true,
			enableRemoteModule: true
		}
	});

	loginWindow.loadFile(path.join(__dirname, "../../html/login_window.html"));

	loginWindow.webContents.once("did-finish-load", () => {
		let ask_for_username = true
		if(session.username != null && session.username.length > 0) {
			ask_for_username = false
		}

		let ask_for_passphrase = false
		if(session.private_key) {
			ask_for_passphrase = true
		}
		loginWindow.webContents.send("get-args", ask_for_username, ask_for_passphrase);
	});

	loginWindow.once("ready-to-show", () => {
		loginWindow.show();
	});

	var LoginWindowHandler = (event: IpcMainEvent, username: string, password: string) => {
		//We have session and password. Start SSH.
		console.log("Handling result of login window")
		mainWindow.webContents.send("StartSSH", session, username, password)
	};

	//TODO: Listiner for new event. The SSH manager will emit this event every time we try to log in.
	//If the event it sends is "OK" then don't show error message. Else, show error message.
	


	ipcMain.once("LoginWindowResult", LoginWindowHandler);

	loginWindow.once("closed", () => {
		console.log("Login window closed")
		//When window finishes, don't listen to result listiner anymore
		ipcMain.removeAllListeners("LoginWindowResult");
	});

});

ipcMain.on("OpenNewSessionWindow", () => {
	console.log("Opening new session window")

	const newSessionWindow = new BrowserWindow({
		width: 800,
		height: 800,
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

	newSessionWindow.loadFile(path.join(__dirname, "../../html/new_session.html"));

	newSessionWindow.on("close", (ev: any) => {
		console.log("New session window closed");
	});

	ipcMain.once("NewBookmark", (ev, json: SSHSession) => {
		console.log("Main - NewBookmark called")
		MyBookmarks.getInstance().newBookmark(json)
	})
});

ipcMain.on("OpenBookmarkSettings", (ev, sessionUUID: string) => {
	console.log("Main - OpenBookmarkSettings")

	let sshSession: SSHSession = MyBookmarks.getInstance().getBookmarkById(sessionUUID);

	const bookmarkSettings = new BrowserWindow({
		width: 800,
		height: 800,
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

	bookmarkSettings.loadFile(path.join(__dirname, "../../html/bookmark_settings.html"));

	bookmarkSettings.webContents.once("did-finish-load", () => {
		bookmarkSettings.webContents.send("get-args", sessionUUID, sshSession);
	});

	bookmarkSettings.once("ready-to-show", () => {
		bookmarkSettings.show();
	});

	function refreshBookmarks() {
		//Clear UI
		mainWindow.webContents.send("Renderer_BookmarksUI_ClearBookmarks");

		//Repopulate UI
		const sessions: Array<SSHSession> = MyBookmarks.getInstance().getSessions();
		for(let s of sessions) {
			mainWindow.webContents.send("Renderer_BookmarksUI_AddBookmark", s)
		}
	}



	/**
	 * json - SSHSession with uuid set to null. Called from bookmarks settings renderer
	 */
	ipcMain.once("Renderer_BookmarksUI_UpdateBookmark", (ev, json: SSHSession) => {
		console.log("Main - Renderer_BookmarksUI_UpdateBookmark");
		MyBookmarks.getInstance().updateBookmark(sshSession.uuid, json);
		//refreshBookmarks(); //This will refresh entire ui, no need

		//Add run time attribute
		json.uuid = sshSession.uuid;
		console.log("New json:", json, " Old session:", sshSession);
		mainWindow.webContents.send("Renderer_BookmarksUI_UpdateBookmark", json);
	});

});

ipcMain.on("DeleteBookmark", (ev, bookmarkId: string) => {
	console.log("Main - DeleteBookmark")
	MyBookmarks.getInstance().deleteBookmark(bookmarkId);
	//No need to refresh bookmarks. uiDeleteBookmark callback is called instead
});

ipcMain.on("ShowMessage", (ev: any, message: string, title: string, type: string = "info", detail: string = "") => {
	dialog.showMessageBox(mainWindow, {
		"message": message,
		"title": title,
		"type": type,
		"detail": detail
	});
});

ipcMain.on("ShowError", (ev: any, message: string, title: string) => {
	dialog.showErrorBox(title, message);
});

ipcMain.on("OpenContainingFolder", (ev, filepath: string) => {
	console.log("Main - OpenContainingFolder")
	shell.showItemInFolder(filepath)
})