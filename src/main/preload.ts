// All of the Node.js APIs are available in the preload process.
// It has the same sandbox as a Chrome extension.

import * as Store from 'electron-store';
import { ipcRenderer, remote} from 'electron';
const { Menu, MenuItem } = remote;

import { SSHSession } from '../shared/session';
import { Tabs, Tab } from "../renderer/tabs";
import * as Split from 'split.js';

import { EventEmitter } from 'events';

const store = new Store();
console.log("electron-store path: ", store.path)

Tabs.createInstance();
let tabs = Tabs.getInstance();

window.addEventListener("DOMContentLoaded", () => {
	var isRenderer = require('is-electron-renderer')
	console.debug("preload - isRenderer? : ", isRenderer)

	ipcRenderer.on("StartSSH", (event, session: SSHSession, username: string, password: string) => {
		console.log("Session:", session)
		console.log("Password length:", password.length)

		if (session.username != null && session.username.length > 0) {
			username = session.username
		}

		let title = username;
		if (!title) {
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
			//Tabs.getInstance().removeTabContent(tab.id);
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
			let type = "info";
			let detail = "Banner message";
			ipcRenderer.send("ShowMessage", detail, title, type, message);
		});

		eventEmitter.once("close", (hadError: boolean) => {
			console.log("Close emitted, hadError? ", hadError);
			//Tabs.getInstance().removeTabContent(tab.id);
		});


		let hostname = session.remote_host;
		let port = session.port;
		let tab: Tab = Tabs.getInstance().addSSHTerminal(username, password, hostname, port, eventEmitter, title)

		console.log("Created SSH tab:", tab)


	});

	ipcRenderer.on("StartShell", () => {
		Tabs.getInstance().addShellTerminal();
	});


	//TODO: Do something, call renderer...
	//let DOM_SessionContainer = document.getElementById("SessionsContainer");
	//MyBookmarks.createInstance(DOM_SessionContainer, open_bookmark_callback);
	//let book = MyBookmarks.getInstance();
	//console.log("Bookmark instance: ", book)

	tabs.init()
	tabs.addShellTerminal();


	//Setup split.js
	Split(['#left-panel', '#main-panel'],
		{
			direction: "horizontal",
			sizes: [25, 75]
		}
	);

	/*
	Split(['#split1', '#split2'],
		{
			direction: "vertical"
		}
	);
	*/
});

ipcRenderer.on("WindowResize", (ev, size: Array<number>) => {
	console.debug("Preload - fit terminal");
	tabs.fit_terminal()
});


//These 2 variables help determined what is the target, when MenuItem's click() function is called
//So we know what is the target when we get to that function
//They are set to null after contextmenu closes
let bookmarkIdTarget: string = undefined
let terminalIdTarget: string = undefined 

const bookmarkContextMenu = new Menu();
bookmarkContextMenu.append(new MenuItem({
	"label": 'Settings',
	"id": "settings",
	"click": (menuItem: any) => {
		console.log("Clicked on settings", bookmarkIdTarget)
		ipcRenderer.send("OpenBookmarkSettings", bookmarkIdTarget)
	}
}));
bookmarkContextMenu.append(new MenuItem({
	"type": "separator"
}));
bookmarkContextMenu.append(new MenuItem({
	"label": "Delete bookmark",
	"id": "delete",
	"click": (menuItem: any) => {
		console.log("Clicked on delete bookmark", bookmarkIdTarget)
		ipcRenderer.send("DeleteBookmark", bookmarkIdTarget)
	}
}));



const terminalContextMenu = new Menu();
terminalContextMenu.append(new MenuItem({
	"label": "Copy",
	"id": "terminal_copy",
	"role": "copy",
	"click": (menuItem: any) => {
		console.log("Terminal copy clicked", terminalIdTarget)
	}
}));
terminalContextMenu.append(new MenuItem({
	"label": "Paste",
	"id": "terminal_paste",
	"role": "paste",
	"click": (menuItem: any) => {
		console.log("Terminal paste clicked", terminalIdTarget)
	}
}))


window.addEventListener('contextmenu', (mouseEvent: MouseEvent) => {
	mouseEvent.preventDefault()
	console.log("Context menu fired!", mouseEvent)

	//Find if path is bookmark. Object may not have "hasAttribute" so try catch
	try {
		for (let path of (mouseEvent as any).path) {
			if (path.hasAttribute("data-bookmark-id")) {
				let bookmarkId = path.getAttribute("data-bookmark-id");
				bookmarkIdTarget = bookmarkId
				console.log("Right clicked on bookmark id:", bookmarkId)
				bookmarkContextMenu.popup({
					"window": remote.getCurrentWindow(),
					"callback": () => {
						console.log("Bookmark ContextMenu closed")
						bookmarkIdTarget = null
					}
				})
				break
			}
		}
	} catch (e: any) {
		//did not find bookmark target
		//maybe user clicked on terminal?
		try {
			for(let path of (mouseEvent as any).path) {
				if(path.id.startsWith("terminal_")) {
					let terminal_id = path.id;
					console.log("Found target is terminal", terminal_id);
					terminalIdTarget = terminal_id
					terminalContextMenu.popup({
						"window": remote.getCurrentWindow(),
						"callback": () => {
							console.log("Terminal ContextMenu closed")
							terminalIdTarget = null
						}
					})
					break;
				}
			}
		} catch(e: any) {
			//user did not clicked on terminal
		}
	}


})