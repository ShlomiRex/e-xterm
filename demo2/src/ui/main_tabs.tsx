import * as React from 'react';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';



function a11yProps(index: number) {
	return {
		id: `simple-tab-${index}`,
		'aria-controls': `simple-tabpanel-${index}`,
	};
}
interface TabsState {
	id_aggregate: number,
	tabs: { id: number, label: string }[]
}

export default class MyTabs extends React.Component<any, TabsState> {
	constructor(props) {
		super(props)

		this.state = {
			tabs: [],
			id_aggregate: 0,
		};
	}

	addTab() {
		this.setState({
			tabs: this.state.tabs.concat([{
				id: this.state.id_aggregate + 1,
				label: "Tab " + (this.state.id_aggregate + 1),
			}]),
			id_aggregate: this.state.id_aggregate + 1,
		})

		console.log("state: ", this.state)
	}

	handleDelete(e) {
		console.log("Delete tab", e)
	}

	handleClick(e) {
		console.log("Click tab", e)
	}

	// tabFactory(label: string, index: number) {
	// 	return <Tab label={
	// 		<Chip label={label} variant="outlined" onDelete={this.handleDelete} onClick={this.handleClick} />
	// 	} {...a11yProps(index)} />
	// }

	tabFactory(label: string, index: number) {
		return <Tab onClick={this.handleClick} tabIndex={index} label={label} key={index} {...a11yProps(index)} />
	}

	render() {
		return <div>
			{this.tabFactory("Welcome", 0)}
			{
				this.state.tabs.map((tab) => {
					return this.tabFactory(tab.label, tab.id)
				})
			}
		</div>
	}
}
