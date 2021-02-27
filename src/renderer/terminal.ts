import { Terminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import { AttachAddon } from 'xterm-addon-attach';

import * as pty from 'node-pty';
import * as os from 'os';

import * as ssh2 from 'ssh2';
import { SSHSession } from '../shared/session';
import { EventEmitter } from 'events';

import * as net from 'net';

/**
 * Terminal is special case, since it must be initialized in renderer context
 */

export class MyTerminal {
	//The terminal Object (UI and API)
	private xterm: Terminal

	private fitAddon: FitAddon

	constructor() {
		this.xterm = new Terminal({
			"cursorBlink": true,
			"fontSize": 18
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
		console.debug("Platform:", os.platform())
		const shell = process.env[WINDOWS ? 'COMSPEC' : 'SHELL'];
		//Better:
		//const shell = os.platform() == "win32" ? "powershell.exe" : "bash"

		const ptyProcess = pty.spawn(shell, [], {
			name: 'xterm-color',
			cwd: process.cwd(),
			env: process.env
		});
		this.xterm.onData((data: any) => ptyProcess.write(data));
		ptyProcess.onData((data: any) => {
			//console.log("Writing:", data)
			this.xterm.write(data);
		});
	}

	/**
	 * 
	 * @param parent UI element to setup the xterm ui.
	 * @param sshSession 
	 * @param pass Can be password for SSH or passphrase for private key.
	 * @param eventEmitter 
	 */
	init_ssh(parent: HTMLElement, sshSession: SSHSession, pass: string, eventEmitter: EventEmitter) {
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
			console.debug("Writing to stream: ", arg.key)
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

			conn.exec('xeyes', { x11: true }, function(err, stream) {
				if (err) throw err;
				var code = 0;
				stream.on('end', function() {
				  if (code !== 0)
					console.log('Do you have X11 forwarding enabled on your SSH server?');
				  conn.end();
				}).on('exit', function(exitcode) {
				  code = exitcode;
				});
			});


		});
		
		if(sshSession.private_key) {
			let privateKeyFS = require('fs').readFileSync(sshSession.private_key_path)
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

		conn.on('x11', function(info, accept, reject) {
			console.log("X11 CALLED @@@@@@@@@@@@")
			var xserversock = new net.Socket();
			xserversock.on('connect', function() {
			  var xclientsock = accept();
			  xclientsock.pipe(xserversock).pipe(xclientsock);
			});
			// connects to localhost:0.0
			xserversock.connect(6000, 'localhost');
		  });

	}

	fit() {
		this.fitAddon.fit()
	}
};