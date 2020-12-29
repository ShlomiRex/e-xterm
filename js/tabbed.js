const TabGroup = require('electron-tabs') //normally but for demo :

const path = require('path')
const url = require('url')

let tabGroup = new TabGroup({
	newTab: {
		title: 'New Tab'
	}
});

tabGroup.addTab({
	title: "Terminal",
	src: "../html/terminal.html",
	visible: true,
	active: true,
	webviewAttributes: {
		preload: path.join(__dirname, './preload.js')
	}
})