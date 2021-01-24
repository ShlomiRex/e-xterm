import { Terminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';

import * as ChromeTabs from 'chrome-tabs';
import { MyTerminal } from './terminal'

var chromeTabs = new ChromeTabs();

class TabContent {
	private myTerminal: MyTerminal
	private content: HTMLElement
	
	constructor(content: HTMLElement) {
		this.content = content
		this.myTerminal = new MyTerminal()
	}

	showContent() {
		this.content.style.display = "block"
	}

	hideContent() {
		this.content.style.display = "none"
	}

	fitTerminal() {
		this.myTerminal.fit()
	}
};

class Tab {
	//Last available ID
	private static lastId: number = 0
	readonly id: number = 0

	private _isSelected: boolean
	title: string
	favicon: string

	private tabContent: TabContent

	constructor(content: HTMLElement, title: string = "Terminal", favicon: string = "resources/terminal.png") {
		this.id = Tab.lastId;
		Tab.lastId++;

		this.tabContent = new TabContent(content)


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
		this.tabContent.showContent()
		this.fitTerminal()
	}

	/**
	 * Call when user deselects this tab, and selects diffirent tab
	 * This function hides the content of the tab
	 */
	deselect() {
		this._isSelected = false
		this.tabContent.hideContent()
	}

	/**
	 * Return if this tab is selected
	 */
	isSelected() {
		return this._isSelected
	}

	fitTerminal() {
		this.tabContent.fitTerminal()
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
 * Manage the tabs. Singleton
 */
export class Tabs {
	private tabs: Array<Tab>
	private tabSelected: Tab
	private lastAddedTab: Tab

	private static instance: Tabs;

	private constructor() {
		this.tabs = new Array<Tab>();
	}

	static getInstance(): Tabs {
		if (!Tabs.instance) {
			Tabs.instance = new Tabs();
		}

		return Tabs.instance;
	}

	/**
	 * Init Chrome Tabs UI
	 */
	init() {
		var el: Element = document.querySelector('.chrome-tabs');
		el.addEventListener("activeTabChange", (event: CustomEvent) => {
			let tabId: any = event.detail.tabEl["data-id"]
			console.debug('Active tab changed to: ', tabId, event)
			this.selectTab(tabId)
		});
	
		el.addEventListener('tabAdd', (event: CustomEvent) => {
			console.debug("Tab added", event.detail.tabEl)
			let lastAddedTab = this.getLastAddedTab()
			let id = lastAddedTab.id
			//Set newly added tab attribute "data-id" to be last added tab's id
			event.detail.tabEl["data-id"] = id
		});
	
		el.addEventListener("tabRemove", (event: CustomEvent) => {
			console.debug("Tab remove: ", event.detail.tabEl)
		});

		chromeTabs.init(el)
	}

	addDefaultTerminal() {
		let parent = document.getElementById("tabs-content");

		//Create content container
		let tabContent = document.createElement("div")
		tabContent.style.width = "100%"
		tabContent.style.height = "100%"
		console.debug(tabContent);
		parent.appendChild(tabContent)

		

		const myTerminal = new MyTerminal()
		let tab = new Tab(tabContent)
		tabContent.id = "content_" + tab.id

		//Add to array
		this.tabs.push(tab)
		this.lastAddedTab = tab

		//Deselect currently selected tab
		if (this.tabSelected) {
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
		DOM_terminal.style.width = "100%"
		DOM_terminal.style.height = "100%"
		tabContent.appendChild(DOM_terminal);

		
		myTerminal.loadFitAddon()
		myTerminal.open(DOM_terminal)
		myTerminal.write("Terminal with tab id: " + String(tab.id))
		myTerminal.fit()
	}

	/**
	 * Called when user selects (if not selected already) tab
	 * @param id 
	 */
	selectTab(id: number) {
		console.debug("Going to select tab: ", id)
		var found = false
		for (var tab of this.tabs) {
			if (tab.id == id) {
				//Deselect current tab
				console.debug("Deselecting tab: ", this.tabSelected)
				this.tabSelected.deselect()

				//Select the tab requested
				console.debug("Selecting tab: ", tab)
				tab.select()

				//Set new tabSelected
				this.tabSelected = tab

				found = true
				break
			}
		}

		if (!found) {
			//This is critical, problem with tab managment
			console.error("Did not find tab with id: ", id, "to select!")
		}
	}

	getLastAddedTab() {
		return this.lastAddedTab
	}

	fit_terminal() {
		//Fit terminal again (xterm-addon-fit)

		console.debug("fit")
		this.tabSelected.fitTerminal()
	}

};
