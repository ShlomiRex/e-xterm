console.log("app.tsx log");

import React from "react";
import ReactDOM from "react-dom";
import Split from "react-split";

import "./index.css";

var left_panel = <div id="left-panel" className="comp">left panel</div>;
var main_panel = <div id="main-panel" className="comp">main panel</div>;


class App extends React.Component<any, any> {
	constructor(props: any) {
		super(props);
	}
	render() {
		return (
			<Split className="split"
				sizes={[30, 70]}
				gutterSize={10}
				dragInterval={1}
				minSize={[270, 300]}
				snapOffset={0}>
				{left_panel}
				{main_panel}
			</Split>
		);
	}
}

const rootElement = document.getElementById("root");
ReactDOM.render(<App />, rootElement);
