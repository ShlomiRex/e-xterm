// All of the Node.js APIs are available in the preload process.
// It has the same sandbox as a Chrome extension.

import { Terminal } from 'xterm';
import * as ChromeTabs from 'chrome-tabs';
import { MyBookmarks, SSHSession } from './bookmarks'
import * as Store from 'electron-store';
import { lstat } from 'fs';

const store = new Store();
console.log("electron-store path: ", store.path)

var chromeTabs = new ChromeTabs();

//Convert simple array of json object in js to Array<SSHSession>
let bookmarks_json: any = store.get("bookmarks")
let bookmarks = new Array<SSHSession>();
for(let bookmark of bookmarks_json) {
	bookmarks.push(bookmark)
}


class Tab {
	//Last available ID
	private static lastId: number = 0
	readonly id: number = 0

	private _isSelected: boolean
	title: string
	favicon: string

	/**
	 * Content of the tab, in UI
	 */
	content: HTMLElement

	constructor(content: HTMLElement, title: string = "Terminal", favicon: string = "resources/terminal.png") {
		this.id = Tab.lastId;
		Tab.lastId ++;
		this.content = content
		this._isSelected = false
		this.title = title
		this.favicon = favicon
	}

	/**
	 * Call when user selects this tab
	 * This function shows the content of the tab
	 */
	select() {
		this._isSelected = true
		this.content.setAttribute("style",	"display: block;");
	}

	/**
	 * Call when user deselects this tab, and selects diffirent tab
	 * This function hides the content of the tab
	 */
	deselect() {
		this._isSelected = false
		this.content.setAttribute("style",	"display: none;");
	}

	/**
	 * Return if this tab is selected
	 */
	isSelected() {
		return this._isSelected
	}

	/**
	 * Return chrome tab json (chromeTabs.addTab(\<this function result\>))
	 */
	get() {
		return {	
			title: this.title,
			favicon: this.favicon
		}
	}
};

/**
 * Manage the tabs
 */
class Tabs {
	private tabs: Array<Tab>
	private tabSelected: Tab
	private lastAddedTab: Tab

	constructor() {
		this.tabs = new Array<Tab>();
	}

	addDefaultTerminal() {
		let parent = document.getElementById("tabs-content");

		//Create content container
		let tabContent = document.createElement("div")
		parent.appendChild(tabContent)

		let tab = new Tab(tabContent)
		tabContent.id = "content_" + tab.id 
		
		//Add to array
		this.tabs.push(tab)
		this.lastAddedTab = tab

		//Deselect currently selected tab
		if(this.tabSelected) {
			this.tabSelected.deselect()
		}

		//Set new selected tab as this
		this.tabSelected = tab
		this.tabSelected.select()

		//Add to UI
		chromeTabs.addTab(tab.get())	
	
		//Setup terminal
		var DOM_terminal = document.createElement("div")
		DOM_terminal.id = "terminal_" + tab.id
		tabContent.appendChild(DOM_terminal);
		var term = new Terminal({
			"cursorBlink": true
		});
		term.open(DOM_terminal) //Create terminal UI
	}

	selectTab(id: number) {
		//TODO: Problem here
		//TODO: When adding tab, 
		if(id == tabs.getLastAddedTab().id) {
			return
		}
		console.log("Going to select tab: ", id)
		var found = false
		for(var tab of this.tabs) {
			if(tab.id == id) {
				//Deselect current tab
				console.log("Deselecting tab: ", this.tabSelected)
				this.tabSelected.deselect()

				//Select the tab requested
				console.log("Selecting tab: ", tab)
				tab.select()

				//Set new tabSelected
				this.tabSelected = tab
				
				found = true
				break
			}
		}

		if(! found) {
			console.error("Did not find tab with id: ", id, "to select!")
		}
	}

	getLastAddedTab() {
		return this.lastAddedTab
	}
	
};

let tabs = new Tabs();

window.addEventListener("DOMContentLoaded", () => {
	var isRenderer = require('is-electron-renderer')
	console.log("preload - isRenderer? : ", isRenderer)

	let DOM_SessionContainer = document.getElementById("SessionsContainer");
	let book = new MyBookmarks(bookmarks, DOM_SessionContainer)

	var el = document.querySelector('.chrome-tabs');
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

	chromeTabs.init(el);
	tabs.addDefaultTerminal();
	tabs.addDefaultTerminal();
	tabs.addDefaultTerminal();
	tabs.addDefaultTerminal();
});

