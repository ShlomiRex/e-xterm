// All of the Node.js APIs are available in the preload process.
// It has the same sandbox as a Chrome extension.
import { Terminal } from 'xterm';
window.addEventListener("DOMContentLoaded", () => {
	const replaceText = (selector: string, text: string) => {
		const element = document.getElementById(selector);
		if (element) {
			element.innerText = text;
		}
	};

	for (const type of ["chrome", "node", "electron"]) {
		replaceText(`${type}-version`, process.versions[type as keyof NodeJS.ProcessVersions]);
	}

	var isRenderer = require('is-electron-renderer')
	console.log("preload - isRenderer? : ", isRenderer)

	
	const terminal = new Terminal();
	const ui = document.getElementById("terminal");
	terminal.open(ui);
});

