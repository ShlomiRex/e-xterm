import { Terminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';

export class MyTerminal {
	private xterm: Terminal
	private fitAddon: FitAddon

	constructor() {
		this.xterm = new Terminal({
			"cursorBlink": true
		});

		this.fitAddon = new FitAddon();
	}

	loadFitAddon() {
		this.xterm.loadAddon(this.fitAddon)
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