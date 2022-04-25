import * as pty from 'node-pty';
import * as os from 'os';

var isRenderer = (process && process.type === 'renderer')
console.log	('isRenderer', isRenderer)

import { BasicTerminal, Shell } from './terminal';
console.log("Platform:", os.platform())

const WINDOWS = os.platform() === 'win32';
const MAC = os.platform() == "darwin";

export class ShellTerminal extends BasicTerminal {
	private ptyProcess: pty.IPty;

	constructor() {
		super();

		let shell;
		if (WINDOWS) {
			shell = Shell.POWERSHELL
		} else if (MAC) {
			shell = Shell.ZSH
		} else {
			shell = Shell.BASH
		}
		console.log("Chosen shell:", shell);

		// this.ptyProcess = pty.spawn(shell, [], {
		// 	name: 'xterm-color',
		// 	cwd: process.cwd(),
		// 	env: process.env,
		// 	rows: this.rows,
		// 	cols: this.cols
		// });

		// this.ptyProcess.onData((data: any) => {
		// 	this.write(data);
		// });

		// //When user types(input), write to node-pty
		// this.onData((data: any) => {
		// 	this.ptyProcess.write(data)
		// });
	}
}
