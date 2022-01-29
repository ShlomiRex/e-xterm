console.log("app.tsx log");

import React, { useEffect } from "react";
import ReactDOM from "react-dom";
import Split from "react-split";

import "./ui/index.css";
import MainPanel from './ui/main_panel';
import LeftPanel from './ui/left_panel';

// import CustomTabs from './ui/test2';

class App extends React.Component {
	render() {
		return (
			<Split className="split"
				sizes={[30, 70]}
				minSize={[180]}
				expandToMin={true}
				gutterSize={10}>
				<LeftPanel />
				<MainPanel />
			</Split>
		);
	}
}

export default App;

const rootElement = document.getElementById("root");
ReactDOM.render(<App />, rootElement);
