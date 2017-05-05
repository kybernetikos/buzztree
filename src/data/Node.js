class Node {
	constructor(keys, children) {
		Object.assign(this, {ref: undefined, keys, children})
	}

	//noinspection JSUnusedGlobalSymbols
	*iterator(config) {
		yield* this.rangeIterator(config)
	}

	store({api}) {
		if (this.ref === undefined) {
			this.ref = api.create(this)
		} else {
			api.update(this.ref, this)
		}
		return this.ref
	}
}

module.exports = Node