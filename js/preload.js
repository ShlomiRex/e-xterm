console.log("preload.js exetuing")

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

console.log("preload.js done")