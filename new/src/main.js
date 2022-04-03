const { app, BrowserWindow } = require("electron")
const path = require('path')

app.whenReady().then(() => {
	const win = new BrowserWindow({
		width: 800,
		height: 600,
		webPreferences: {
			nodeIntegration: true,
			preload: path.join(__dirname, 'preload.js')
		},
	})

	win.loadFile("index.html")
})