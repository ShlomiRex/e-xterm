// All of the Node.js APIs are available in the preload process.
// It has the same sandbox as a Chrome extension.

import * as Store from 'electron-store';
import { contextBridge, ipcRenderer } from 'electron'

import { MyBookmarks } from './bookmarks'
import { SSHSession } from './session';
import { Tabs, Tab } from "./tabs"
import * as Split from 'split.js'

const store = new Store();
console.log("electron-store path: ", store.path)

let tabs = Tabs.getInstance();

window.addEventListener("DOMContentLoaded", () => {
	var isRenderer = require('is-electron-renderer')
	console.log("preload - isRenderer? : ", isRenderer)

	ipcRenderer.on("StartSSH", (event, session: SSHSession, password: string) => {
		console.log("Session:", session)
		console.log("Password length:", password.length)

		let title = session.session_name;
		if(! title) {
			title = session.username + "@" + session.remote_host
		}
		let tab: Tab = Tabs.getInstance().addSSHTerminal(session, password, title)

		console.log("Created SSH tab:", tab)
	});


	//TODO: Do something, call renderer...
	//let DOM_SessionContainer = document.getElementById("SessionsContainer");
	//MyBookmarks.createInstance(DOM_SessionContainer, open_bookmark_callback);
	//let book = MyBookmarks.getInstance();
	//console.log("Bookmark instance: ", book)

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
