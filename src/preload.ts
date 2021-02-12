// All of the Node.js APIs are available in the preload process.
// It has the same sandbox as a Chrome extension.

import * as Store from 'electron-store';
import { ipcRenderer } from 'electron';

import { SSHSession } from './session';
import { Tabs, Tab } from "./tabs";
import * as Split from 'split.js';
import { EventEmitter } from 'events';

const store = new Store();
console.log("electron-store path: ", store.path)

let tabs = Tabs.getInstance();

window.addEventListener("DOMContentLoaded", () => {
	var isRenderer = require('is-electron-renderer')
	console.log("preload - isRenderer? : ", isRenderer)

	ipcRenderer.on("StartSSH", (event, session: SSHSession, username: string, password: string) => {
		console.log("Session:", session)
		console.log("Password length:", password.length)

		if(session.username != null && session.username.length > 0) {
			username = session.username
		}

		let title = username;
		if(! title) {
			title = username + "@" + session.remote_host
		}


		let eventEmitter = new EventEmitter();
		eventEmitter.once("ready", () => {
			console.log("Successfuly connected!");
			console.log("Removing error listiner")
			eventEmitter.removeAllListeners("error");
			console.log("Event names:", eventEmitter.eventNames())
		})

		eventEmitter.once("error", (ev: Error) => {
			Tabs.getInstance().removeTab(tab.id);
			let title = "SSH Error";
			let message = ev.message;
			ipcRenderer.send("ShowError", message, title);
		})

		eventEmitter.once("greeting", (greetings: string) => {
			console.log("Greetings! : ", greetings);
			let title = "SSH Greetings message";
			ipcRenderer.send("ShowMessage", greetings, title);
		});

		eventEmitter.once("banner", (message: string) => {
			let title = "SSH Banner message";
			ipcRenderer.send("ShowMessage", message, title);
		});

		eventEmitter.once("close", (hadError: boolean) => {
			console.log("Close emitted, hadError? ", hadError);
			Tabs.getInstance().removeTab(tab.id);
		});
		

		let hostname = session.remote_host;
		let port = session.port;
		let tab: Tab = Tabs.getInstance().addSSHTerminal(username, password, hostname, port, eventEmitter, title)

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
	console.log("Preload - fit terminal");
	tabs.fit_terminal()
});
