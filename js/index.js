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

function onSessionOpen(button) {
	console.log("Opening session with button : " + button)
}

//Load in bookmarks (session pane) the saved sessions user saved on disk (/storage/sessions)
ipcRenderer.once("LoadSessions", (event, sessions) => {
	sessions.forEach(session => {
		var name = session["session_name"];
		//If user did not give session name, use the hostname instead
		if (! name) {
			name = session["remote_host"]
		}
		console.log("Loading session: " + name);
		
		var session_dom = document.createElement("button");
		session_dom.setAttribute("class", "session_item");
		session_dom.setAttribute("data-session_id", session["session_id"]);
		session_dom.onclick = function() {
			var session_id = this.dataset["session_id"];
			console.log("Opening a session: " + session_id)

			for(var _session of sessions) {
				if (_session["session_id"] == session_id) {
					console.log("Session details: ")
					console.dir(_session)

					//TODO: Tell xterm to open session: _session

					break;
				}
			}
		}

		session_dom.appendChild(document.createTextNode(name));

		var parent = document.getElementById("first");
		parent.appendChild(session_dom);
	});
})
