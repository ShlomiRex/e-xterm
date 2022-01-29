import * as React from 'react';
import Box from '@mui/material/Box';

import MyTabs from './main_tabs';
import MyTabPanels from './tabs_views';
import BasicTabs from './test3';

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

function TabPanel(props: TabPanelProps) {
	const { children, value, index, ...other } = props;

	return (
		<div
			role="tabpanel"
			hidden={value !== index}
			id={`simple-tabpanel-${index}`}
			{...other}
		>
			{value === index && (
				<Box>
					{/* <Typography>{children}</Typography> */}
					{children}
				</Box>
			)}
		</div>
	);
}


export class MainPanel extends React.Component<any, any> {
	ref_mytabs: React.RefObject<MyTabs>;
	ref_mytabpanels: React.RefObject<MyTabPanels>;
	constructor(props) {
		super(props)

		this.ref_mytabs = React.createRef();
		this.ref_mytabpanels = React.createRef();

		this.onTabAdded = this.onTabAdded.bind(this);
		this.onTabSelect = this.onTabSelect.bind(this);
	}

	// componentDidMount(): void {
	// 	this.ref_mytabpanels.current.addPanel();
	// }

	onTabAdded() {
		this.ref_mytabpanels.current.addPanel();
	}

	onTabSelect(id: number) {
		console.log("Calling panels ref with id: ", id);
		this.ref_mytabpanels.current.selectPanel(id);
	}

	render() {
		return (
			<div id="main-panel">
				<Box sx={{ width: '100%' }}>
					<Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
						<MyTabs ref={this.ref_mytabs} onTabAdded={this.onTabAdded} onTabSelect={this.onTabSelect}></MyTabs>
					</Box>
					<MyTabPanels ref={this.ref_mytabpanels}></MyTabPanels>
					<ClockWithState></ClockWithState>
				</Box>
				<BasicTabs></BasicTabs>
			</div>

		);
	}
}

export default MainPanel;