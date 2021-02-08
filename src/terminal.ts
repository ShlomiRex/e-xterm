import { Terminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import { AttachAddon } from 'xterm-addon-attach';

import * as pty from 'node-pty';
import * as WebSocket from 'websocket';
import * as os from 'os';

import * as ssh2 from 'ssh2';
import { SSHSession } from './session';


export class MyTerminal {
	//The terminal Object (UI and API)
	private xterm: Terminal

	private fitAddon: FitAddon

	constructor() {
		this.xterm = new Terminal({
			"cursorBlink": true
		});

		this.fitAddon = new FitAddon();
	}

	/**
	 * Initialize this terminal and write string to it
	 * @param parent 
	 * @param writedata 
	 */
	init(parent: HTMLElement, writedata: string) {
		//Load addons
		this.xterm.loadAddon(this.fitAddon);

		//Attach to parent
		this.xterm.open(parent)

		//Write stuff
		this.xterm.write(writedata)

		//Fit container
		this.fitAddon.fit()
	}

	/**
	 * Initialize this terminal and connect to OS shell (Windows CMD / Linux bash)
	 * @param parent 
	 */
	init_shell(parent: HTMLElement) {
		//Load addons
		this.xterm.loadAddon(this.fitAddon);

		//Attach to parent
		this.xterm.open(parent)

		//Fit container
		this.fitAddon.fit()

		//Initialize node-pty with an appropriate shell
		const WINDOWS = os.platform() === 'win32';
		console.log("Platform:", os.platform())
		const shell = process.env[WINDOWS ? 'COMSPEC' : 'SHELL'];
		const ptyProcess = pty.spawn(shell, [], {
			name: 'xterm-color',
			cols: 100,
			rows: 50,
			cwd: process.cwd(),
			env: process.env
		});
		this.xterm.onData(data => ptyProcess.write(data));
		ptyProcess.onData((data) => {
			//console.log("Writing:", data)
			this.xterm.write(data);
		});
	}

	init_ssh(parent: HTMLElement, session: SSHSession, password: string) {
		//Load addons
		this.xterm.loadAddon(this.fitAddon);

		//Attach to parent
		this.xterm.open(parent)

		//Fit container
		this.fitAddon.fit()


		var Client = ssh2.Client
		var conn = new Client();

		let myStream: ssh2.ClientChannel = undefined;

		this.xterm.onKey((arg) => {
			console.log("Writing to stream: ", arg.key)
			myStream.write(arg.key);
		});
		

		//We need to write to function because if we write this.write() it calls the internal function inside ssh2 and not our function
		let write_to_terminal = (data: string) => {
			//this.keyPressed(data)
			this.xterm.write(data);
		}

		let port = session.port;
		let hostname = session.remote_host;
		let username = session.username;


		conn.on('ready', function () {
			conn.shell(function (err: Error, stream: ssh2.ClientChannel) {
				if (err) throw err;

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
		});
		
		
		conn.connect({
			host: hostname,
			port: port,
			username: username,
			password: password
		});


	}

	fit() {
		this.fitAddon.fit()
	}

	open(element: HTMLDivElement) {
		this.xterm.open(element)
	}

	/**
	 * Process a key press and if it's good then display the key on terminal
	 * @param arg KeyboardEvent or String or Buffer
	 */

	// keyPressed(arg: any) {
	// 	if (arg instanceof KeyboardEvent) {
	// 		let kbe = arg as KeyboardEvent
	// 		let alt = kbe.altKey
	// 		let ctrl = kbe.ctrlKey
	// 		let shift = kbe.shiftKey

	// 		if (!alt && !ctrl && !shift) {
	// 			console.log("Key: ", kbe)
	// 			let key = kbe.key
	// 			//let keyCode = kbe.keyCode //deprecated
	// 			var toWrite = undefined
	// 			switch (key) {
	// 				case "Backspace":
	// 					toWrite = "\b \b"
	// 					break
	// 				case "Home":
	// 					toWrite = "\r"
	// 					break
	// 				case "End":
	// 					break
	// 				case "ArrowRight":
	// 					toWrite = "\x9B\x01C"
	// 					break
	// 				case "ArrowLeft":
	// 					toWrite = "\b"
	// 					break
	// 				case "ArrowUp":
	// 					break
	// 				case "ArrowDown":
	// 					break
	// 				case "Enter":
	// 					toWrite = "\r\n"
	// 					break
	// 				default:
	// 					toWrite = key
	// 					break
	// 			}
	// 			this.writeToTerminal(toWrite)
	// 		}
	// 	} else if (arg instanceof String) {
	// 		let data = arg as string
	// 		this.writeToTerminal(data)
	// 	} else if (arg instanceof Buffer) {
	// 		this.writeToTerminal(arg)
	// 	} else {
	// 		console.error("Error processing: ", arg)
	// 	}

	// }

	private writeToTerminal(key: any) {
		this.xterm.write(key)
		this.writeBuffer.push(key)

		console.log("Buffer:", this.writeBuffer)
	}
};