export interface SSHSession {
	// Internal ID, used for keeping track of bookmarks
	uuid: string 

	//Everything else is settings
	protocol: string,
	remote_host: string,
	username: string,
	port: number,
	session_name: string,
	session_description: string
	x11_forwarding: boolean,
	compression: boolean
};