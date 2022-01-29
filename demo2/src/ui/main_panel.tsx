import * as React from 'react';
import Tabs from '@mui/material/Tabs';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import AddIcon from "@mui/icons-material/Add";

// import { MainPanel } from './main_tabs';
import MyTerminal from './terminal';
import MyTabs from './main_tabs';
import MyTabPanels from './main_tab_panels';

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
		console.log("Mounted tabs2")

		this.timerID = setInterval(
			() => this.tick(),
			1000
		);
	}

	componentWillUnmount() {
		console.log("Un Mounted tabs2")

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
	}

	render() {
		return (
			<div id="main-panel">
				<Box sx={{ width: '100%' }}>
					<Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
						<MyTabs ref={this.ref_mytabs}></MyTabs>
						{/* <Tabs className="tabs main-panel" value={1} aria-label="basic tabs example">
							<MyTabs ref={this.ref_mytabs}></MyTabs>
							<Button onClick={this.handleNewTab}>
								<AddIcon color="secondary" />
							</Button>
						</Tabs> */}
					</Box>
					{/* <TabPanel value={0} index={0}>
						<div><h1>Welcome to e-xterm!</h1></div>
						<MyTerminal></MyTerminal>
					</TabPanel> */}
					{/* <MyTabPanels ref={this.ref_mytabpanels}></MyTabPanels> */}
					<ClockWithState></ClockWithState>
				</Box>
			</div>

		);
	}
}

export default MainPanel;