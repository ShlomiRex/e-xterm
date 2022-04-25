import { Terminal } from 'xterm';

export enum Shell {
	CMD = "COMSPEC",
	BASH = "bash",
	POWERSHELL = "powershell.exe",
	ZSH = "zsh",
	WSL = "wsl.exe"
}

export class BasicTerminal extends Terminal {
	constructor() {
		super();
	}

	render() {
		this.open(document.getElementById("terminal"));
		this.write('Hello world!');
	}
}

