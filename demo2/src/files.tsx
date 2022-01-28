import * as React from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import { styled } from '@mui/material/styles';
import TableCell, { tableCellClasses } from '@mui/material/TableCell';


function createData(
	filename: string,
	size: number,
	lastmodified: number,
	owner: number,
	group: number,
	access: string
) {
	return { filename, size, lastmodified, owner, group, access };
}

const rows = [
	createData("test.txt", 100, 100, 100, 100, "rwx"),
	createData("test.txt", 100, 100, 100, 100, "rwx"),
	createData("test.txt", 100, 100, 100, 100, "rwx"),
	createData("test.txt", 100, 100, 100, 100, "rwx"),
	createData("test.txt", 100, 100, 100, 100, "rwx"),
	createData("test.txt", 100, 100, 100, 100, "rwx"),
	createData("test.txt", 100, 100, 100, 100, "rwx"),
	createData("test.txt", 100, 100, 100, 100, "rwx"),
	createData("test.txt", 100, 100, 100, 100, "rwx"),
	createData("test.txt", 100, 100, 100, 100, "rwx"),
	createData("test.txt", 100, 100, 100, 100, "rwx"),
	createData("test.txt", 100, 100, 100, 100, "rwx"),
	createData("test.txt", 100, 100, 100, 100, "rwx"),
	createData("test.txt", 100, 100, 100, 100, "rwx"),
	createData("test.txt", 100, 100, 100, 100, "rwx"),
	createData("test.txt", 100, 100, 100, 100, "rwx"),
];

const StyledTableCell = styled(TableCell)(({ theme }) => ({
	[`&.${tableCellClasses.head}`]: {
	  backgroundColor: theme.palette.common.black,
	  color: theme.palette.common.white,
	},
	[`&.${tableCellClasses.body}`]: {
	  fontSize: 14,
	},
  }));

export default function DenseTable() {
	function handleClick() {

	}
	return (
		<TableContainer component={Paper}>
			<Table sx={{ minWidth: 650 }} size="small" aria-label="a dense table">
				<TableHead>
					<TableRow>
						<StyledTableCell align="left">Filename</StyledTableCell>
						<StyledTableCell align="right">Size (KB)</StyledTableCell>
						<StyledTableCell align="right">Last modified</StyledTableCell>
						<StyledTableCell align="right">Owner</StyledTableCell>
						<StyledTableCell align="right">Group</StyledTableCell>
						<StyledTableCell align="right">Access</StyledTableCell>
					</TableRow>
				</TableHead>
				<TableBody>
					{rows.map((row) => (
						<TableRow
							key={row.filename}
							sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
							onSelect={handleClick}
							hover
						>
							<TableCell component="th" scope="row">{row.filename}</TableCell>
							<TableCell align="right">{row.size}</TableCell>
							<TableCell align="right">{row.lastmodified}</TableCell>
							<TableCell align="right">{row.owner}</TableCell>
							<TableCell align="right">{row.group}</TableCell>
							<TableCell align="right">{row.access}</TableCell>
						</TableRow>
					))}
				</TableBody>
			</Table>
		</TableContainer>
	);
}