class Node {
	constructor(api, minChildren, maxChildren, keyCompareFn, keys, children) {
		Object.assign(this, {api, ref: undefined, minChildren, maxChildren, keyCompareFn, keys, children})
		if (!api) {
			throw new Error("API MUST BE SET")
		}
	}

	*[Symbol.iterator]() {
		yield* this.rangeIterator()
	}

	*rangeIterator() {
		throw new Error("Range iterator should be implemented by a subclass")
	}

	store() {
		if (this.ref === undefined) {
			this.ref = this.api.create(this)
		} else {
			this.api.update(this.ref, this)
		}
		return this.ref
	}
}

module.exports = Node