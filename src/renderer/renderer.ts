import { SSHSession } from "../shared/session";
import { ipcRenderer, remote } from 'electron';
import { EventEmitter } from 'events';
import * as Split from 'split.js';
import { BookmarksUI } from './bookmarks_ui';
import { MyTerminal } from './terminal';

const { Menu, MenuItem } = remote;

const ElectronBrowser = require("electron-browser")
const electronBrowser = new ElectronBrowser()


document.querySelector('.btn-toggle-theme').addEventListener('click', function () {
	// Then toggle (add/remove) the .dark-theme class to the body
	document.body.classList.toggle('dark-theme');
})


let js : any= [];


BookmarksUI.createInstance();

function addTabViewTerminal(tab: any, view: any, myTerminal: MyTerminal) {
	console.debug("Added tab and view: ", tab, view)

	js.push({
		"MyTerminal": myTerminal,
		"tab": tab,
		"view": view
	})	
}

function addShell() {
	let res = electronBrowser.addTab("Shell", "../resources/terminal.png")
	let myterminal = new MyTerminal()
	myterminal.init_shell(res.view)

	addTabViewTerminal(res.tab, res.view, myterminal)
}

function addSSH(tabTitle: string, sshSession: SSHSession, pass: string, eventEmitter: EventEmitter) {
	let res = electronBrowser.addTab(tabTitle, "../resources/ssh.png")
	let myterminal = new MyTerminal()
	myterminal.init_ssh(res.view, sshSession, pass, eventEmitter)

	addTabViewTerminal(res.tab, res.view, myterminal)
}

function addWSL(tabTitle: string) {
	let res = electronBrowser.addTab(tabTitle, "../resources/tux.svg")
	let myterminal = new MyTerminal()
	myterminal.init_wsl(res.view)

	addTabViewTerminal(res.tab, res.view, myterminal)	
}

document.getElementById("btn_newSession").addEventListener("click", (ev: MouseEvent) => {
	ipcRenderer.send("OpenNewSessionWindow")
});

document.getElementById("btn_newShell").addEventListener("click", (ev: MouseEvent) => {
	addShell();
});

document.getElementById("btn_newWSL").addEventListener("click", (ev: MouseEvent) => {
	addWSL("WSL");
})


//These 2 variables help determined what is the target, when MenuItem's click() function is called
//So we know what is the target when we get to that function
//They are set to null after contextmenu closes
let bookmarkIdTarget: string = undefined
let terminalIdTarget: string = undefined

const bookmarkContextMenu = new Menu();
const terminalContextMenu = new Menu();
function setup_context_menu() {
	function setupBookmarksContextMenu() {
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
	}
	function setupTerminalContextMenu() {
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
	}

	setupBookmarksContextMenu()
	setupTerminalContextMenu()

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
				for (let path of (mouseEvent as any).path) {
					if (path.classList.contains("eb-view")) {
						let terminal_id = path.dataset.eb_view_id;
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
			} catch (e: any) {
				//user did not clicked on terminal
			}
		}


	})
}
setup_context_menu()










window.addEventListener("DOMContentLoaded", () => {
	ipcRenderer.on("StartSSH", (event, session: SSHSession, username: string, password: string) => {
		console.log("Session:", session)
		console.log("Password length:", password.length)

		if (session.username != null && session.username.length > 0) {
			username = session.username
		}

		let title: string = undefined
		if (session.session_name) {
			title = session.session_name
		} else {
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

		addSSH(title, session, password, eventEmitter);
	});

	ipcRenderer.on("StartWSL", (event) => {
		addWSL("WSL")
	});

	ipcRenderer.on("WindowResize", (ev, size: Array<number>) => {
		//tabs.fit_terminal()
		
	});

	ipcRenderer.on("Renderer_BookmarksUI_AddBookmark", (ev, sshSession: SSHSession) => {
		console.debug("Renderer - will add bookmark")
		BookmarksUI.getInstance().populate(sshSession);
	});

	ipcRenderer.on("Renderer_BookmarksUI_RemoveBookmark", (ev, bookmarkId: string) => {
		console.debug("Renderer - will remove bookmark")
		BookmarksUI.getInstance().unpopulate(bookmarkId);
	});

	ipcRenderer.on("Renderer_BookmarksUI_ClearBookmarks", () => {
		console.debug("Renderer - will clear bookmarks");
		BookmarksUI.getInstance().clear();
	});

	ipcRenderer.on("Renderer_BookmarksUI_UpdateBookmark", (ev, session: SSHSession) => {
		console.debug("Renderer - will update bookmark:", session);
		let text = BookmarksUI.getBookmarkLabelFromSession(session);
		let bookmarkId = session.uuid;
		BookmarksUI.getInstance().update(bookmarkId, text);
	});

});

window.addEventListener('resize', () => {
	js.forEach((element: any) => {
		element.MyTerminal.fit()
	});
});

//Setup split.js
Split(['#left-panel', '#main-panel'],
	{
		direction: "horizontal",
		sizes: [25, 75]
	}
);

