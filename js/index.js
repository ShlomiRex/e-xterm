const electron = require('electron')
const BrowserWindow = electron.remote.BrowserWindow
const path = require('path')
const url = require('url')
const remote = require("electron").remote;
const ipcRenderer = electron.ipcRenderer;

const tabbed = require('./tabbed');


const CHANNEL = "Index";

document.querySelector('#btn_newSession').addEventListener('click', () => {
	const mainWindow = remote.getCurrentWindow();

	//TODO: Deal with macOS modal no closing / minimize / maximize
	let child = new BrowserWindow({
		parent: mainWindow,
		modal: false,
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
/*
Example to create:
<a class="list-group-item list-group-item-action d-flex justify-content-between align-items-center"
	id="list-home-list" data-toggle="list" href="#list-home" role="tab"
	aria-controls="home">
	root@10.0.0.9
	<span class="badge rounded-pill"
		style="background-color:black; color: white;">SSH</span>
</a>
*/
		var name = session["session_name"];
		//If user did not give session name, use the hostname instead
		if (!name) {
			if (session["username"]) {
				name = session["username"] + "@" + session["remote_host"];
			} else {
				name = session["remote_host"];
			}
		}

		var protocol = session["protocol"];
		console.log("Loading session: " + name + " protocol: " + protocol);

		var session_item = document.createElement("a");
		session_item.className = "list-group-item list-group-item-action d-flex justify-content-between align-items-center";
		session_item.setAttribute("data-toggle", "list");
		session_item.setAttribute("role", "tab");
		session_item.setAttribute("aria-controls", name); //Accessability for screen readers
		session_item.innerText = name;
		//This makes cursor look like clicking
		session_item.setAttribute("href", "");

		function createBadge(protocol) {
			var badge = document.createElement("span");
			badge.className = "badge rounded-pill";
			badge.innerText = protocol;

			if (protocol == "SSH") {
				badge.style = "background-color:black; color: white;";
			}

			return badge;
		}

		//Append badge
		session_item.appendChild(createBadge(protocol));

		//Append to session pane
		var parent = document.getElementById("SessionsContainer");
		parent.appendChild(session_item);
	});
}

//Load in bookmarks (session pane) the saved sessions user saved on disk (/storage/sessions)
ipcRenderer.once("IndexLoadSessions", (event, sessions) => {
	console.log("index.js got LoadSession from main")
	loadSessions(sessions, () => { });

});