class TreeConfig {
	constructor(api, keyCompareFn, maxNodeChildren) {
		if (typeof keyCompareFn !== 'function') {
			throw new Error(`Key compare fn must be a function, was a ${typeof keyCompareFn}.`)
		}
		Object.assign(this, {
			api, keyCompareFn,
			bucket: {
				minChildren: Math.ceil(maxNodeChildren / 2) - 1,
				maxChildren: maxNodeChildren - 1
			},
			node: {
				minChildren: Math.ceil(maxNodeChildren / 2),
				maxChildren: maxNodeChildren
			}
		})
	}
}

module.exports = TreeConfig