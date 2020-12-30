const {
	app,
	BrowserWindow,
	ipcMain,
	nativeTheme
} = require("electron");


const path = require('path');
const url = require('url');
const fs = require('fs');
const uuidv4 = require('uuid/v4');

//Sessions are saved locally and loaded to bookmarks
const sessionFolder = path.join(app.getAppPath(), "storage", "sessions")

//For now force light theme
nativeTheme.themeSource = 'light';

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;

// node-pty is not yet context aware (this must be false or else i dont see terminal)
app.allowRendererProcessReuse = false;

function createWindow() {
	mainWindow = new BrowserWindow({
		width: 1600,
		height: 800,
		show: false,
		webPreferences: {
			nodeIntegration: false,
			contextIsolation: true,
			webviewTag: true,
			preload: path.join(__dirname, './preload.js')
		}
	})

	mainWindow.loadURL(url.format({
		pathname: path.join(__dirname, '../html/index.html'),
		protocol: 'file',
		slashes: true
	}))

	// Open the DevTools.
	mainWindow.webContents.openDevTools()

	// Emitted when the window is closed.
	mainWindow.on('closed', function () {
		// Dereference the window object, usually you would store windows
		// in an array if your app supports multi windows, this is the time
		// when you should delete the corresponding element.
		mainWindow = null
	})

	mainWindow.once('ready-to-show', () => {
		mainWindow.show();
	});

	mainWindow.webContents.on('did-finish-load', () => {
		console.log("Reading session directory: " + sessionFolder)
		var sessions = [];

		var files = fs.readdirSync(sessionFolder, null);
		files.forEach(filename => {
			var filePath = path.join(sessionFolder, filename)
			var contents = fs.readFileSync(filePath, "utf-8");
			var json = JSON.parse(contents)
			json["session_id"] = filename; //This is ID while the program is running (ram) instead of disk (saving id on disk).
			sessions.push(json);
		});
		mainWindow.webContents.send("LoadSessions", sessions);
	})
}

//Create nessesery folders (persistance storage) before opening the program.
if (!fs.existsSync(sessionFolder)) {
	fs.mkdirSync(sessionFolder, { recursive: true });
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow)

// Quit when all windows are closed.
app.on('window-all-closed', function () {
	// On OS X it is common for applications and their menu bar
	// to stay active until the user quits explicitly with Cmd + Q
	if (process.platform !== 'darwin') {
		app.quit()
	}
})

app.on('activate', function () {
	// On OS X it's common to re-create a window in the app when the
	// dock icon is clicked and there are no other windows open.
	if (mainWindow === null) {
		createWindow()
	}
})




ipcMain.on('SaveSession', (event, json) => {
	var contents = JSON.stringify(json);

	var filename = uuidv4() + '.json';
	var filePath = path.join(app.getAppPath(), "storage", "sessions", filename);
	fs.writeFile(filePath, contents, (err) => {
		console.error(err)
	});
	console.log("Session saved to: " + filePath)
});

//Called from index.js - tell tabbed.js to open
ipcMain.on("OpenSession", (event, session) => {
	console.log("Got open session request")
	mainWindow.webContents.send("OpenSession", "test")
});