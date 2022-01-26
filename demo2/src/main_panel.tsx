import React, { useRef, useEffect, useState } from "react";

import BasicTabs from './tabs';

class MainPanel extends React.Component {
	render() {
		return <div id="main-panel" className="comp">
			<div className="browser">
				<BasicTabs/>
				<div className="browser-views"></div>
				test
			</div>
		</div>;
	}
}

export default MainPanel;