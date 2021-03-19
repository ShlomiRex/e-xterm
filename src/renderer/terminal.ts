import * as pty from 'node-pty';
import * as os from 'os';
import * as fs from "fs"
import * as net from 'net';
import * as ssh2 from 'ssh2';
import * as wslpty from 'wslpty';

import { EventEmitter } from 'events';

import { SSHSession } from '../shared/session';
import { MyTerminalUI } from "./terminal_ui"


const WINDOWS = os.platform() === 'win32';
const MAC = os.platform() == "darwin";

console.info("Platform:", os.platform())

enum Shell {
	CMD = "COMSPEC",
	BASH = "bash",
	POWERSHELL = "powershell",
	ZSH = "zsh",
	WSL = "wsl"
}

export class MyTerminal {
	private uiTerm: MyTerminalUI;

	constructor() {
		this.uiTerm = new MyTerminalUI()
	}

	init_shell(terminalContainer: HTMLElement) {
		this.uiTerm.init(terminalContainer)

		//Initialize node-pty with an appropriate shell
		let shell;
		if (WINDOWS) {
			shell = Shell.POWERSHELL
		} else if (MAC) {
			shell = Shell.ZSH
		} else {
			shell = Shell.BASH
		}

		const ptyProcess = pty.spawn(shell, [], {
			name: 'xterm-color',
			cwd: process.cwd(),
			env: process.env
		});

		ptyProcess.onData((data: any) => {
			this.uiTerm.getXTerm().write(data);
		});

		//When user types(input), write to node-pty
		this.uiTerm.getXTerm().onData((data: any) => {
			ptyProcess.write(data)
		})



	}

	init_ssh(terminalContainer: HTMLElement, sshSession: SSHSession, pass: string, eventEmitter: EventEmitter) {
		this.uiTerm.init(terminalContainer)

		var Client = ssh2.Client
		var conn = new Client();

		let myStream: ssh2.ClientChannel = undefined;

		this.uiTerm.getXTerm().onKey((arg: any) => {
			console.debug("Writing to stream: ", arg.key)
			myStream.write(arg.key);
		});


		//We need to write to function because if we write this.write() it calls the internal function inside ssh2 and not our function
		let write_to_terminal = (data: string) => {
			//this.keyPressed(data)
			this.uiTerm.getXTerm().write(data);
		}


		conn.on('ready', function () {

			//SSH auth was success!
			eventEmitter.emit("ready");
			eventEmitter.removeAllListeners("error");

			conn.shell(function (err: Error, stream: ssh2.ClientChannel) {
				if (err) {
					console.error("Error when trying to open shell")
					throw err;
				}

				myStream = stream

				stream.on('close', function () {
					console.log('Stream :: close');
					conn.end();
				})

				stream.on('data', function (data: string) {
					//console.log('OUTPUT: ' + data);

					write_to_terminal(data)
				});
			});

			conn.exec('xeyes', { x11: true }, function (err, stream) {
				if (err) throw err;
				var code = 0;
				stream.on('end', function () {
					if (code !== 0)
						console.log('Do you have X11 forwarding enabled on your SSH server?');
					conn.end();
				}).on('exit', function (exitcode) {
					code = exitcode;
				});
			});


		});

		if (sshSession.private_key) {
			let privateKeyFS = fs.readFileSync(sshSession.private_key_path)
			//Connect with private key and passphrase
			conn.connect({
				host: sshSession.remote_host,
				port: sshSession.port,
				username: sshSession.username,
				compress: sshSession.compression,
				privateKey: privateKeyFS,
				passphrase: pass
			});
		} else {
			//Connect with password
			conn.connect({
				host: sshSession.remote_host,
				port: sshSession.port,
				username: sshSession.username,
				password: pass,
				compress: sshSession.compression
			});
		}

		conn.once("error", (ev: Error & ssh2.ClientErrorExtensions) => {
			eventEmitter.emit("error", ev);
		});

		conn.once("greeting", (greetings: string) => {
			console.log("Greeting!", greetings)
			eventEmitter.emit("greeting", greetings);
		});

		conn.once("banner", (message: string) => {
			eventEmitter.emit("banner", message);
		});

		conn.once("close", (hadError: boolean) => {
			eventEmitter.emit("close", hadError);
		})

		conn.on('x11', function (info, accept, reject) {
			console.log("X11 CALLED @@@@@@@@@@@@")
			var xserversock = new net.Socket();
			xserversock.on('connect', function () {
				var xclientsock = accept();
				xclientsock.pipe(xserversock).pipe(xclientsock);
			});
			// connects to localhost:0.0
			xserversock.connect(6000, 'localhost');
		});
	}

	init_wsl(terminalContainer: HTMLElement) {
		this.uiTerm.init(terminalContainer)

		// const ptyProcess = pty.spawn(shell, [], {
		// 	name: 'xterm-color',
		// 	cwd: process.cwd(),
		// 	env: process.env
		// });

		// ptyProcess.onData((data: any) => {
		// 	this.uiTerm.getXTerm().write(data);
		// });

		// //When user types(input), write to node-pty
		// this.uiTerm.getXTerm().onData((data: any) => {
		// 	ptyProcess.write(data)
		// })

		var ptyProcess = wslpty.spawn({
			cwd: process.cwd(),
			env: process.env
		});

		ptyProcess.on("data", (data) => {
			this.uiTerm.getXTerm().write(data);

		})
		this.uiTerm.getXTerm().onData((data: any) => {
			ptyProcess.write(data)
		})


	}

	fit() {
		this.uiTerm.fit()
	}
};

