const binarySearch = require('../utils/binarySearch')
const Node = require('./Node')
const {findChildIndex} = require('../utils/findChildIndex')

class InternalNode extends Node {
	constructor(keys, children) {
		if (keys.length < 1 || children.length < 2) {
			throw new Error(`InternalNode must always have at least 2 children with one split key between them.  Had ${children.length} children and ${keys.length} split keys.`)
		}
		if (keys.length !== children.length - 1) {
			throw new Error(`With ${children.length} children, there should be ${children.length - 1} split points, there were ${keys.length}.`)
		}
		super(keys, children)
		this.terminalNode = false
	}

	toString() {
		return '[ ref' + this.children[0] + ' ' + this.keys.map((k, i) => `<${k}> ref${this.children[i + 1]}`).join(' ') + ' ]'
	}
}

module.exports = InternalNode