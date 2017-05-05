const binarySearch = require('../utils/binarySearch')
const Node = require('./Node')

class Bucket extends Node {
	constructor(keys = [], children = [], nextBucket = undefined, prevBucket = undefined) {
		if (keys.length !== children.length) {
			throw new Error(`There must be the same number of values as keys, there were ${keys.length} keys and ${children.length} values.`)
		}
		super(keys, children)
		Object.assign(this, {nextBucket, prevBucket, terminalNode: true})
	}

	toString() {
		return '[ ' + this.keys.map((key, i) => `${key}: ${this.children[i]}`).join(", ") + ' ]'
	}
}

module.exports = Bucket