import * as ChromeTabs from 'chrome-tabs';
import { SSHSession } from './session';
import { MyTerminal } from './terminal'

var chromeTabs = new ChromeTabs();

class TabContent {
	private parent: HTMLElement
	private myTerminal: MyTerminal

	/**
	 * 
	 * @param parent Div element with id="content_<id>"
	 */
	constructor(parent: HTMLElement) {
		this.parent = parent
		//
		//const webSocket = new WebSocket()

		this.myTerminal = new MyTerminal()
	}

	/**
	 * 
	 * @param parent Div element with id="terminal_<id>"
	 * @param writedata Write this string to the terminal
	 */
	init(parent: HTMLElement, writedata: string) {
		this.myTerminal.init(parent, writedata)
	}

	/**
	 * 
	 * @param parent Div element with id="terminal_<id>"
	 */
	init_shell(parent: HTMLElement) {
		this.myTerminal.init_shell(parent)
	}

	/**
	 * 
	 * @param parent Div element with id="terminal_<id>"
	 */
	init_ssh(parent: HTMLElement, username: string, password: string, hostname: string, port: number, eventEmitter: any) {
		this.myTerminal.init_ssh(parent, username, password, hostname, port, eventEmitter);
	}

	showContent() {
		this.parent.style.display = "block"
	}

	hideContent() {
		this.parent.style.display = "none"
	}

	fitTerminal() {
		this.myTerminal.fit()
	}
};

export class Tab {
	//Last available ID
	private static lastId: number = 0
	readonly id: number = 0

	private _isSelected: boolean
	title: string
	favicon: string

	chromeTabElement: Element
	tabContent: TabContent

	constructor(content: HTMLElement, title: string = "Terminal", favicon: string = "../resources/terminal.png") {
		this.id = Tab.lastId;
		Tab.lastId++;

		this.tabContent = new TabContent(content)


		this._isSelected = false
		this.title = title
		this.favicon = favicon
	}

	setChromeTabElement(chromeTabElement: Element) {
		this.chromeTabElement = chromeTabElement;
	}

	/**
	 * Call when user selects this tab
	 * This function shows the content of the tab
	 */
	select() {
		this._isSelected = true
		this.tabContent.showContent()
		this.tabContent.fitTerminal()
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

	initTextTerminalUI(parent: HTMLElement, writedata: string) {
		//1. Load addons
		//2. Open div element
		//3. Write to terminal stuff
		//4. Fit terminal
		this.tabContent.init(parent, writedata)
	}

	initShellTerminalUI(parent: HTMLElement) {
		//1. Load addons
		//2. Open div element
		//3. Write to terminal stuff
		//4. Fit terminal
		this.tabContent.init_shell(parent)
	}

	initSSHTerminalUI(parent: HTMLElement, username: string, password: string, hostname: string, port: number, eventEmitter: any) {
		//1. Load addons
		//2. Open div element
		//3. Write to terminal stuff
		//4. Fit terminal
		this.tabContent.init_ssh(parent, username, password, hostname, port, eventEmitter)
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
 * Manage the tabs. Singleton. Must be created in renderer context, like preload or renderer.
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
		return Tabs.instance;
	}

	static createInstance() {
		if (!Tabs.instance) {
			Tabs.instance = new Tabs();
		}
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

	addTextTerminal() {
		let { tab, DOM_terminal } = this.addTerminal("Text", null);
		tab.initTextTerminalUI(DOM_terminal, "Terminal with tab id: " + String(tab.id));
	}

	addShellTerminal() {
		let { tab, DOM_terminal } = this.addTerminal("Terminal", "../resources/terminal.png");
		tab.initShellTerminalUI(DOM_terminal);
	}

	/**
	 * Return the tab
	 */
	addSSHTerminal(username: string, password: string, hostname: string, port:number, eventEmitter: any, title: string = "SSH"): Tab {
		let { tab, DOM_terminal } = this.addTerminal(title, "../resources/ssh.png");
		tab.initSSHTerminalUI(DOM_terminal, username, password, hostname, port, eventEmitter);
		return tab
	}

	private addTerminal(tabTitle: string, favicon: string) {
		let parent = document.getElementById("tabs-content");

		//Create content container
		let tabContent = document.createElement("div")
		tabContent.style.width = "100%"
		tabContent.style.height = "100%"
		parent.appendChild(tabContent)


		let tab = new Tab(tabContent)
		tabContent.id = "content_" + tab.id
		tab.title = tabTitle
		tab.favicon = favicon

		//Add to array
		this.tabs.push(tab)
		this.lastAddedTab = tab

		//Deselect currently selected tab
		if (this.tabSelected) {
			this.tabSelected.deselect()
		}

		//Set selected tab to this
		this.tabSelected = tab
		this.tabSelected.select()

		//Actually create UI tab
		chromeTabs.addTab(tab.get())

		//Get the tab created (element)
		let activeTab = document.querySelector("div.chrome-tab[active]");
		//Set
		tab.setChromeTabElement(activeTab);

		//Setup terminal
		var DOM_terminal = document.createElement("div")
		DOM_terminal.id = "terminal_" + tab.id
		DOM_terminal.style.width = "100%"
		DOM_terminal.style.height = "100%"
		tabContent.appendChild(DOM_terminal);

		return {
			tab: tab,
			DOM_terminal: DOM_terminal
		}
	}

	getTabById(id: number): Tab {
		for (var tab of this.tabs) {
			if (tab.id == id) {
				return tab;
			}
		}
		return null
	}

	/**
	 * Called when user selects (if not selected already) tab
	 * @param id 
	 */
	selectTab(id: number) {
		console.debug("Going to select tab: ", id)

		let tab = this.getTabById(id);
		if (tab) {
			//Deselect current tab
			console.debug("Deselecting tab: ", this.tabSelected)
			this.tabSelected.deselect()

			//Select the tab requested
			console.debug("Selecting tab: ", tab)
			tab.select()

			//Set new tabSelected
			this.tabSelected = tab
		} else {
			console.error("Did not find tab with id: ", id, "to select!")
		}
	}

	getLastAddedTab() {
		return this.lastAddedTab
	}

	fit_terminal() {
		//Fit terminal again (xterm-addon-fit)

		console.debug("fit")
		this.tabSelected.tabContent.fitTerminal()
	}

	/**
	 * Remove tab by given ID
	 * @param id 
	 */
	removeTab(id: number) {
		let tab = this.getTabById(id);
		chromeTabs.removeTab(tab.chromeTabElement);
	}

};
