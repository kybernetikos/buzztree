const Node = require('../data/Node')
const {findChildIndex} = require('../utils/findChildIndex')

function find(api, node, key, defaultValue = undefined) {
	if (node instanceof Node === false) {
		throw new Error(`Node to find in must be a node, was ${node}.`)
	}
	const index = findChildIndex(node, key)
	if (index < 0) {
		return defaultValue
	}
	if (!node.terminalNode) {
		return find(api, api.read(node.children[index]), key, defaultValue)
	}
	// this is a bucket, buckets contain non ref children
	return node.children[index]
}

module.exports = {find}