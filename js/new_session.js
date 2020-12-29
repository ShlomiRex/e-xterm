const electron = require('electron')
const BrowserWindow = electron.remote.BrowserWindow
const path = require('path')
const url = require('url')

document.querySelector('#btn_newSession').addEventListener('click', () => {
	alert("Ok")
	let win = new BrowserWindow({ show: false })
	win.on('close', function () { win = null })
//	win.loadURL("../html/dummy.html")

win.loadURL(url.format({
    pathname: path.join(__dirname, '../html/dummy.html'),
    protocol: 'file',
    slashes: true
  }))

	win.once('ready-to-show', () => {
  		win.show()
	})
})