import { SSHSession } from './session'
import * as Store from 'electron-store';
import { session } from 'electron';

let store: Store = new Store();


export class MyBookmarks {
	private sessions: Array<SSHSession>
	private static instance: MyBookmarks

	private uiPopulateCallback: any;
	private uiDeleteCallback: any;

	//Accumulator
	private id: number = 0;
		
	/**
	 * 
	 * @param sessions The sessions to populate
	 * @param uiPopulateCallback Callback to UI to add and update bookmarks ui
	 * @param uiDeleteCallback Callback to UI to delete and update bookmarks ui
	 */
	private constructor(sessions: Array<SSHSession>, uiPopulateCallback: any, uiDeleteCallback: any) {
		this.sessions = sessions;
		this.uiPopulateCallback = uiPopulateCallback;
		this.uiDeleteCallback = uiDeleteCallback;

		for (var session of sessions) {
			session.id = this.id++
			//this.populate(session);
		}
	}

	static createInstance(uiPopulateCallback: any, uiDeleteCallback: any) {
		if (!MyBookmarks.instance) {
			//no instance, create

			//Convert simple array of json object in js to Array<SSHSession>
			let bookmarks_json: any = store.get("bookmarks")
			let bookmarks = new Array<SSHSession>();

			if (bookmarks_json) {
				for (let bookmark of bookmarks_json) {
					bookmarks.push(bookmark)
				}
			}

			MyBookmarks.instance = new MyBookmarks(bookmarks, uiPopulateCallback, uiDeleteCallback);
		}
	}

	static getInstance(): MyBookmarks {
		return MyBookmarks.instance;
	}

	/**
	 * Add new bookmark
	 * @param session 
	 */
	newBookmark(session: SSHSession) {
		let bookmarks: Array<SSHSession> = undefined;
		if (store.has("bookmarks")) {
			bookmarks = store.get("bookmarks") as Array<SSHSession>;
		} else {
			bookmarks = new Array<SSHSession>();
		}
		bookmarks.push(session)
		store.set("bookmarks", bookmarks)

		session.id = this.id ++;
		//TODO: Call renderer process and tell him to populate bookmark!
		this.uiPopulateCallback(session)
	}

	/**
	 * Delete existing bookmark
	 * @param bookmarkId 
	 */
	deleteBookmark(bookmarkId: number) {
		let bookmarks: Array<SSHSession> = undefined;
		if (store.has("bookmarks")) {
			bookmarks = store.get("bookmarks") as Array<SSHSession>;
			this.sessions.forEach((sshSession: SSHSession) => {
				if(sshSession.id == bookmarkId) {
					console.log("Found session id: ", sshSession.id)
					console.log("Going to delete the session:", sshSession)

					//TODO: Call renderer process and tell him to remove bookmark!
					this.uiDeleteCallback(sshSession);
				}
			});
		}
	}

	getSessions() : Array<SSHSession> {
		return this.sessions;
	}

};