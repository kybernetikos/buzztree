const binarySearch = require('../utils/binarySearch')
const Node = require('./Node')

class Bucket extends Node {
	constructor(keys = [], children = [], nextBucket, prevBucket) {
		if (!Array.isArray(keys) || !Array.isArray(children)) {
			throw new Error(`Keys and children must be arrays, keys was ${keys} and values was ${children}.`)
		}
		if (keys.length !== children.length) {
			throw new Error(`There must be the same number of values as keys, there were ${keys.length} keys and ${children.length} values.`)
		}
		super(keys, children)
		Object.assign(this, {nextBucket, prevBucket, terminalNode: true})
	}

	resetData(keys = [], children = [], nextBucket = this.nextBucket, prevBucket = this.prevBucket) {
		Object.assign(this, {keys, children, nextBucket, prevBucket})
	}

	*rangeIterator(config, minKey, maxKey) {
		let fromIdx = minKey !== undefined ? binarySearch(config.keyCompareFn, minKey, this.keys) : 0
		if (fromIdx < 0) {
			fromIdx = -fromIdx-1
		}
		let done = false
		for (let i = fromIdx; i < this.keys.length; ++i) {
			const currentKey = this.keys[i]
			if (maxKey === undefined || config.keyCompareFn(currentKey, maxKey) <= 0) {
				yield [currentKey, this.children[i]]
			} else {
				done = true
				break
			}
		}
		if (this.nextBucket !== undefined && !done) {
			yield* config.api.read(this.nextBucket).rangeIterator(config, undefined, maxKey)
		}
	}

	toString() {
		return '[ ' + this.keys.map((key, i) => `${key}: ${this.children[i]}`).join(", ") + ' ]'
	}
}

module.exports = Bucket