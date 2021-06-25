import '../static/style.css';
import '../static/Examples.css';

import * as React from 'react';
import * as ReactDOM from 'react-dom';

import { Terminal } from 'xterm'
import { XTerm } from 'xterm-for-react'

import MyTerm from './components/term'
import { Basic } from './Basic'

const element = new Terminal()
const myref = React.createRef<XTerm>()
console.log(element)



console.log("ENV: " + process.env.NODE_ENV)



function App() {
	return (
		<div className="app">
			<h4>Welcome to React, Electron and Typescript</h4>
			<p>Hello</p>
			<h1>Shlomid</h1>
			<MyTerm></MyTerm>
			<Basic></Basic>
		</div>
	);
}

ReactDOM.render(
	<App />,
	document.getElementById('app'),
);
