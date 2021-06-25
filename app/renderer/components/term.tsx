import * as React from 'react';
import { XTerm } from 'xterm-for-react'

class MyTerm extends React.Component {
	xtermRef: React.RefObject<any>;
	constructor(props: {} | Readonly<{}>) {
		super(props)

		// Create a ref
		this.xtermRef = React.createRef()
	}

	componentDidMount() {
		// Once the terminal is loaded write a new line to it.
		this.xtermRef.current.terminal.writeln('Hello, World!')
	}

	render() {
		return (
			<>
				{/* Create a new terminal and set it's ref. */}
				<XTerm ref={this.xtermRef} />
			</>
		)
	}
}

export default MyTerm;