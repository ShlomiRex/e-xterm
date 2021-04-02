import { Terminal } from 'xterm';

// Addons
import { FitAddon } from 'xterm-addon-fit';
import { WebLinksAddon } from 'xterm-addon-web-links';
import { SearchAddon } from 'xterm-addon-search';
import { LigaturesAddon } from 'xterm-addon-ligatures';
import { Unicode11Addon } from 'xterm-addon-unicode11';
import { WebglAddon } from 'xterm-addon-webgl';



export class BasicTerminal extends Terminal {
	private fitAddon: FitAddon;
	private webLinksAddon: WebLinksAddon;
	private searchAddon: SearchAddon;
	private ligaturesAddon: LigaturesAddon;
	private unicode11Addon: Unicode11Addon;
	private webglAddon: WebglAddon;

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
		this.ligaturesAddon = new LigaturesAddon();
		this.unicode11Addon = new Unicode11Addon();
		this.webglAddon = new WebglAddon();

		//Attach to parent
		this.open(parent);

		//Load addons
		this.loadAddon(this.fitAddon);
		this.loadAddon(this.webLinksAddon);
		this.loadAddon(this.searchAddon);
		this.loadAddon(this.ligaturesAddon);

		this.loadAddon(this.unicode11Addon);
		this.unicode.activeVersion = '11';

		this.loadAddon(this.webglAddon);

		
		this._fit();
	}

	_fit() {
		console.debug(`xterm: rows: ${this.rows}, cols: ${this.cols}`)
		this.fitAddon.fit();
	}
}
