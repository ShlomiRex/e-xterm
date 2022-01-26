import React, { useRef, useEffect, useState } from "react";
import * as ReactDOM from 'react-dom';

import "./index.css";

import { XTerm } from 'xterm-for-react'
import { SearchAddon } from 'xterm-addon-search'

const xTerminalRef: any = React.createRef();

const onKeyPressed = (event: { key: string; domEvent: KeyboardEvent; }) => {
	console.log(event.key)

	xTerminalRef.current.terminal.write(event.key);
};


function render() {
	//ReactDOM.render(<XTerm></XTerm>, document.body);
	ReactDOM.render(
		<XTerm
			options={{ cursorBlink: true, disableStdin: false }}
			onKey={(e: { key: string; domEvent: KeyboardEvent; }) => onKeyPressed(e)}
			ref={xTerminalRef}
		/>,
		document.body);
	console.log("ref = ", xTerminalRef.current);
}

render();