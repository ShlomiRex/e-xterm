// All of the Node.js APIs are available in the preload process.
// It has the same sandbox as a Chrome extension.

import { Terminal } from 'xterm';
import * as ChromeTabs from 'chrome-tabs';
import { MyBookmarks, SSHSession } from './bookmarks'
import * as Store from 'electron-store';

const store = new Store();
console.log("electron-store path: ", store.path)

//Convert simple array of json object in js to Array<SSHSession>
let bookmarks_json: any = store.get("bookmarks")
let bookmarks = new Array<SSHSession>();
for(let bookmark of bookmarks_json) {
	bookmarks.push(bookmark)
}


window.addEventListener("DOMContentLoaded", () => {
	var isRenderer = require('is-electron-renderer')
	console.log("preload - isRenderer? : ", isRenderer)

	//TODO: Populate bookmarks panel
	let DOM_SessionContainer = document.getElementById("SessionsContainer");
	let book = new MyBookmarks(bookmarks, DOM_SessionContainer)

	//TODO: Create chrome tab
	var el = document.querySelector('.chrome-tabs');
	const tabs_content = document.getElementById("tabs-content");
	var tabId = 0; // Last id. When new tab, ++. 
	var selectedTabId = null
	var tabs = []

	var chromeTabs = new ChromeTabs();
	chromeTabs.init(el);
	chromeTabs.addTab({
		title: 'Terminal',
		favicon: 'resources/terminal.png'
	});


	const terminal = new Terminal();
	//const ui = document.getElementById("terminal");
	//terminal.open(ui);
});

