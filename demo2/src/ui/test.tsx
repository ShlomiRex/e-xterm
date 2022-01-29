import * as React from 'react';
import ReactDOM from "react-dom";

class Child extends React.Component {
	render() {
		return <div>Hi!</div>
	}
}

class Parent extends React.Component {
	state: any
	constructor(props) {
		super(props);

		this.state = {children: []}
		// Give handleClick access to 'this'.
		this.handleClick = this.handleClick.bind(this);
	}

	handleClick() {
		// Option 1
		// this.setState({
		// 	children: [...this.state.children, { text: "hi" }]
		// });

		// Option 2
		this.setState({
			children: this.state.children.concat([{ text: "hi" }])
		});
	}

	render() {
		return <div>
			<h1>Hello from parent!</h1>
			<button onClick={this.handleClick}>
				Add children
			</button>
			<div>
				Children ({this.state.children.length}):
				{
					this.state.children.map((child) => {
						return <Child></Child>
					})
				}
			</div>

		</div>
	}
}

export default Parent;

const rootElement = document.getElementById("root");
ReactDOM.render(<Parent />, rootElement);