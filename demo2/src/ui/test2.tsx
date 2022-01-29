/* No licenses, use as pleased.
 * The code here uses React Class components (ES6 classes). 
 * Ken Nguyen has made a hooks version of this! Please find that here: https://codesandbox.io/s/addanddelete-tabs-mui-bo7tw
 * Cheers!
 */

import React, { Component } from "react";
import cloneDeep from "lodash/cloneDeep";

import Tab from '@mui/material/Tab';
import Grid from '@mui/material/Grid';
import AppBar from '@mui/material/AppBar';
import Tabs from '@mui/material/Tabs';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import AddIcon from "@mui/icons-material/Add";
import Add from '@mui/icons-material/Add';
import Close from '@mui/icons-material/Close';
import TabPanel from '@mui/material/';


class CustomTabs extends Component<any, any> {
	constructor(props) {
		super(props);
		this.state = {
			value: 0,
			tabList: [{
				key: 0,
				id: 0,
			}]
		};
	}

	addTab = () => {
		this.setState((state, props) => {
			let tabList = cloneDeep(state.tabList);
			let id = tabList[tabList.length - 1].id + 1;
			tabList.push({
				key: id,
				id: id,
			});

			return {
				tabList,
			}
		})
	}

	deleteTab = (e) => {
		// prevent MaterialUI from switching tabs
		e.stopPropagation();

		// Cases:
		// Case 1: Single tab.
		// Case 2: Tab on which it's pressed to delete.
		// Case 3: Tab on which it's pressed but it's the first tab
		// Case 4: Rest all cases.
		// Also cleanup data pertaining to tab.

		// Case 1:
		if (this.state.tabList.length === 1) {
			return; // If you want all tabs to be deleted, then don't check for this case.
		}

		// Case 2,3,4:
		let tabID = parseInt(e.target.id);
		let tabIDIndex = 0;

		let tabList = this.state.tabList.filter((value, index) => {
			if (value.id === tabID) {
				tabIDIndex = index;
			}
			return value.id !== tabID;
		});

		this.setState((state, props) => {
			let curValue = parseInt(state.value);
			if (curValue === tabID) {
				// Case 3:
				if (tabIDIndex === 0) {
					curValue = state.tabList[tabIDIndex + 1].id
				}
				// Case 2:
				else {
					curValue = state.tabList[tabIDIndex - 1].id
				}
			}
			return {
				value: curValue
			}
		}, () => {
			this.setState({
				tabList: tabList
			})
		});
	}

	handleTabChange = (event, value) => {

		this.setState({ value });
	}

	render() {
		return (
			<div>h</div>
		);
	}
}

export default CustomTabs;