import { Terminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import { AttachAddon } from 'xterm-addon-attach';

import * as pty from 'node-pty';
import * as WebSocket from 'websocket';
import * as os from 'os';

import * as ssh2 from 'ssh2';


export class MyTerminal {
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
			this.xterm.write(data);
		});
	}

	init_ssh(parent: HTMLElement) {
		//Load addons
		this.xterm.loadAddon(this.fitAddon);

		//Attach to parent
		this.xterm.open(parent)

		//Fit container
		this.fitAddon.fit()


		var Client = ssh2.Client
		var conn = new Client();

		this.xterm.onKey((arg) => {
			let domEvent = arg.domEvent
			this.write(domEvent)
		});

		//We need to write to function because if we write this.write() it calls the internal function inside ssh2 and not our function
		let write_to_terminal = (data: string) => {
			this.write(data)
		}

		conn.on('ready', function () {
			conn.shell(function (err: Error, stream: ssh2.ClientChannel) {
				if (err) throw err;
				stream.on('close', function () {
					console.log('Stream :: close');
					conn.end();
				}).on('data', function (data: string) {
					console.log('OUTPUT: ' + data);
					
					write_to_terminal(data)
				});
				// stream.end('ls -l\n');
				// stream.end('ls -l\n');
			});
		}).connect({
			host: '127.0.0.1',
			port: 22,
			username: 'test',
			password: "test"
		});

		
	}

	fit() {
		this.fitAddon.fit()
	}

	open(element: HTMLDivElement) {
		this.xterm.open(element)
	}

	write(arg: any) {
		if(arg instanceof KeyboardEvent) {
			let kbe = arg as KeyboardEvent
			let alt = kbe.altKey
			let ctrl = kbe.ctrlKey
			let shift = kbe.shiftKey

			if(! alt && ! ctrl && ! shift) {
				console.log("Key: ", kbe)
				let key = kbe.key
				//let keyCode = kbe.keyCode //deprecated
				if(key == "Backspace") {
					this.xterm.write('\b \b')
				} else {
					this.xterm.write(key)
				}
			}
		} else if(arg instanceof String) {
			let data = arg as string
			this.xterm.write(data)
		} else if(arg instanceof Buffer) {
			this.xterm.write(arg)

		} else {
			console.error("Error processing: ", arg)
		}

	}
};