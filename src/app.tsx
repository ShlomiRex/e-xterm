import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Terminal } from 'xterm';

function render() {
	ReactDOM.render(<div>
		<h2>Hello World!</h2>
		<div id="terminal"></div>
	</div>, document.getElementById("root"));

	var term = new Terminal();
	term.open(document.getElementById("terminal"));
	term.write('Hello world!');
	
}

render();