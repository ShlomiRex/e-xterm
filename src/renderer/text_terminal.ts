import { BasicTerminal } from './terminal_ui'

export class TextTerminal extends BasicTerminal {
	
	constructor(parent: HTMLElement, rows: number, cols: number) {
		super(parent, rows, cols);
	}

	prompt(str: string) {
		this.writeln(str);
	}
}