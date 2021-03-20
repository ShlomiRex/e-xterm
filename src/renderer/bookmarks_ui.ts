import { SSHSession, WSLSession } from "../shared/session";
import { ipcRenderer } from 'electron';


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

function createElementFromHTML(htmlString: string): HTMLElement {
	var div: any = document.createElement('div');
	div.innerHTML = htmlString.trim();

	// Change this to div.childNodes to support multiple top-level nodes
	return div.firstChild;
}

export class BookmarksUI {
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

	static getBookmarkLabelFromSession(session: SSHSession | WSLSession) {
		if (session.protocol == "SSH") {
			session = session as SSHSession
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
		} else if (session.protocol == "WSL") {
			session = session as WSLSession
			//If user did not give session name, use distro name
			if (!session.session_name) {
				return `WSL: ${session.distro}`
			} else {
				return session.session_name;
			}
		}

	}

	/**
	 * Create bookmark item (UI) and add it
	 * @param session Session to populate
	 */
	populate(session: SSHSession | WSLSession) {
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
			ipcRenderer.send("DoubleClickedOnBookmark", bid);
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