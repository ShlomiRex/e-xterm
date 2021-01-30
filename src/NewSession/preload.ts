import { remote, contextBridge, ipcRenderer } from 'electron'
import { MyBookmarks } from '../bookmarks'

console.log("NewSession - preload")

contextBridge.exposeInMainWorld("api", {
	saveSession(session: any) {
		let myBookmarks: MyBookmarks = MyBookmarks.getInstance();
		myBookmarks.newBookmark(session)
	},

	closeWindow() {
		var window = remote.getCurrentWindow();
		window.close();
	}
});