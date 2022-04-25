import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { BasicTerminal } from './terminal';
import { ShellTerminal } from './shell_terminal';

function renderSkeleton() {
	ReactDOM.render(<div>
		<h2>Hello World!</h2>
		<div id="terminal"></div>
	</div>, document.getElementById("root"));
}

function renderTerminal() {
	var term = new ShellTerminal();
	term.render();
}

renderSkeleton();
renderTerminal();