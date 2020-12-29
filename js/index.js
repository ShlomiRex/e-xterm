const electron = require('electron')
const BrowserWindow = electron.remote.BrowserWindow
const path = require('path')
const url = require('url')
const remote = require ("electron").remote;



document.querySelector('#btn_newSession').addEventListener('click', () => {
	const mainWindow = remote.getCurrentWindow ();

	let child = new BrowserWindow({
		parent: mainWindow, 
		modal: true, 
		show: false,
		title: "Session settings"
	})
	child.setMenu(null)
	child.loadURL(url.format({
		pathname: path.join(__dirname, '../html/new_session.html'),
		protocol: 'file',
		slashes: true
	}))
	child.once('ready-to-show', () => {
		child.show()
	})
	child.on('close', function () { child = null })
})