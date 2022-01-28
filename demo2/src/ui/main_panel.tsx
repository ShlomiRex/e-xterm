import React, { useRef, useEffect, useState } from "react";
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';

import BasicTabs from './main_tabs';

class MainPanel extends React.Component {
	render() {
		return <div id="main-panel">
			<div className="browser">
				<BasicTabs />
				<div className="browser-views"></div>
				test
			</div>
		</div>;
	}
}

export default MainPanel;