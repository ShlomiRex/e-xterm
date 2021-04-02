import { TextTerminal } from "./text_terminal";
import * as pty from 'node-pty';
import { Shell } from '../shared/shell'
import { WSLSession } from '../shared/session'

export class WSLTerminal extends TextTerminal {
	constructor(parent: HTMLElement, session: WSLSession) {
		let rows = 40;
		let cols = 80;
		super(parent, rows, cols)
		const ptyProcess = pty.spawn(Shell.WSL, ["-d", session.distro], {
			name: 'xterm-color',
			cwd: process.cwd(),
			env: process.env
		});

		ptyProcess.on("data", (data) => {
			this.write(data);

		})
		this.onData((data: any) => {
			ptyProcess.write(data)
		})
	}
}