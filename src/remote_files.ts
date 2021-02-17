//In renderer context

import { w2grid } from "w2ui"

console.log("Test")

$('#grid').w2grid({
	name: 'grid',
	header: 'List of Names',
	show: {
		toolbar: true,
		footer: true
	},
	columns: [
		{ field: 'name', caption: 'File name', size: '170px', sortable: true },
		{ field: 'size', caption: 'Size (KB)', size: '66px', sortable: false },
		{ field: 'lastmodified', caption: 'Last modified', size: '115px', sortable: false },
		{ field: 'owner', caption: 'Owner', size: '60px', sortable: true },
		{ field: 'group', caption: 'Group', size: '60px', sortable: true },
		{ field: 'access', caption: 'Access', size: '70px', sortable: false, resizable: false },
	],
	records: [
		{ recid: 1, name: "test.txt", size: "1", lastmodified: '2021-02-10 11:19', owner: 'test', group: "test", access: "-rw-r--r---" },
		{ recid: 2, name: "test2.txt", size: "5", lastmodified: '2021-02-10 11:19', owner: 'test', group: "test", access: "-rw-r--r---" },
		{ recid: 3, name: "test3.txt", size: "163", lastmodified: '2021-02-10 12:42', owner: 'test', group: "test", access: "-rw-r--r---" },
		{ recid: 4, name: "test4.txt", size: "3", lastmodified: '2021-02-10 11:19', owner: 'test', group: "test", access: "-rw-r--r---" },
		{ recid: 5, name: "test.txt", size: "1", lastmodified: '2021-02-10 11:19', owner: 'test', group: "test", access: "-rw-r--r---" },
		{ recid: 6, name: "test.txt", size: "1", lastmodified: '2021-02-10 11:19', owner: 'test', group: "test", access: "-rw-r--r---" },
		{ recid: 7, name: "test.txt", size: "1", lastmodified: '2021-02-10 11:19', owner: 'test', group: "test", access: "-rw-r--r---" }
	],
	onClick: function(event: any) {
		console.log("w2grid.onClick: ", event)
		var grid = this;
		event.onComplete = function () {
			//After mouse event complete (update UI and show that you selected the row)
			//Then this function will be called (onComplete)
			
			var sel = grid.getSelection();
			console.log('Current selection is ' + sel.length + ' record(s).');
			let first_selected_row_index = sel[0]
			let filename_column_index = 0
			let filename = grid.getCellValue(first_selected_row_index, filename_column_index)
			console.log("Selected a row with filename: ", filename)
		}
	}
});