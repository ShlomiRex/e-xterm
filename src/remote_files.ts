//In renderer context

export interface Row {
	recid: number,              //unique id for the row

	filename: string,          //file name
	size: number,              //file size
	lastmodified: Date         //file last modified
	owner: string,             //file owner
	group: string,             //file group
	access: string             //file permissions
}

class RemoteFilesGrid {
	private gridElement: JQuery<HTMLElement>

	private static instance: RemoteFilesGrid

	private constructor(url: string) {
		this.gridElement = $("#grid")
		
		this.gridElement.w2grid({
			name: 'grid',
			header: 'Grid header',
			show: {
				toolbar: true,
				footer: true
			},
			url: url, //this is used for loading records from file / url after creation
			columns: [
				{ field: 'name', caption: 'File name', size: '170px', sortable: true },
				{ field: 'size', caption: 'Size (KB)', size: '66px', sortable: false },
				{ field: 'lastmodified', caption: 'Last modified', size: '115px', sortable: false },
				{ field: 'owner', caption: 'Owner', size: '60px', sortable: true },
				{ field: 'group', caption: 'Group', size: '60px', sortable: true },
				{ field: 'access', caption: 'Access', size: '70px', sortable: false, resizable: false },
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
		})
	}

	/**
	 * 
	 * @param url URL to load at the start
	 */
	static createInstance(url: string = "") {
		if (!RemoteFilesGrid.instance) {
			//no instance, create
			RemoteFilesGrid.instance = new RemoteFilesGrid(url)
		}
	}

	static getInstance(): RemoteFilesGrid {
		return RemoteFilesGrid.instance;
	}

	loadURL(url: string) {
		w2ui['grid'].load(url);
	}
}

RemoteFilesGrid.createInstance()
RemoteFilesGrid.getInstance().loadURL('../resources/examples/records.json')
