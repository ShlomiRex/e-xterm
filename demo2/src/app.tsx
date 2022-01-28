console.log("app.tsx log");

import React, { useEffect } from "react";
import ReactDOM from "react-dom";
import Split from "react-split";

import "./ui/index.css";
import MainPanel from './ui/main_panel';
import LeftPanel from './ui/left_panel';


// const App = ({ }) => {
// 	useEffect(() => {
// 		var tabs = document.getElementsByClassName("tabs left-panel")[0].getElementsByTagName("button");

// 		// var tabs_width = window.getComputedStyle(tabs[0]).getPropertyValue("width") + 
// 		// 	window.getComputedStyle(tabs[1]).getPropertyValue("width")

// 		var tabs_width = tabs[0].clientWidth + tabs[1].clientWidth

		
// 	}, [])

// 	console.log("Before initialized")
// 	return (
// 		<Split className="split"
// 			sizes={[30, 70]}
// 			gutterSize={10}>
// 			<LeftPanel />
// 			<MainPanel />
// 		</Split>
// 	);
// }

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



// var a = window.getComputedStyle(btn_bookmarks).getPropertyValue("width")
// var b = window.getComputedStyle(btn_files).getPropertyValue("width")

// console.log(a);
// console.log(b);

const rootElement = document.getElementById("root");
ReactDOM.render(<App />, rootElement);
