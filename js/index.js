const electron = require('electron')
const BrowserWindow = electron.remote.BrowserWindow
const path = require('path')
const url = require('url')
const remote = require ("electron").remote;
const ipcRenderer = electron.ipcRenderer;

const tabbed = require('./tabbed');


const CHANNEL = "Index";

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

//Populate session/bookmarks pane with buttons
//Sessions - list of sessions
function loadSessions(sessions) {
	sessions.forEach(session => {
		var name = session["session_name"];
		//If user did not give session name, use the hostname instead
		if (! name) {
			if (session["username"]) {
				name = session["username"] + "@" + session["remote_host"];
			} else {
				name = session["remote_host"];
			}
		}
		console.log("Loading session: " + name);
		
		var session_dom = document.createElement("button");
		session_dom.setAttribute("class", "session_item");
		session_dom.setAttribute("data-session_id", session["session_id"]);
		session_dom.style.cssText = "padding: 0px;"

		session_dom.onclick = function() {
			var session_id = this.dataset["session_id"];
			console.log("Clicked on open session: " + session_id);
			for(var _session of sessions) {
				if(_session["session_id"] == session_id) {
					tabbed.openTerminal(_session);
					break;
				}
			}
		}

		var img = document.createElement("img");
		img.setAttribute("src", "../resources/ssh.png");
		img.setAttribute("width", "24px");
		img.setAttribute("height", "24px");

		session_dom.appendChild(img);
		session_dom.appendChild(document.createTextNode(name));

		var parent = document.getElementById("first");
		parent.appendChild(session_dom);
	});
}

//Load in bookmarks (session pane) the saved sessions user saved on disk (/storage/sessions)
ipcRenderer.once("IndexLoadSessions", (event, sessions) => {
	console.log("index.js got LoadSession from main")
	loadSessions(sessions, () => {});

});