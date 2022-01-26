console.log("app.tsx log");

import React from "react";
import ReactDOM from "react-dom";
import Split from "react-split";

import "./index.css";
import MainPanel from './main_panel';

class App extends React.Component {
	render() {
		return (
			<Split className="split"
				sizes={[30, 70]}
				gutterSize={10}>
					<div id="left-panel" className="comp">left panel</div>
					<MainPanel/>
			</Split>
		);
	}
}

const rootElement = document.getElementById("root");
ReactDOM.render(<App />, rootElement);
