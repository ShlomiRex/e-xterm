import { SSHSession, WSLSession } from "../shared/session";
import { ipcRenderer } from 'electron';
import { EventEmitter } from 'events';
import { BookmarksUI } from './bookmarks_ui';
import { SFTPBrowser } from '../sftp_browser'
import { setup_context_menu } from './context_menu';
import { setup_split } from './split';

import { ShellTerminal } from '../terminals/shell_terminal'
import { Terminal } from 'xterm';
import { SSHTerminal } from "../terminals/ssh_terminal";
import { WSLTerminal } from "../terminals/wsl_terminal";

const ElectronBrowser = require("electron-browser")
const electronBrowser = new ElectronBrowser()
electronBrowser.hideTabsBar()


document.querySelector('.btn-toggle-theme').addEventListener('click', function () {
	// Then toggle (add/remove) the .dark-theme class to the body
	document.body.classList.toggle('dark-theme');
})


let js: Array<MyElectronBrowserObject> = [];
interface MyElectronBrowserObject {
	MyTerminal: Terminal,
	tab: any,
	view: any
}

BookmarksUI.createInstance();
setup_context_menu();
setup_left_panel();
init_buttons_panel();
setup_split();

function addTabViewTerminal(tab: any, view: any, myTerminal: Terminal) {
	console.debug("Added tab and view: ", tab, view)
	const toPush : MyElectronBrowserObject = {
		MyTerminal: myTerminal,
		tab: tab,
		view: view
	}
	js.push(toPush);
}

function addShell() {
	let res = electronBrowser.addTab("Shell", "../resources/terminal.png");
	let term = new ShellTerminal(res.view);

	addTabViewTerminal(res.tab, res.view, term);

	
}

function addSSH(tabTitle: string, sshSession: SSHSession, pass: string, eventEmitter: EventEmitter) {
	let res = electronBrowser.addTab(tabTitle, "../resources/ssh.png");
	let term = new SSHTerminal(res.view, sshSession, pass, eventEmitter);
	addTabViewTerminal(res.tab, res.view, term);
}

function addWSL(session: WSLSession) {
	let tabTitle = undefined
	if (session.session_name) {
		tabTitle = session.session_name
	} else {
		tabTitle = `WSL: ${session.distro}`
	}
	let res = electronBrowser.addTab(tabTitle, "../resources/ssh.png");
	let term = new WSLTerminal(res.view, session);
	addTabViewTerminal(res.tab, res.view, term);

}

function init_buttons_panel() {
	document.getElementById("btn_newSession").addEventListener("click", () => {
		ipcRenderer.send("OpenNewSessionWindow")
	});
	
	document.getElementById("btn_newShell").addEventListener("click", () => {
		addShell();
	});
	
	document.getElementById("btn_test").addEventListener("click", () => {
		console.log("Not implimented")
	});
}

function setup_left_panel() {
	let bookmarks_container = document.getElementById("bookmarks-container")
	let files_container = document.getElementById("files-container")

	let btn_bookmarks = document.getElementById("btn_bookmarks")
	let btn_files = document.getElementById("btn_files")
	
	btn_bookmarks.addEventListener("click", () => {
		console.debug("Bookmarks btn clicked")
		
		btn_bookmarks.classList.add("selected")
		btn_files.classList.remove("selected")

		bookmarks_container.style.display = "block"
		files_container.style.display = "none"
	})
	
	btn_files.addEventListener("click", () => {
		console.debug("Files btn clicked")
		
		btn_files.classList.add("selected")
		btn_bookmarks.classList.remove("selected")

		files_container.style.display = "block"
		bookmarks_container.style.display = "none"

		let sftp_browser = new SFTPBrowser("files-container")
		
	})
}












function remove_current_tab() {
	electronBrowser.removeCurrentTab()
}

