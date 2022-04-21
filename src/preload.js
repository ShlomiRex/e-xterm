console.log("preload.js")

const { ipcRenderer } = require("electron");
// All of the Node.js APIs are available in the preload process.
// It has the same sandbox as a Chrome extension.
window.addEventListener("DOMContentLoaded", () => {
	console.log("DOMContentLoaded");

	document.getElementById("btn1").addEventListener("click", () => {
		ipcRenderer.send("btn1");
	});
});
