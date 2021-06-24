/**
 * React renderer.
 */
// Import the styles here to process them with webpack
import '../static/style.css';

import * as React from 'react';
import * as ReactDOM from 'react-dom';

import { Terminal } from 'xterm'
import { XTerm } from 'xterm-for-react'

const element = new Terminal()
const myref = React.createRef<XTerm>()
console.log(element)

import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import 'react-tabs/style/react-tabs.css';
import RLDD from 'react-list-drag-and-drop/lib/RLDD';


import '../static/Examples.css';


console.log("ENV: " + process.env.NODE_ENV)



class HelloWorld extends React.Component {
	xtermRef: React.RefObject<any>;
	constructor(props: {} | Readonly<{}>) {
		super(props)

		// Create a ref
		this.xtermRef = React.createRef()
	}

	componentDidMount() {
		// Once the terminal is loaded write a new line to it.
		this.xtermRef.current.terminal.writeln('Hello, World!')
	}

	render() {
		return (
			<>
				{/* Create a new terminal and set it's ref. */}
				<XTerm ref={this.xtermRef} />
			</>
		)
	}
}




interface Item {
	id: number;
	title: string;
}

interface State {
	items: Item[];
}

export default class HorizontalExample extends React.PureComponent<{}, State> {

	//readonly state: State = { items: fruits.fruits }; 
	readonly state: State = { items: [
		{id:0, title: "ABC"},
		{id:1, title: "ABC2"},
		{id:2, title: "ABC3"}
	] }; 

	render() {
		// console.log('HorizontalExample.render');
		const items = this.state.items;
		return (
			<div className="example horizontal">
				<RLDD
					cssClasses="example-list-container"
					layout="horizontal"
					items={items}
					itemRenderer={this.itemRenderer}
					onChange={this.handleRLDDChange}
				/>
			</div>
		);
	}

	private itemRenderer = (item: Item, index: number): JSX.Element => {
		return (
			<div className="item">
				{/* <div className="icon">{item.icon}</div> */}
				<div className="title">{item.title}</div>
				<div className="small">item.id: {item.id} - index: {index}</div>
			</div>
		);
	}

	private handleRLDDChange = (reorderedItems: Array<Item>) => {
		// console.log('Example.handleRLDDChange');
		this.setState({ items: reorderedItems });
	}
}

function App() {
	return (
		<div className="app">
			<h4>Welcome to React, Electron and Typescript</h4>
			<p>Hello</p>
			<h1>Shlomid</h1>
			{/* <XTerm ref={myref}></XTerm> */}
			<HelloWorld></HelloWorld>
			<Tabs>
				<TabList>
					<Tab>Title 1</Tab>
					<Tab>Title 2</Tab>
				</TabList>

				<TabPanel>
					<h2>Any content 1</h2>
				</TabPanel>
				<TabPanel>
					<h2>Any content 2</h2>
				</TabPanel>
			</Tabs>
			<div className="examples">
				<HorizontalExample />
			</div>
		</div>
	);
}

ReactDOM.render(
	<App />,
	document.getElementById('app'),
);


