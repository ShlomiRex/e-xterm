console.log("preload: NewSession")

const {
	contextBridge,
	ipcRenderer
} = require("electron");

contextBridge.exposeInMainWorld(
	"NewSession", {
	closeWindow() {
		console.log("Closing NewSession window")

		//Get current window
		const remote = require('electron').remote;
		var window = remote.getCurrentWindow();
		window.close()
	},

	saveSession(json) {
		//Save session to local disk from given json

		ipcRenderer.send('SaveSession', json);
	}
}
);
