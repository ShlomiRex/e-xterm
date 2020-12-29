console.log("preload: preload.js")

const {
	contextBridge
} = require("electron");

contextBridge.exposeInMainWorld(
	"api", {
	loadscript(filename) {
		require(filename);
	}
}
);