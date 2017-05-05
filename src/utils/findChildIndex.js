const findIndex = require('./binarySearch')
const Node = require('../data/Node')

function findChildIndex(config, node, key) {
	if (node instanceof Node === false) {
		throw new Error('node must be a node, was ' + node)
	}
	let i = findIndex(config.keyCompareFn, key, node.keys)
	if (node.terminalNode) {
		return i
	}
	const foundExactMatch = i >= 0
	const rightSubtree = i + 1
	const leftSubtree = -i - 1
	return foundExactMatch ? rightSubtree : leftSubtree
}

module.exports = {findChildIndex}