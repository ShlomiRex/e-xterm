import * as React from 'react';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import AddIcon from "@mui/icons-material/Add";


import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";

import MyTerminal from './terminal';

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
			aria-labelledby={`simple-tab-${index}`}
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

function a11yProps(index: number) {
	return {
		id: `simple-tab-${index}`,
		'aria-controls': `simple-tabpanel-${index}`,
	};
}

export default function BasicTabs() {
	const [value, setValue] = React.useState(0);

	const handleChange = (event: React.SyntheticEvent, newValue: number) => {
		setValue(newValue);
	};

	function handleDelete(e: any) {
		console.log("Delete tab", e)
	}

	function handleClick(e: any) {
		console.log("Click tab", e)
	}

	function tabFactory(label: string, index: number) {
		return <Tab label={
			<Chip label={label} variant="outlined" onDelete={handleDelete} onClick={handleClick} />
		} {...a11yProps(index)} />
	}

	return (
		<Box sx={{ width: '100%' }}>
			<Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
				<Tabs className="tabs main-panel" value={value} onChange={handleChange} aria-label="basic tabs example">
					{/* <Button variant="text">Sessions</Button> */}
					{tabFactory("Welcome", 0)}
					{/* {tabFactory("Two", 1)}
					{tabFactory("Three", 2)}
					{tabFactory("Four", 3)} */}
					<Button>
						<AddIcon color="secondary" />
					</Button>
				</Tabs>
			</Box>
			<TabPanel value={value} index={0}>
				<div><h1>Welcome to e-xterm!</h1></div>
				{/* TODO: Insert terminal here, but we need a way to 'inject' terminal from diffirent file, NOT inside tabs */}
				<MyTerminal></MyTerminal>
			</TabPanel>
			{/* <TabPanel value={value} index={1}>
				Item Two
			</TabPanel>
			<TabPanel value={value} index={2}>
				Item Three
			</TabPanel> */}
		</Box>
	);
}