console.log("preload: NewSession")

const {
	contextBridge
} = require("electron");

contextBridge.exposeInMainWorld(
	"NewSession", {
	closeWindow() {
		console.log("Closing NewSession window")

		//Get current window
		const remote = require('electron').remote;
		var window = remote.getCurrentWindow();
		window.close()
	}
}
);
