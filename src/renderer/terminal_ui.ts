import { Terminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import { WebLinksAddon } from 'xterm-addon-web-links';
import { SearchAddon } from 'xterm-addon-search';

/**
 * Terminal is special case, since it must be initialized in renderer context
 */

export class MyTerminalUI {
	//The terminal Object
	private xterm: Terminal;

	private fitAddon: FitAddon;
	private webLinksAddon: WebLinksAddon;
	private searchAddon: SearchAddon;

	constructor(fontSize: number = 16) {
		this.xterm = new Terminal({
			"cursorBlink": true,
			"fontSize": fontSize
		});

		this.fitAddon = new FitAddon();
		this.webLinksAddon = new WebLinksAddon();
		this.searchAddon = new SearchAddon();
	}

	/**
	 * Initialize this terminal
	 * @param parent 
	 */
	init(parent: HTMLElement) {
		console.log("Terminal ui init with parent: ", parent);

		//Load addons
		this.xterm.loadAddon(this.fitAddon);
		this.xterm.loadAddon(this.webLinksAddon);
		this.xterm.loadAddon(this.searchAddon);

		//Attach to parent
		this.xterm.open(parent);
	}

	/**
	 * Fit the terminal to the parent container
	 */
	fit() {
		console.debug("Fit called")
		this.fitAddon.fit()
	}

	getXTerm() {
		return this.xterm
	}
};

export class BasicTerminal extends Terminal {
	private fitAddon: FitAddon;
	private webLinksAddon: WebLinksAddon;
	private searchAddon: SearchAddon;

	constructor(parent: HTMLElement, rows: number, cols: number) {
		super({
			cursorBlink: true,
			rows: rows,
			cols: cols,
			screenReaderMode: true,
			logLevel: "info"
		});
		this.fitAddon = new FitAddon();
		this.webLinksAddon = new WebLinksAddon();
		this.searchAddon = new SearchAddon();

		//Load addons
		this.loadAddon(this.fitAddon);
		this.loadAddon(this.webLinksAddon);
		this.loadAddon(this.searchAddon);

		//Attach to parent
		this.open(parent);

		this._fit();
	}

	_fit() {
		console.debug(`xterm: rows: ${this.rows}, cols: ${this.cols}`)
		this.fitAddon.fit();
	}
}
