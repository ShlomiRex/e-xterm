// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// No Node.js APIs are available in this process unless
// nodeIntegration is set to true in webPreferences.
// Use preload.js to selectively enable features
// needed in the renderer process.

import { SSHSession } from "./session";
import { ipcRenderer } from 'electron';

function createElementFromHTML(htmlString: string): HTMLElement {
	var div: any = document.createElement('div');
	div.innerHTML = htmlString.trim();

	// Change this to div.childNodes to support multiple top-level nodes
	return div.firstChild;
}

class BookmarksUI {
	private uiParent: HTMLElement;
	private bookmarks: Array<HTMLElement>;

	constructor() {
		this.uiParent = document.getElementById("SessionsContainer");
		this.bookmarks = new Array<HTMLElement>();
	}

	/**
	 * Add bookmarks to ui
	 * @param session Session to populate
	 */
	populate(session: SSHSession) {
		var name = session.session_name;
		//If user did not give session name, use the hostname instead
		if (!name) {
			if (session.username) {
				name = session.username + "@" + session.remote_host;
			} else {
				name = session.remote_host;
			}
		}

		var protocol = session.protocol;
		console.log("Loading session: " + name + " protocol: " + protocol);

		var bookmark_item = document.createElement("a");
		bookmark_item.className = "bookmarks-item list-group-item list-group-item-action d-flex justify-content-between align-items-center";
		bookmark_item.setAttribute("data-bs-toggle", "list");
		bookmark_item.setAttribute("role", "tab");
		bookmark_item.setAttribute("aria-controls", name); //Accessability for screen readers
		bookmark_item.innerText = name;

		//This makes cursor look like clicking
		//bookmark_item.setAttribute("href", "");

		bookmark_item.setAttribute("data-bookmark-id", "" + session.uuid)

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

		bookmark_item.addEventListener("dblclick", (ev: MouseEvent) => {
			let bid = getBookmarkIdFromMouseEvent(ev)
			console.log("Double click on bookmarkId: ", bid)
			ipcRenderer.send("OpenLoginWindow", bid);
		});

		let gear_image: HTMLElement = createElementFromHTML("<img class='hide settings-icon' src='../resources/gear.svg' alt='Settings'>");
		gear_image.onclick = (ev: MouseEvent) => {
			let bookmarkId: string = getBookmarkIdFromMouseEvent(ev);
			console.log("On click settings of bookmarkId:", bookmarkId);
			if (bookmarkId != null) {
				ipcRenderer.send("OpenBookmarkSettings", bookmarkId);
			} else {
				console.error("Could not find bookmarkId")
			}


		};

		var badge = document.createElement("span");
		badge.className = "badge rounded-pill";
		badge.innerText = protocol;
		badge.setAttribute("style", "background-color:black; color: white;");

		let right_div: HTMLElement = document.createElement("div");

		right_div.appendChild(gear_image);
		right_div.appendChild(badge);

		bookmark_item.appendChild(right_div);

		this.uiParent.appendChild(bookmark_item);

		this.bookmarks.push(bookmark_item);
	}

	/**
	 * Remove bookmark by given id
	 * @param bookmarkId 
	 */
	unpopulate(bookmarkId: string) {

		let index = this.getBookmarkIndexById(bookmarkId);
		if(index >= 0) {
			console.log("Going to remove:", bookmarkId, " with index:", index);
			this.bookmarks[index].remove(); //Remove HTMLElement
			this.bookmarks.splice(index, 1)
		} else {
			console.error("Could not find bookmark with id:", bookmarkId);
		}
	}

	private getBookmarkIndexById(bookmarkId: string) {
		for(let i = 0; i < this.bookmarks.length; i++) {
			if(this.bookmarks[i].dataset.bookmarkId == bookmarkId) {
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
		for(let bookmark of this.bookmarks) {
			bookmarkIds.push(bookmark.dataset.bookmarkId);
		}

		for(let bookmarkId of bookmarkIds) {
			this.unpopulate(bookmarkId);
		}
	}
};


const Bookmarks = new BookmarksUI();

document.getElementById("btn_newSession").addEventListener("click", (ev: MouseEvent) => {
	ipcRenderer.send("OpenNewSessionWindow")
});




ipcRenderer.on("AddBookmark", (ev, sshSession: SSHSession) => {
	console.log("Renderer - will add bookmark")
	Bookmarks.populate(sshSession);
});

ipcRenderer.on("RemoveBookmark", (ev, bookmarkId: string) => {
	console.log("Renderer - will remove bookmark")
	Bookmarks.unpopulate(bookmarkId);
});

ipcRenderer.on("ClearBookmarks", () => {
	console.log("Renderer - will clear bookmarks");
	Bookmarks.clear();
});