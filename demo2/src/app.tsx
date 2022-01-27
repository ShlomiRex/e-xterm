console.log("app.tsx log");

import React from "react";
import ReactDOM from "react-dom";
import Split from "react-split";

import "./index.css";
import MainPanel from './main_panel';
import LeftPanel from './left_panel';

class App extends React.Component {
	render() {
		return (
			<Split className="split"
				sizes={[30, 70]}
				gutterSize={10}>
					<LeftPanel/>
					<MainPanel/>
			</Split>
		);
	}
}

const rootElement = document.getElementById("root");
ReactDOM.render(<App />, rootElement);
