import * as React from 'react';
import Box from '@mui/material/Box';
import { Typography } from '@mui/material';
import PropTypes from 'prop-types';

function TabPanel(props) {
	const { children, value, index, ...other } = props;

	return (
		<div
			role="tabpanel"
			hidden={value !== index}
			id={`simple-tabpanel-${index}`}
			aria-labelledby={`simple-tab-${index}`}
			{...other}
		>
			{value === index && (
				<Box sx={{ p: 3 }}>
					<Typography>{children}</Typography>
				</Box>
			)}
		</div>
	);
}

TabPanel.propTypes = {
	children: PropTypes.node,
	index: PropTypes.number.isRequired,
	value: PropTypes.number.isRequired,
};

interface PanelsState {
	id_aggregate: number,
	panels: { id: number }[],
	selectedPanelId: number
}

export default class MyTabPanels extends React.Component<any, PanelsState> {
	selectPanel(id: number) {
		console.log("Selecting panel:", id);
		this.setState({
			selectedPanelId: id
		});
	}

	state = {
		id_aggregate: 0,
		panels: [],
		selectedPanelId: 0
	}

	addPanel() {
		this.setState({
			panels: [...this.state.panels, { id: this.state.id_aggregate }],
			id_aggregate: this.state.id_aggregate + 1,
			selectedPanelId: this.state.id_aggregate
		}, () => {
			console.log("Added panel with id:", this.state.selectedPanelId);
		});
	}

	render() {
		return <div>
			{
				this.state.panels.map(panel => {
					return <TabPanel key={panel.id} value={this.state.selectedPanelId} index={panel.id}>
						Panel Number {panel.id}
					</TabPanel>
				})
			}
		</div>
	}
}