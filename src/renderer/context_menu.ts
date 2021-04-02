import { remote } from 'electron'
const { Menu, MenuItem } = remote;


//These 2 variables help determined what is the target, when MenuItem's click() function is called
//So we know what is the target when we get to that function
//They are set to null after contextmenu closes
let bookmarkIdTarget: string = undefined
let terminalIdTarget: string = undefined

const bookmarkContextMenu = new Menu();
const terminalContextMenu = new Menu();
export function setup_context_menu() {
	function setupBookmarksContextMenu() {
		bookmarkContextMenu.append(new MenuItem({
			"label": 'Settings',
			"id": "settings",
			"click": (menuItem: any) => {
				console.log("Clicked on settings", bookmarkIdTarget)
				ipcRenderer.send("OpenBookmarkSettings", bookmarkIdTarget)
			}
		}));
		bookmarkContextMenu.append(new MenuItem({
			"type": "separator"
		}));
		bookmarkContextMenu.append(new MenuItem({
			"label": "Delete bookmark",
			"id": "delete",
			"click": (menuItem: any) => {
				console.log("Clicked on delete bookmark", bookmarkIdTarget)
				ipcRenderer.send("DeleteBookmark", bookmarkIdTarget)
			}
		}));
	}
	function setupTerminalContextMenu() {
		terminalContextMenu.append(new MenuItem({
			"label": "Copy",
			"id": "terminal_copy",
			"role": "copy",
			"click": (menuItem: any) => {
				console.log("Terminal copy clicked", terminalIdTarget)
			}
		}));
		terminalContextMenu.append(new MenuItem({
			"label": "Paste",
			"id": "terminal_paste",
			"role": "paste",
			"click": (menuItem: any) => {
				console.log("Terminal paste clicked", terminalIdTarget)
			}
		}));
		terminalContextMenu.append(new MenuItem({
			"type": "separator"
		}));
		terminalContextMenu.append(new MenuItem({
			"label": "Find",
			"id": "terminal_find",
			"click": (menuItem: any) => {
				console.log("Terminal find clicked", terminalIdTarget)
			}
		}));
	}

	setupBookmarksContextMenu()
	setupTerminalContextMenu()

	window.addEventListener('contextmenu', (mouseEvent: MouseEvent) => {
		mouseEvent.preventDefault()
		console.debug("Context menu fired!", mouseEvent)

		//Find if path is bookmark. Object may not have "hasAttribute" so try catch
		try {
			for (let path of (mouseEvent as any).path) {
				if (path.hasAttribute("data-bookmark-id")) {
					let bookmarkId = path.getAttribute("data-bookmark-id");
					bookmarkIdTarget = bookmarkId
					console.log("Right clicked on bookmark id:", bookmarkId)
					bookmarkContextMenu.popup({
						"window": remote.getCurrentWindow(),
						"callback": () => {
							console.log("Bookmark ContextMenu closed")
							bookmarkIdTarget = null
						}
					})
					break
				}
			}
		} catch (e: any) {
			//did not find bookmark target
			//maybe user clicked on terminal?
			try {
				for (let path of (mouseEvent as any).path) {
					if (path.classList.contains("eb-view")) {
						let terminal_id = path.dataset.eb_view_id;
						console.debug("Found target is terminal", terminal_id);
						terminalIdTarget = terminal_id
						terminalContextMenu.popup({
							"window": remote.getCurrentWindow(),
							"callback": () => {
								console.log("Terminal ContextMenu closed")
								terminalIdTarget = null
							}
						})
						break;
					}
				}
			} catch (e: any) {
				//user did not clicked on terminal
			}
		}


	})
}