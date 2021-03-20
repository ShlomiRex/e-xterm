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
	compression: boolean,
	private_key: boolean,
	private_key_path?: string
};

export interface WSLSession {
	// Internal ID, used for keeping track of bookmarks
	uuid: string 

	//Everything else is settings
	protocol: string,
	distro: string,
	session_name: string,
	session_description: string
}
