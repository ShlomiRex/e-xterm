// All of the Node.js APIs are available in the preload process.
// It has the same sandbox as a Chrome extension.

import * as Store from 'electron-store';
import { contextBridge, ipcRenderer } from 'electron'

import { MyBookmarks } from './bookmarks'
import { SSHSession } from './session';
import { Tabs } from "./tabs"
import * as Split from 'split.js'

const store = new Store();
console.log("electron-store path: ", store.path)

let tabs = Tabs.getInstance();

window.addEventListener("DOMContentLoaded", () => {
	var isRenderer = require('is-electron-renderer')
	console.log("preload - isRenderer? : ", isRenderer)

	//When user double clicks on bookmark, open ssh
	let open_bookmark_callback = function (session: SSHSession) {
		console.log("Openning session: ", session)

		//Tell main to open login window
		ipcRenderer.send("OpenLoginWindow")
		//When main send back password
		ipcRenderer.once("Password", (event, password: string) => {
			console.log("GOT PASSWORD:", password)
			//TODO: Open SSH

			//let sshTerminal = new MyTerminal(null);
			//tabs.addTerminal(sshTerminal);
		});
	}

	let DOM_SessionContainer = document.getElementById("SessionsContainer");
	MyBookmarks.createInstance(DOM_SessionContainer, open_bookmark_callback);
	let book = MyBookmarks.getInstance();

	tabs.init()
	tabs.addShellTerminal();
	//tabs.addTextTerminal();
	//tabs.addShellTerminal();
	//tabs.addTextTerminal();

	//tabs.addSSHTerminal();


	//Setup split.js
	Split(['#left-panel', '#main-panel'],
		{
			sizes: [20, 80],
			gutterSize: 5,

		}
	);
});

ipcRenderer.on("WindowResize", (ev, size: Array<number>) => {
	let width = size[0]
	let height = size[1]

	tabs.fit_terminal()
});


//Expose API to renderer script
contextBridge.exposeInMainWorld("api",
	{
		test() {
			console.log("test log from contextBridged exposed api")
		},

		clickedOnNewSession() {
			ipcRenderer.send("OpenNewSession")
		}
	}
);