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
	 * Content (parent) of the tab, in UI
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
	 */
	select() {
		this._isSelected = true
		//TODO: Set style of this.content to block
		this.content.setAttribute("style",	"display: block;");
	}

	/**
	 * Call when user deselects this tab, and selects diffirent tab
	 */
	unselect() {
		this._isSelected = true
		//TODO: Set style of this.content to none
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
		
		//TODO: Remove this line, for testing
		tabContent.appendChild(document.createTextNode("Content with tab id: " + String(tab.id)))

		//Add to array
		this.tabs.push(tab)

		//Deselect currently selected tab
		//is exist?
		if(this.tabSelected) {
			console.log("Deselecting tab: ", this.tabSelected)
			this.tabSelected.unselect()
		}

		//Set new selected tab as this
		this.tabSelected = tab
		//Set style to show DOM
		this.tabSelected.select()

		console.log("Tab selected: ", this.tabSelected)

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
	
};

let tabs = new Tabs();

window.addEventListener("DOMContentLoaded", () => {
	var isRenderer = require('is-electron-renderer')
	console.log("preload - isRenderer? : ", isRenderer)

	let DOM_SessionContainer = document.getElementById("SessionsContainer");
	let book = new MyBookmarks(bookmarks, DOM_SessionContainer)

	var el = document.querySelector('.chrome-tabs');
	el.addEventListener("activeTabChange", (event: CustomEvent) => {
		let tab: any =  event.detail.tabEl
		console.log('Active tab changed', tab)
	});
	/*
	el.addEventListener('activeTabChange', ({ detail: any }) => {
		console.log('Active tab changed', detail.tabEl.id)
	})
	*/

	chromeTabs.init(el);
	tabs.addDefaultTerminal();
	tabs.addDefaultTerminal();
});

