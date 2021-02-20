import { Terminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import { AttachAddon } from 'xterm-addon-attach';

import * as pty from 'node-pty';
import * as os from 'os';

import * as ssh2 from 'ssh2';
import { SSHSession } from '../shared/session';
import { EventEmitter } from 'events';


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
		this.xterm.onData((data: any) => ptyProcess.write(data));
		ptyProcess.onData((data: any) => {
			//console.log("Writing:", data)
			this.xterm.write(data);
		});
	}

	init_ssh(parent: HTMLElement, username: string, password: string, hostname: string, port: number, eventEmitter: EventEmitter) {
		//Load addons
		this.xterm.loadAddon(this.fitAddon);

		//Attach to parent
		this.xterm.open(parent)

		//Fit container
		this.fitAddon.fit()


		var Client = ssh2.Client
		var conn = new Client();

		let myStream: ssh2.ClientChannel = undefined;

		this.xterm.onKey((arg: any) => {
			console.log("Writing to stream: ", arg.key)
			myStream.write(arg.key);
		});
		

		//We need to write to function because if we write this.write() it calls the internal function inside ssh2 and not our function
		let write_to_terminal = (data: string) => {
			//this.keyPressed(data)
			this.xterm.write(data);
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
		});
		
		
		conn.connect({
			host: hostname,
			port: port,
			username: username,
			password: password
		});

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

	}

	fit() {
		this.fitAddon.fit()
	}
};