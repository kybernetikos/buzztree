const Node = require('../data/node')
const {findChildIndex} = require('../utils/findChildIndex')

function find(node, key, defaultValue = undefined) {
	if (node instanceof Node === false) {
		throw new Error(`Node to find in must be a node, was ${node}.`)
	}
	const index = findChildIndex(node, key)
	if (index < 0) {
		return defaultValue
	}
	if (!node.terminalNode) {
		return find(node.api.read(node.children[index]), key, defaultValue)
	}
	// this is a bucket, buckets contain non ref children
	return node.children[index]
}

module.exports = {find}