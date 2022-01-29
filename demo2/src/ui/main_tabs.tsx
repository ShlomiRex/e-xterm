import * as React from 'react';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import AddIcon from "@mui/icons-material/Add";

interface TabsState {
	id_aggregate: number,
	tabs: { id: number, label: string }[],
	selectedTabId: number
}

export default class MyTabs extends React.Component<any, TabsState> {
	constructor(props) {
		super(props)

		this.state = {
			tabs: [],
			id_aggregate: 0,
			selectedTabId: 0
		};

		this.handleTabClick = this.handleTabClick.bind(this);
		this.addTab = this.addTab.bind(this);
	}

	addTab() {
		this.setState({
			tabs: this.state.tabs.concat([{
				id: this.state.id_aggregate,
				label: "Tab " + (this.state.id_aggregate),
			}]),
			id_aggregate: this.state.id_aggregate + 1,
			selectedTabId: this.state.id_aggregate
		}, () => {
			console.log("Selecting tab", this.state.selectedTabId)
		});
	}

	handleTabDelete(e) {
		console.log("Delete tab", e)
	}

	handleTabClick(e) {
		console.log("Click on tab:", e.target.id)
	}

	tabFactory(label: string, index: number) {
		return <Tab
			onClick={this.handleTabClick}
			tabIndex={index}
			label={label}
			key={index}
			id={"simple-tab-" + index} />
	}

	render() {

		return <div>
			<Tabs className="tabs main-panel" value={this.state.selectedTabId} aria-label="basic tabs example">
				{/* {this.tabFactory("Welcome", 0)} */}
				{
					this.state.tabs.map((tab) => {
						return this.tabFactory(tab.label, tab.id)
					})
				}
				<Tab icon={<AddIcon />} onClick={this.addTab}></Tab>
			</Tabs>
		</div>
	}
}
