import { Terminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';

/**
 * Terminal is special case, since it must be initialized in renderer context
 */

export class MyTerminalUI {
	//The terminal Object
	private xterm: Terminal

	private fitAddon: FitAddon

	constructor(fontSize: number = 18) {
		this.xterm = new Terminal({
			"cursorBlink": true,
			"fontSize": fontSize
		});

		this.fitAddon = new FitAddon();
	}

	/**
	 * Initialize this terminal
	 * @param parent 
	 */
	init(parent: HTMLElement) {
		//Load addons
		this.xterm.loadAddon(this.fitAddon);

		//Attach to parent
		this.xterm.open(parent)

		//Fit container
		this.fit()
	}

    /**
     * Fit the terminal to the parent container
     */
	fit() {
		this.fitAddon.fit()
	}

    getXTerm() {
        return this.xterm
    }
};