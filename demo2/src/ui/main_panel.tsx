import * as React from 'react';
import Box from '@mui/material/Box';

import MyTabs from './main_tabs';
import TabsViews from './tabs_views';

class ClockWithState extends React.Component<any, { date }> {
	timerID: NodeJS.Timeout;
	constructor(props) {
		super(props)
		// this.state = {numtabs: 0}
		this.state = { date: new Date() };
	}
	render() {
		return (
			<div>
				<h1>Clocks updates every second (this.setState)</h1>
				<h2>It is {this.state.date.toLocaleTimeString()}.</h2>
			</div>
		);
	}

	componentDidMount() {
		this.timerID = setInterval(
			() => this.tick(),
			1000
		);
	}

	componentWillUnmount() {
		clearInterval(this.timerID);
	}

	tick() {
		this.setState({
			date: new Date()
		});
	}
}


interface TabPanelProps {
	children?: React.ReactNode;
	index: number;
	value: number;
}

export class MainPanel extends React.Component<any, any> {
	ref_mytabs: React.RefObject<MyTabs>;
	ref_mytabpanels: React.RefObject<TabsViews>;
	constructor(props) {
		super(props)

		this.ref_mytabs = React.createRef();
		this.ref_mytabpanels = React.createRef();

		this.onTabAdded = this.onTabAdded.bind(this);
		this.onTabSelect = this.onTabSelect.bind(this);
	}

	onTabAdded() {
		this.ref_mytabpanels.current.addPanel();
	}

	onTabSelect(id: number) {
		console.log("Calling panels ref with id: ", id);
		this.ref_mytabpanels.current.selectPanel(id);
	}

	onComponentDidMount() {
		console.log("Adding welcome")
		this.ref_mytabs.current.addTab("Welcome!");
		this.ref_mytabpanels.current.addPanel();
	}

	render() {
		return (
			<div id="main-panel">
				<Box sx={{ width: '100%' }}>
					<Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
						<MyTabs ref={this.ref_mytabs} onTabAdded={this.onTabAdded} onTabSelect={this.onTabSelect}></MyTabs>
					</Box>
					<TabsViews ref={this.ref_mytabpanels}></TabsViews>
					<ClockWithState></ClockWithState>
				</Box>
			</div>

		);
	}
}

export default MainPanel;