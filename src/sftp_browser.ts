import { FilesGrid } from './files_grid'

export class SFTPBrowser {
	constructor(DOM_id: string) {
		FilesGrid.createInstance(DOM_id)
		FilesGrid.getInstance().loadURL('../resources/examples/records.json')
	}
}