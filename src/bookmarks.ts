import { SSHSession } from './session'
import * as Store from 'electron-store';

let store: Store = new Store();


export class MyBookmarks {
	private sessions: Array<SSHSession>
	private uiParent: HTMLElement

	private callback: any

	private static instance: MyBookmarks

	/**
	 * 
	 * @param sessions The sessions to populate
	 * @param uiParent The UI to populate bookmarks
	 * @param callback Callback to call when user opens bookmark
	 */
	private constructor(sessions: Array<SSHSession>, uiParent: HTMLElement, callback: any) {
		this.sessions = sessions;
		this.uiParent = uiParent;
		this.callback = callback;

		let id = 0
		for (var session of sessions) {
			session.session_id = id++
			this.populate(session);
		}
	}

	static createInstance(uiParent: HTMLElement, callback: any) {
		if (!MyBookmarks.instance) {
			//no instance, create

			//Convert simple array of json object in js to Array<SSHSession>
			let bookmarks_json: any = store.get("bookmarks")
			console.log("Loading sessions:", bookmarks_json)
			let bookmarks = new Array<SSHSession>();

			if (bookmarks_json) {
				for (let bookmark of bookmarks_json) {
					bookmarks.push(bookmark)
				}
			}

			MyBookmarks.instance = new MyBookmarks(bookmarks, uiParent, callback);
		}
	}

	static getInstance(): MyBookmarks {
		console.log("Returning instance:", MyBookmarks.instance)
		return MyBookmarks.instance;
	}

	/**
	 * Add bookmarks to ui
	 * @param session Session to populate
	 */
	populate(session: SSHSession) {
		/*
			Example to create:
			<a class="list-group-item list-group-item-action d-flex justify-content-between align-items-center"
				id="list-home-list" data-bs-toggle="list" href="#list-home" role="tab"
				aria-controls="home">
				root@10.0.0.9
				<span class="badge rounded-pill"
					style="background-color:black; color: white;">SSH</span>
			</a>
		*/


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
		bookmark_item.className = "list-group-item list-group-item-action d-flex justify-content-between align-items-center";
		bookmark_item.setAttribute("data-bs-toggle", "list");
		bookmark_item.setAttribute("role", "tab");
		bookmark_item.setAttribute("aria-controls", name); //Accessability for screen readers
		bookmark_item.innerText = name;
		//This makes cursor look like clicking
		bookmark_item.setAttribute("href", "");

		let bookmark_id = session.session_id
		bookmark_item.setAttribute("data-bookmark-id", "" + bookmark_id)

		bookmark_item.addEventListener("click", () => {
			//TODO: Choose something to do
		});

		bookmark_item.addEventListener("dblclick", (mouseEvent) => {
			let myMouseEvent: any = mouseEvent

			//Traverse path and find the bookmarkId
			//User can click on the pill element / not directly on the text. So we traverse path
			for (var path of myMouseEvent.path) {
				if (path.hasAttribute("data-bookmark-id")) {
					let bid = parseInt(path.getAttribute("data-bookmark-id"))
					console.log("Double click on bookmarkId: ", bid)

					let session = this.sessions[bid]
					this.callback(session)

					break
				}
			}


		});

		var badge = document.createElement("span");
		badge.className = "badge rounded-pill";
		badge.innerText = protocol;
		badge.setAttribute("style", "background-color:black; color: white;");

		bookmark_item.appendChild(badge);

		this.uiParent.appendChild(bookmark_item);
	}

	/**
	 * Store inside electron configuration file the session
	 * @param session A Json object
	 */
	static newBookmark(session: SSHSession) {
		let bookmarks: Array<SSHSession> = undefined;
		if (store.has("bookmarks")) {
			bookmarks = store.get("bookmarks") as Array<SSHSession>;
		} else {
			bookmarks = new Array<SSHSession>();
		}
		bookmarks.push(session)
		store.set("bookmarks", bookmarks)
	}

};