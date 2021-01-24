// All of the Node.js APIs are available in the preload process.
// It has the same sandbox as a Chrome extension.

import { Terminal } from 'xterm';
import * as ChromeTabs from 'chrome-tabs';

window.addEventListener("DOMContentLoaded", () => {
	var isRenderer = require('is-electron-renderer')
	console.log("preload - isRenderer? : ", isRenderer)

	//TODO: Populate bookmarks panel


	//TODO: Create chrome tab
	var el = document.querySelector('.chrome-tabs');
	const tabs_content = document.getElementById("tabs-content");
	var tabId = 0; // Last id. When new tab, ++. 
	var selectedTabId = null
	var tabs = []

	var chromeTabs = new ChromeTabs();
	chromeTabs.init(el);


	const terminal = new Terminal();
	//const ui = document.getElementById("terminal");
	//terminal.open(ui);
});

