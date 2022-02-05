import React, { useRef, useEffect, useState } from "react";

import "./index.css";

import { XTerm } from 'xterm-for-react'
import { SearchAddon } from 'xterm-addon-search'
import { ipcRenderer } from "electron";
import test from './terminalX'

const xTerminalRef: any = React.createRef();

function onKeyPressed(event: { key: string; domEvent: KeyboardEvent; }) {
	xTerminalRef.current.terminal.write(event.key);
	//ipcRenderer.send("key-pressed", event.key);
	test(event);
}

// const onKeyPressed = (event: { key: string; domEvent: KeyboardEvent; }) => {
// 	xTerminalRef.current.terminal.write(event.key);
// 	ipcRenderer.send("key-pressed", event.key);
// };


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