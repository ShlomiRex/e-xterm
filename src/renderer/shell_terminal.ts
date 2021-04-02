import * as pty from 'node-pty';
import * as os from 'os';

import { TextTerminal } from './text_terminal';
import { Shell } from '../shared/shell'


const WINDOWS = os.platform() === 'win32';
const MAC = os.platform() == "darwin";

console.info("Platform:", os.platform())



export class ShellTerminal extends TextTerminal {
	private ptyProcess: pty.IPty;

	constructor(parent: HTMLElement) {
		let rows = 20;
		let cols = 80;
		super(parent, rows, cols);

		//Initialize node-pty with an appropriate shell
		let shell;
		if (WINDOWS) {
			shell = Shell.POWERSHELL
		} else if (MAC) {
			shell = Shell.ZSH
		} else {
			shell = Shell.BASH
		}

		this.ptyProcess = pty.spawn(shell, [], {
			name: 'xterm-color',
			cwd: process.cwd(),
			env: process.env,
			rows: this.rows,
			cols: this.cols
		});

		this.ptyProcess.onData((data: any) => {
			this.write(data);
		});

		//When user types(input), write to node-pty
		this.onData((data: any) => {
			this.ptyProcess.write(data)
		});
	}

	fit() {
		
		console.debug(`pty: rows: ${this.rows}, cols: ${this.cols}`);
		this.ptyProcess.resize(this.cols, this.rows);

		this._fit()	
	}
}
