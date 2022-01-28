import React, { useRef, useEffect, useState } from "react";

import "./index.css";

import { XTerm } from 'xterm-for-react'
import { SearchAddon } from 'xterm-addon-search'

const xTerminalRef: any = React.createRef();

const onKeyPressed = (event: { key: string; domEvent: KeyboardEvent; }) => {
	xTerminalRef.current.terminal.write(event.key);
};


export default class MyTerminal extends React.Component {
	render() {
		console.log("ref = ", xTerminalRef.current);
		return<XTerm
				options={{ cursorBlink: true, disableStdin: false }}
				onKey={(e: { key: string; domEvent: KeyboardEvent; }) => onKeyPressed(e)}
				ref={xTerminalRef}
			/>
	}
}