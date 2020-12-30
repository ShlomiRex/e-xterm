const { ipcRenderer } = require('electron');
const TabGroup = require('electron-tabs') 

const path = require('path')
const url = require('url')

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

ipcRenderer.on("OpenSession", (event, args) => {
	console.log("tabbed.js got open seesion " + args)

	tabGroup.addTab({
		title: "Terminal",
		src: "../html/terminal.html",
		visible: true,
		active: true,
		webviewAttributes: {
			preload: path.join(__dirname, './preload.js')
		}
	})
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