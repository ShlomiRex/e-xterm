import { SSHSession } from './session';
import * as Store from 'electron-store';
import { v4 as uuidv4 } from 'uuid';

let store: Store = new Store();


export class MyBookmarks {
	private sessions: Array<SSHSession>
	private static instance: MyBookmarks

	private uiPopulateCallback: any;
	private uiDeleteCallback: any;
		
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
		session.uuid = uuidv4()

		let bookmarks: Array<SSHSession> = undefined;
		if (store.has("bookmarks")) {
			bookmarks = store.get("bookmarks") as Array<SSHSession>;
		} else {
			bookmarks = new Array<SSHSession>();
		}
		bookmarks.push(session)
		store.set("bookmarks", bookmarks)

		//TODO: Call renderer process and tell him to populate bookmark!
		this.uiPopulateCallback(session)
	}

	/**
	 * Delete existing bookmark
	 * @param bookmarkId 
	 */
	deleteBookmark(bookmarkId: string) {
		let bookmarks: Array<SSHSession> = undefined;
		if (store.has("bookmarks")) {
			bookmarks = store.get("bookmarks") as Array<SSHSession>;

			let removeIndex: number = undefined
			for(let i = 0; i < bookmarks.length; i++) {
				if(bookmarks[i].uuid == bookmarkId) {
					removeIndex = i
					break
				}
			}
			if(removeIndex != null) {
				console.log("Deleting bookmark: ", bookmarkId, " it has index of: ", removeIndex);
				bookmarks.splice(removeIndex, 1);
				store.set("bookmarks", bookmarks);
				this.uiDeleteCallback(bookmarkId);
			} else {
				console.error("Could not find bookmark to remove with uuid: ", bookmarkId)
			}
		}
	}

	getSessions() : Array<SSHSession> {
		return this.sessions;
	}

	getBookmarkById(uuid: string): SSHSession {
		for(let s of this.sessions) {
			if(s.uuid == uuid) {
				return s
			}
		}
		return null
	}
	

};