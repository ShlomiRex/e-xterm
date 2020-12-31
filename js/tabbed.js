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

ipcRenderer.on(CHANNEL, (event, task, arg) => {
	if (task == "OpenSession") {
		console.log("tabbed.js got open seesion")

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
				ipcRenderer.send(CHANNEL, arg)
			}
		});
	}
});



/*
tabGroup.addTab({
	title: "Terminal",
	src: "../html/terminal.html",
	visible: true,
	active: true,
	webviewAttributes: {
		preload: path.join(__dirname, './preload.js')
	}
})
*/