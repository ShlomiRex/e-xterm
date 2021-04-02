import * as Split from 'split.js';


export function setup_split() {
	Split(['#left-panel', '#main-panel'], {
		sizes: [30, 75],
		minSize: [270, 300],
		gutterSize: 10,
		elementStyle(dim, es, gs, index): Partial<CSSStyleDeclaration> {
			let res = {
				"width": `calc(${es}%)`
			}
			return res
		},
		snapOffset: 0
	})
}