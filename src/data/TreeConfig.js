function isFunction(fn) {
	return typeof fn === 'function'
}

class TreeConfig {
	constructor(api, keyCompareFn, maxNodeChildren) {
		if (!isFunction(keyCompareFn)) {
			throw new Error(`Key compare fn must be a function, was a ${typeof keyCompareFn}.`)
		}
		if (!isFunction(api.create) || !isFunction(api.remove) || !isFunction(api.update) || !isFunction(api.read)) {
			throw new Error(`The api must provide functions for create/update/read/remove, actually provided ${Object.keys(api).join(", ")}.`)
		}
		if (typeof maxNodeChildren !== 'number' || maxNodeChildren <= 1) {
			throw new Error(`maxNodeChildren must be a number greater than 1, was ${maxNodeChildren}.`)
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