const binarySearch = require('../utils/binarySearch')
const Node = require('./node')
const {findChildIndex} = require('../utils/findChildIndex')

class InternalNode extends Node {
	constructor(api, minChildren, maxChildren, keyCompareFn, keys, children) {
		if (!Array.isArray(keys) || !Array.isArray(children)) {
			throw new Error(`Keys and children must be arrays, keys was ${keys} and values was ${children}.`)
		}
		if (keys.length < 1 || children.length < 2) {
			throw new Error(`Node must always have at least 2 children with one split key between them.  Had ${children.length} children and ${keys.length} split keys.`)
		}
		if (keys.length !== children.length - 1) {
			throw new Error(`With ${children.length} children, there should be ${children.length - 1} split points, there were ${keys.length}.`)
		}
		if (typeof keyCompareFn !== 'function') {
			throw new Error(`Key compare fn must be a function, was a ${typeof keyCompareFn}.`)
		}
		super(api, minChildren, maxChildren, keyCompareFn, keys, children)
		this.terminalNode = false
	}

	resetData(keys, children) {
		Object.assign(this, {keys, children})
	}

	*rangeIterator(minKey, maxKey) {
		const index = minKey === undefined ? 0 : findChildIndex(this, minKey)
		yield* this.api.read(this.children[index]).rangeIterator(minKey, maxKey)
	}

	toString() {
		return '[ ref' + this.children[0] + ' ' + this.keys.map((k, i) => `<${k}> ref${this.children[i + 1]}`).join(' ') + ' ]'
	}
}

module.exports = InternalNode