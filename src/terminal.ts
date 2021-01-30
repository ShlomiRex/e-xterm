import { Terminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import { AttachAddon } from 'xterm-addon-attach';

import * as pty from 'node-pty';
import * as WebSocket from 'websocket';
import * as os from 'os';


export class MyTerminal {
	private xterm: Terminal

	private fitAddon: FitAddon
	private attachAddon: AttachAddon

	private webSocket: WebSocket

	constructor(webSocket: WebSocket) {
		this.webSocket = webSocket

		this.xterm = new Terminal({
			"cursorBlink": true
		});

		this.fitAddon = new FitAddon();
		//this.attachAddon = new AttachAddon(webSocket);

	}

	/**
	 * Initialize this terminal and write string to it
	 * @param parent 
	 * @param writedata 
	 */
	init(parent: HTMLElement, writedata: string) {
		//Load addons
		this.xterm.loadAddon(this.fitAddon);
		//TODO: Enable attach addon
		//this.xterm.loadAddon(this.attachAddon);

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
		//TODO: Enable attach addon
		//this.xterm.loadAddon(this.attachAddon);

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

	fit() {
		this.fitAddon.fit()
	}

	open(element: HTMLDivElement) {
		this.xterm.open(element)
	}

	write(data: string) {
		this.xterm.write(data)
	}
};