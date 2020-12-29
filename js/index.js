const electron = require('electron')
const BrowserWindow = electron.remote.BrowserWindow
const path = require('path')
const url = require('url')
const remote = require ("electron").remote;
const ipcRenderer = electron.ipcRenderer;

document.querySelector('#btn_newSession').addEventListener('click', () => {
	const mainWindow = remote.getCurrentWindow ();

	let child = new BrowserWindow({
		parent: mainWindow, 
		modal: true, 
		show: false,
		title: "New Session",
		webPreferences: {
			contextIsolation: true,
			preload: path.join(__dirname, './preload/NewSession.js')
		}
	})
	child.setMenu(null)
	child.webContents.openDevTools()
	child.loadURL(url.format({
		pathname: path.join(__dirname, '../html/new_session.html'),
		protocol: 'file',
		slashes: true
	}))
	child.once('ready-to-show', () => {
		child.show()
	})
	child.on('close', function () { child = null })
})

//ipcRenderer.send("LoadSessionsRequest", "ping")

ipcRenderer.on("LoadSessions", (event, sessions) => {
	sessions.forEach(session => {
		var name = session["session_name"];
		if (! name) {
			name = session["remote_host"]
		}
		console.log("Loading session: " + name);
		
		var session_dom = document.createElement("li");
		session_dom.setAttribute("class", "session_item");
		session_dom.setAttribute("onclick", "javascript:alert('event has been triggered');");

		session_dom.appendChild(document.createTextNode(name));

		var parent = document.getElementById("first");
		parent.appendChild(session_dom);
	});
})
