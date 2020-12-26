const TabGroup = require('electron-tabs') //normally but for demo :
//const TabGroup = require("./js/tabbed");

let tabGroup = new TabGroup({
	newTab: {
		title: 'New Tab'
	}
});

tabGroup.addTab({
	title: 'Google',
	src: 'http://google.com',
});

tabGroup.addTab({
	title: "Electron",
	src: "http://electron.atom.io",
	visible: true,
	active: true
});