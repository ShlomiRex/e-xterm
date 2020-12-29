console.log("preload: NewSession")

const {
	contextBridge
} = require("electron");

contextBridge.exposeInMainWorld(
	"NewSession", {
	OK(json) {
		console.log("Got OK from NewSession:", json)
	},
	CANCEL() {
		console.log("Got CANCEL from NewSession")
	}
}
);