window.addEventListener("DOMContentLoaded", () => {
	ipcRenderer.on("StartSSH", (event, session: SSHSession, username: string, password: string) => {
		console.log("Session:", session)
		console.log("Password length:", password.length)

		if (session.username != null && session.username.length > 0) {
			username = session.username
		}

		let title: string = undefined
		if (session.session_name) {
			title = session.session_name
		} else {
			title = username + "@" + session.remote_host
		}


		let eventEmitter = new EventEmitter();
		eventEmitter.once("ready", () => {
			console.log("Successfuly connected!");
			console.log("Removing error listiner")
			eventEmitter.removeAllListeners("error");
			console.log("Event names:", eventEmitter.eventNames())
		})

		eventEmitter.once("error", (ev: Error) => {
			//Tabs.getInstance().removeTabContent(tab.id);
			let title = "SSH Error";
			let message = ev.message;
			ipcRenderer.send("ShowError", message, title);
			remove_current_tab()
		})

		eventEmitter.once("greeting", (greetings: string) => {
			console.log("Greetings! : ", greetings);
			let title = "SSH Greetings message";
			ipcRenderer.send("ShowMessage", greetings, title);
		});

		eventEmitter.once("banner", (message: string) => {
			let title = "SSH Banner message";
			let type = "info";
			let detail = "Banner message";
			ipcRenderer.send("ShowMessage", detail, title, type, message);

			
		});

		eventEmitter.once("close", (hadError: boolean) => {
			console.log("Close emitted, hadError? ", hadError);
			//Tabs.getInstance().removeTabContent(tab.id);
		});

		let xterm = addSSH(title, session, password, eventEmitter);
	});

	ipcRenderer.on("StartWSL", (event, session: WSLSession) => {
		console.log("Renderer - StartWSL: ", event, session)
		addWSL(session)
	});

	ipcRenderer.on("WindowResize", (ev, size: Array<number>) => {
		fit_all();
	});

	ipcRenderer.on("Renderer_BookmarksUI_AddBookmark", (ev, session: SSHSession | WSLSession) => {
		console.debug("Renderer - will add bookmark")
		BookmarksUI.getInstance().populate(session);
	});

	ipcRenderer.on("Renderer_BookmarksUI_RemoveBookmark", (ev, bookmarkId: string) => {
		console.debug("Renderer - will remove bookmark")
		BookmarksUI.getInstance().unpopulate(bookmarkId);
	});

	ipcRenderer.on("Renderer_BookmarksUI_ClearBookmarks", () => {
		console.debug("Renderer - will clear bookmarks");
		BookmarksUI.getInstance().clear();
	});

	ipcRenderer.on("Renderer_BookmarksUI_UpdateBookmark", (ev, session: SSHSession) => {
		console.debug("Renderer - will update bookmark:", session);
		let text = BookmarksUI.getBookmarkLabelFromSession(session);
		let bookmarkId = session.uuid;
		BookmarksUI.getInstance().update(bookmarkId, text);
	});

});

function fit_all() {
	js.forEach((element) => {
		(element as any).MyTerminal.fit()
	});
}

window.addEventListener('resize', () => {
	fit_all()
});

/*
let left_panel = document.getElementById("left-panel");
let left_panel_resize = document.getElementById("left-panel-resize");

left_panel_resize.addEventListener("mousedown", (ev: MouseEvent) => {
	let startX = ev.clientX

	let startWidth = left_panel.offsetWidth

	function handleDragMove(ev: MouseEvent) {
		const deltaX = ev.clientX - startX;
		const newWidth = startWidth + deltaX;

		left_panel.style.width = `${newWidth}px`;

		ev.preventDefault()
	}

	function handleDragStop(ev: MouseEvent) {
		left_panel_resize.removeEventListener('mousemove', handleDragMove)
		left_panel_resize.removeEventListener('mouseup', handleDragStop)

		ev.preventDefault()
	}

	left_panel_resize.addEventListener("mousemove", handleDragMove);
	left_panel_resize.addEventListener("mouseup", handleDragStop);

	ev.preventDefault()
})
*/

