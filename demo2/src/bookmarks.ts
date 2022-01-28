// import { SSHSession, WSLSession } from '../shared/session';
import Store from 'electron-store';
import { v4 as uuidv4 } from 'uuid';

let store = new Store();

export interface SSHSession {
	// Internal ID, used for keeping track of bookmarks
	uuid: string 

	//Everything else is settings
	protocol: string,
	remote_host: string,
	username: string,
	port: number,
	session_name: string,
	session_description: string
	x11_forwarding: boolean,
	compression: boolean,
	private_key: boolean,
	private_key_path?: string
};

export interface WSLSession {
	// Internal ID, used for keeping track of bookmarks
	uuid: string 

	//Everything else is settings
	protocol: string,
	distro: string,
	session_name: string,
	session_description: string
}


export default class Bookmarks {
	private sessions: Array<SSHSession | WSLSession>
	private static instance: Bookmarks

	private uiPopulateCallback: any;
	private uiDeleteCallback: any;

	/**
	 * 
	 * @param sessions The sessions to populate
	 * @param uiPopulateCallback Callback to UI to add and update bookmarks ui
	 * @param uiDeleteCallback Callback to UI to delete and update bookmarks ui
	 */
	private constructor(sessions: Array<SSHSession | WSLSession>, uiPopulateCallback: any, uiDeleteCallback: any) {
		this.sessions = sessions;
		this.uiPopulateCallback = uiPopulateCallback;
		this.uiDeleteCallback = uiDeleteCallback;
	}

	static createInstance(uiPopulateCallback: any, uiDeleteCallback: any) {
		if (!Bookmarks.instance) {
			//no instance, create

			//Convert simple array of json object in js to Array<SSHSession>
			let bookmarks_json: any = store.get("bookmarks")
			let bookmarks = new Array<SSHSession | WSLSession>();

			if (bookmarks_json) {
				for (let bookmark of bookmarks_json) {
					bookmarks.push(bookmark)
				}
			}

			Bookmarks.instance = new Bookmarks(bookmarks, uiPopulateCallback, uiDeleteCallback);
		}
	}

	static getInstance(): Bookmarks {
		return Bookmarks.instance;
	}

	/**
	 * Add new bookmark
	 * @param session 
	 */
	newBookmark(session: SSHSession | WSLSession) {
		session.uuid = uuidv4()
		let bookmarks: Array<SSHSession | WSLSession> = undefined;
		if (store.has("bookmarks")) {
			bookmarks = store.get("bookmarks") as Array<SSHSession>;
		} else {
			bookmarks = new Array<SSHSession>();
		}
		bookmarks.push(session)
		store.set("bookmarks", bookmarks)

		this.sessions.push(session);

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
			for (let i = 0; i < bookmarks.length; i++) {
				if (bookmarks[i].uuid == bookmarkId) {
					removeIndex = i
					break
				}
			}
			if (removeIndex != null) {
				console.log("Deleting bookmark: ", bookmarkId, " it has index of: ", removeIndex);
				bookmarks.splice(removeIndex, 1);
				store.set("bookmarks", bookmarks);
				this.uiDeleteCallback(bookmarkId);
			} else {
				console.error("Could not find bookmark to remove with uuid: ", bookmarkId)
			}
		}
	}

	getSessions(): Array<SSHSession | WSLSession> {
		return this.sessions;
	}

	getBookmarkById(uuid: string): SSHSession | WSLSession {
		for (let s of this.sessions) {
			if (s.uuid == uuid) {
				return s
			}
		}
		return null
	}

	private getIndexOfSessionByBookmarkId(uuid: string): number {
		for (let i = 0; i < this.sessions.length; i++) {
			if (this.sessions[i].uuid == uuid) {
				return i
			}
		}
		return -1
	}

	/**
	 * Update existing bookmark with new settings
	 * @param uuid The ID of the bookmark
	 * @param json The new settings to set for the bookmark
	 */
	updateBookmark(uuid: string, json: SSHSession) {
		//Here we actually change the item in the array. So we need pointer.
		//getBookmarkById returns a copy. So don't use it.

		let index = this.getIndexOfSessionByBookmarkId(uuid);
		if (index < 0) {
			console.error("Did not find bookmark with id:", uuid)
		} else {
			this.sessions[index] = json
			this.sessions[index].uuid = uuid //The argument json doesn't have uuid because renderer is stupid and has no main context (json.uuid not exist)

			//Store has bookmarks because of index >= 0
			let bookmarks_json: any = store.get("bookmarks")
			let bookmarks = new Array<SSHSession | WSLSession>(); //bookmarks from store
	
			//Just push everything onto stack
			for (let bookmark of bookmarks_json) {
				bookmarks.push(bookmark)
			}

			//Update the array
			for(let i = 0; i < bookmarks.length; i++) {
				if(bookmarks[i].uuid == uuid) {
					bookmarks[i] = this.sessions[index]
					break
				}
			}

			//Set store to be the updated array
			store.set("bookmarks", bookmarks)
		}



		// let bookmark = this.getBookmarkById(uuid);
		// bookmark = json;
		// console.log(this.getBookmarkById(uuid));

		//Set config json file
		//Convert simple array of json object in js to Array<SSHSession>

	}
}