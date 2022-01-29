import * as React from 'react';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import AddIcon from "@mui/icons-material/Add";

interface TabsState {
	id_aggregate: number,
	tabs: { id: number, label: string }[],
	selectedTabId: number
}

interface TabsProps {
	onTabSelect: (id: number) => void
	onTabAdded: (id: number) => void
}

export default class MyTabs extends React.Component<TabsProps, TabsState> {
	constructor(props) {
		super(props)

		this.state = {
			tabs: [],
			id_aggregate: 0,
			selectedTabId: 0
		};

		this.handleTabClick = this.handleTabClick.bind(this);
		this.addTab = this.addTab.bind(this);
		this.addDummyTab = this.addDummyTab.bind(this);
	}

	addTab(label: string) {
		this.setState({
			tabs: this.state.tabs.concat([{
				id: this.state.id_aggregate,
				label: label
			}]),
			id_aggregate: this.state.id_aggregate + 1,
			selectedTabId: this.state.id_aggregate
		}, () => {
			console.log("Added tab:", this.state.selectedTabId)

			this.props.onTabAdded(this.state.selectedTabId);
		});
	}

	addDummyTab() {
		var label = "Tab " + (this.state.id_aggregate)
		this.addTab(label)
	}

	handleTabDelete(e) {
		console.log("Delete tab", e)
	}

	handleTabClick(e) {
		console.log("Click on tab:", e.target.tabIndex)

		this.setState({
			selectedTabId: e.target.tabIndex
		})

		this.props.onTabSelect(e.target.tabIndex);
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
				{
					this.state.tabs.map((tab) => {
						return this.tabFactory(tab.label, tab.id)
					})
				}
				<Tab icon={<AddIcon />} onClick={this.addDummyTab}></Tab>
			</Tabs>
		</div>
	}
}
