import { SSHSession } from "../shared/session";
import { ipcRenderer, remote } from 'electron';
import { EventEmitter } from 'events';
import { Tabs, Tab } from "../renderer/tabs";
import * as Split from 'split.js';

const { Menu, MenuItem } = remote;

const ElectronChromeTabs = require("electron-chrome-tabs")
const electronTabs = new ElectronChromeTabs()
electronTabs.addTab("Test", "../html/test.html")

Tabs.createInstance();
let tabs = Tabs.getInstance();

function createElementFromHTML(htmlString: string): HTMLElement {
	var div: any = document.createElement('div');
	div.innerHTML = htmlString.trim();

	// Change this to div.childNodes to support multiple top-level nodes
	return div.firstChild;
}

class BookmarksUI {
	private uiParent: HTMLElement;
	private bookmarks: Array<HTMLElement>;

	private static instance: BookmarksUI

	private constructor() {
		this.uiParent = document.getElementById("bookmarks-container");
		this.bookmarks = new Array<HTMLElement>();
	}

	static createInstance() {
		if (!BookmarksUI.instance) {
			//no instance, create

			BookmarksUI.instance = new BookmarksUI();
		}
	}

	static getInstance(): BookmarksUI {
		return BookmarksUI.instance;
	}

	static getBookmarkLabelFromSession(session: SSHSession) {
		//If user did not give session name, use the hostname instead
		if (!session.session_name) {
			if (session.username) {
				return session.username + "@" + session.remote_host;
			} else {
				return session.remote_host;
			}
		} else {
			return session.session_name;
		}
	}

	/**
	 * Create bookmark item (UI) and add it
	 * @param session Session to populate
	 */
	populate(session: SSHSession) {
		let bookmark_label: string = BookmarksUI.getBookmarkLabelFromSession(session);
		var protocol = session.protocol;

		console.debug("Loading session: " + bookmark_label + " protocol: " + protocol);

		let template = `\
		<div class="list-item"> \
			<label> \
				${bookmark_label} \
			</label> \
			<span class="badge rounded-pill" style="background-color:black; color: white;">${protocol}</span> \
		</div>\
		`;

		var bookmark_item = createElementFromHTML(template);
		console.log("Bookmark item: \n", bookmark_item);
		bookmark_item.setAttribute("data-bookmark-id", "" + session.uuid);

		bookmark_item.addEventListener("dblclick", (ev: MouseEvent) => {
			let bid = getBookmarkIdFromMouseEvent(ev)
			console.log("Double click on bookmarkId: ", bid)
			ipcRenderer.send("OpenLoginWindow", bid);
		});

		this.uiParent.appendChild(bookmark_item);

		this.bookmarks.push(bookmark_item);
	}

	/**
	 * Remove bookmark by given id
	 * @param bookmarkId 
	 */
	unpopulate(bookmarkId: string) {

		let index = this.getBookmarkIndexById(bookmarkId);
		if (index >= 0) {
			console.log("Going to remove:", bookmarkId, " with index:", index);
			this.bookmarks[index].remove(); //Remove HTMLElement
			this.bookmarks.splice(index, 1)
		} else {
			console.error("Could not find bookmark with id:", bookmarkId);
		}
	}

	private getBookmarkIndexById(bookmarkId: string) {
		for (let i = 0; i < this.bookmarks.length; i++) {
			if (this.bookmarks[i].dataset.bookmarkId == bookmarkId) {
				return i
			}
		}
		return -1
	}

	/**
	 * Remove all bookmarks
	 */
	clear() {
		let bookmarkIds = []
		for (let bookmark of this.bookmarks) {
			bookmarkIds.push(bookmark.dataset.bookmarkId);
		}

		for (let bookmarkId of bookmarkIds) {
			this.unpopulate(bookmarkId);
		}
	}

	/**
	 * Update text of bookmark
	 * @param bookmarkId 
	 * @param innerText 
	 */
	update(bookmarkId: string, innerText: string) {
		let index = this.getBookmarkIndexById(bookmarkId);
		if (index >= 0) {
			let bookmark = this.bookmarks[index];
			console.log("Updating bookmark inner text from ", bookmark.innerText, " to:", innerText);
			//bookmark.innerText = innerText;
			(bookmark.firstElementChild as HTMLElement).innerText = innerText;
		}
	}
};

function getBookmarkIdFromMouseEvent(ev: any): string {
	//Traverse path and find the bookmarkId
	//User can click on the pill element / not directly on the text. So we traverse path
	for (var path of ev.path) {
		if (path.hasAttribute("data-bookmark-id")) {
			return path.getAttribute("data-bookmark-id");
		}
	}
	return undefined
}

BookmarksUI.createInstance();

document.getElementById("btn_newSession").addEventListener("click", (ev: MouseEvent) => {
	ipcRenderer.send("OpenNewSessionWindow")
});

document.getElementById("btn_newShell").addEventListener("click", (ev: MouseEvent) => {
	ipcRenderer.send("NewShell")
});

ipcRenderer.on("Renderer_Tabs_AddTab", (ev, title: string, source: string) => {
	console.log("Got: Renderer_Tabs_AddTab")
	electronTabs.addTab(title, source);
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

window.addEventListener("DOMContentLoaded", () => {
	ipcRenderer.on("StartSSH", (event, session: SSHSession, username: string, password: string) => {
		console.log("Session:", session)
		console.log("Password length:", password.length)

		if (session.username != null && session.username.length > 0) {
			username = session.username
		}

		let title: string = undefined
		if(session.session_name) {
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


		let tab: Tab = Tabs.getInstance().addSSHTerminal(session, password, eventEmitter, title)

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

	//tabs.init()
	//tabs.addShellTerminal();


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
	tabs.fit_terminal()
});



