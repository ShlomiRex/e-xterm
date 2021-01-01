console.log("tabbed.js executing")
const { ipcRenderer } = require('electron');
const TabGroup = require('electron-tabs')

const path = require('path')
const url = require('url')

const CHANNEL = "Tabs";

let tabGroup = new TabGroup({
	newTab: {
		title: 'New Tab'
	}
});

tabGroup.addTab({
	title: "Empty",
	visible: true,
	active: true
});
module.exports = {
	openTerminal: function (session) {
		tabGroup.addTab({
			title: "Terminal",
			src: "../html/terminal.html",
			visible: true,
			active: true,
			webviewAttributes: {
				preload: path.join(__dirname, './preload.js')
			},
			ready: () => {
				console.log("Tab is ready")
				ipcRenderer.send(CHANNEL, session);
			}
		});
	}
};


console.log("tabbed.js done")