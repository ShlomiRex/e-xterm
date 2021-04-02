import { TextTerminal } from './text_terminal';
import { EventEmitter } from 'events';
import * as ssh2 from 'ssh2';
import { SSHSession } from '../shared/session';
import * as fs from "fs"


export class SSHTerminal extends TextTerminal {
	constructor(parent: HTMLElement, sshSession: SSHSession, pass: string, eventEmitter: EventEmitter) {
		let rows = 20;
		let cols = 80;
		super(parent, rows, cols);

		
		var Client = ssh2.Client
		var conn = new Client();

		let myChannel: ssh2.ClientChannel = undefined;

		this.onKey((arg: any) => {
			//console.debug("Writing to stream: ", arg.key)
			myChannel.write(arg.key);
		});


		//We need to write to function because if we write this.write() it calls the internal function inside ssh2 and not our function
		let write_to_terminal = (data: string) => {
			//this.keyPressed(data)
			this.write(data);
		}


		conn.on('ready', function () {

			//SSH auth was success!
			eventEmitter.emit("ready");
			eventEmitter.removeAllListeners("error");

			conn.shell(function (err: Error, channel: ssh2.ClientChannel) {
				if (err) {
					console.error("Error when trying to open shell")
					throw err;
				}

				myChannel = channel

				channel.on('close', function () {
					console.log('Stream :: close');
					conn.end();
				})

				channel.on('data', function (data: string) {
					//console.log('OUTPUT: ' + data);
					write_to_terminal(data)
				});
			});

			// conn.sftp((err: Error, sftp: ssh2.SFTPWrapper) => {
			// 	if (err)
			// 		throw err
			// 	sftp.readdir('.', function (err, list) {
			// 		if (err) throw err;
			// 		console.dir("Directories: ", list);
			// 	});
			// })

			// conn.sftp(function (err, sftp) {
			// 	if (err) throw err;
			// 	sftp.readdir('/home', function (err, list) {
			// 		if (err) throw err;
			// 		console.dir(list);
			// 	});
			// });

			// conn.exec('xeyes', { x11: true }, function (err, channel) {
			// 	if (err) throw err;
			// 	var code = 0;
			// 	console.log("inside exec xeyes")
			// 	channel.on('end', function () {
			// 		if (code !== 0)
			// 			console.log('Do you have X11 forwarding enabled on your SSH server?');
			// 		conn.end();
			// 	}).on('exit', function (exitcode) {
			// 		code = exitcode;
			// 	});
			// });


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

		// conn.on('x11', function (info, accept, reject) {
		// 	console.log("X11 CALLED @@@@@@@@@@@@")
		// 	var xserversock = new net.Socket();
		// 	xserversock.on('connect', function () {
		// 		var xclientsock = accept();
		// 		xclientsock.pipe(xserversock).pipe(xclientsock);
		// 	});
		// 	// connects to localhost:0.0
		// 	xserversock.connect(6000, 'localhost');
		// });

	}

	fit() {
		this._fit();
	}
}