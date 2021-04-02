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
	init(parent: any, fit = false) {
		console.log("Terminal ui init with parent: ", parent);

		//Load addons
		this.xterm.loadAddon(this.fitAddon);
		this.xterm.loadAddon(this.webLinksAddon);
		this.xterm.loadAddon(this.searchAddon);

		//Attach to parent
		this.xterm.open(parent)

		if (fit) {
			//Fit container
			this.fit()
		}
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