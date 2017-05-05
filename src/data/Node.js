class Node {
	constructor(minChildren, maxChildren, keyCompareFn, keys, children) {
		Object.assign(this, {ref: undefined, minChildren, maxChildren, keyCompareFn, keys, children})
	}

	//noinspection JSUnusedGlobalSymbols
	*iterator(api) {
		yield* this.rangeIterator(api)
	}

	store(api) {
		if (this.ref === undefined) {
			this.ref = api.create(this)
		} else {
			api.update(this.ref, this)
		}
		return this.ref
	}
}

module.exports = Node