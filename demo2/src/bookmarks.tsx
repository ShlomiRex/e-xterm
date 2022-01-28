import * as React from 'react';
import Box from '@mui/material/Box';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Divider from '@mui/material/Divider';
import InboxIcon from '@mui/icons-material/Inbox';
import DraftsIcon from '@mui/icons-material/Drafts';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';

export default class Bookmarks extends React.Component {
	render() {
		return <div>
			<Alert severity="info">You do not have saved bookmarks.</Alert>
			<BasicList></BasicList>
		</div>;
	}
}



function BasicList() {
	return (
		<Box sx={{ width: '100%', bgcolor: 'background.paper' }}>
			<Button variant="contained">
				New session
			</Button>
			<Button variant="outlined">
				New shell
			</Button>
			<Divider />
			<nav aria-label="main mailbox folders">
				<List>
					<ListItem disablePadding>
						<ListItemButton>
							<ListItemIcon>
								<InboxIcon />
							</ListItemIcon>
							<ListItemText primary="Inbox" />
						</ListItemButton>
					</ListItem>
					<ListItem disablePadding>
						<ListItemButton>
							<ListItemIcon>
								<DraftsIcon />
							</ListItemIcon>
							<ListItemText primary="Drafts" />
						</ListItemButton>
					</ListItem>
				</List>
			</nav>
			<Divider />
			<nav aria-label="secondary mailbox folders">
				<List>
					<ListItem disablePadding>
						<ListItemButton>
							<ListItemText primary="Trash" />
						</ListItemButton>
					</ListItem>
					<ListItem disablePadding>
						<ListItemButton component="a" href="#simple-list">
							<ListItemText primary="Spam" />
						</ListItemButton>
					</ListItem>
				</List>
			</nav>
		</Box>
	);
}