import * as pty from 'node-pty';
import { Shell } from '../shared/shell'
import { WSLSession } from '../shared/session'
import { BasicTerminal } from "./terminal";

export class WSLTerminal extends BasicTerminal {
	private ptyProcess: pty.IPty;
	constructor(parent: HTMLElement, session: WSLSession) {
		let rows = 40;
		let cols = 80;
		super(parent, rows, cols)
		this.ptyProcess = pty.spawn(Shell.WSL, ["-d", session.distro], {
			name: 'xterm-color',
			cwd: process.cwd(),
			env: process.env
		});

		this.ptyProcess.on("data", (data) => {
			this.write(data);

		})
		this.onData((data: any) => {
			this.ptyProcess.write(data)
		})

		this.fit()
	}

	fit() {
		this._fit()	
		
		console.debug(`pty: rows: ${this.rows}, cols: ${this.cols}`);
		this.ptyProcess.resize(this.cols, this.rows);
	}
}