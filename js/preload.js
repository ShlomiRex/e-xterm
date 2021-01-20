console.log("preload.js exetuing")

const { contextBridge } = require("electron");
var Client = require('ssh2').Client;

contextBridge.exposeInMainWorld(
	"api", {
	loadscript(filename) {
		require(filename);
	},

	test() {
		console.log("test")
	},

	startSSH(terminal) {
		var conn = new Client();
		conn.on('ready', function () {
			console.log('Client :: ready');
			conn.exec('uptime', function (err, stream) {
				if (err) throw err;
				stream.on('close', function (code, signal) {
					console.log('Stream :: close :: code: ' + code + ', signal: ' + signal);
					conn.end();
				}).on('data', function (data) {
					console.log('STDOUT: ' + data);
				}).stderr.on('data', function (data) {
					console.log('STDERR: ' + data);
				});
			});
		}).connect({
			host: '127.0.0.1',
			port: 22,
			username: 'test',
			password: "test"
		});
	}
}
);

/*
// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld(
	"api", {
		send: (channel, data) => {
			// whitelist channels
			let validChannels = ["toMain"];
			if (validChannels.includes(channel)) {
				ipcRenderer.send(channel, data);
			}
		},
		receive: (channel, func) => {
			let validChannels = ["fromMain"];
			if (validChannels.includes(channel)) {
				// Deliberately strip event as it includes `sender` 
				ipcRenderer.on(channel, (event, ...args) => func(...args));
			}
		}
	}
);
*/


console.log("preload.js done")