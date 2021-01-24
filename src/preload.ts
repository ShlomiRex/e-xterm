// All of the Node.js APIs are available in the preload process.
// It has the same sandbox as a Chrome extension.

import * as Store from 'electron-store';

import { MyBookmarks, SSHSession } from './bookmarks'
import { Tabs } from "./tabs"
import * as Split from 'split.js'


const store = new Store();
console.log("electron-store path: ", store.path)


//Convert simple array of json object in js to Array<SSHSession>
let bookmarks_json: any = store.get("bookmarks")
let bookmarks = new Array<SSHSession>();
for(let bookmark of bookmarks_json) {
	bookmarks.push(bookmark)
}




let tabs = Tabs.getInstance();

window.addEventListener("DOMContentLoaded", () => {
	var isRenderer = require('is-electron-renderer')
	console.log("preload - isRenderer? : ", isRenderer)

	let DOM_SessionContainer = document.getElementById("SessionsContainer");
	let book = new MyBookmarks(bookmarks, DOM_SessionContainer)

	var el: Element = document.querySelector('.chrome-tabs');
	el.addEventListener("activeTabChange", (event: CustomEvent) => {
		let tabId: any = event.detail.tabEl["data-id"]
		console.log('Active tab changed to: ', tabId, event)
		tabs.selectTab(tabId)
	});

	el.addEventListener('tabAdd', (event: CustomEvent) => {
		console.log("Tab added", event.detail.tabEl)
		let lastAddedTab = tabs.getLastAddedTab()
		let id = lastAddedTab.id
		//Set newly added tab attribute "data-id" to be last added tab's id
		event.detail.tabEl["data-id"] = id
	});

	el.addEventListener("tabRemove", (event: CustomEvent) => {
		console.log("Tab remove: ", event.detail.tabEl)
	});

	tabs.init(el);
	tabs.addDefaultTerminal();
	tabs.addDefaultTerminal();
	tabs.addDefaultTerminal();


	//Setup split.js
	Split(['#left-panel', '#main-panel'],
		{
			sizes: [20, 80],
			gutterSize: 5,

		}
	);
});

