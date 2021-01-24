import { Terminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import { AttachAddon } from 'xterm-addon-attach';

import * as WebSocket from 'websocket';


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

	init(parent: HTMLElement, writedata: string) {
		//Load addons
		this.xterm.loadAddon(this.fitAddon);
		//TODO: Enable attach addon
		//this.xterm.loadAddon(this.attachAddon);

		//Attach to parent
		this.xterm.open(parent)

		//Write stuff
		this.xterm.write(writedata)

		//fit
		this.fitAddon.fit()
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