const {findChildIndex} = require('../utils/findChildIndex')

function find(config, node, key, defaultValue = undefined) {
	const index = findChildIndex(config, node, key)
	if (index < 0) {
		return defaultValue
	}
	if (!node.terminalNode) {
		return find(config, config.api.read(node.children[index]), key, defaultValue)
	}
	// this is a bucket, buckets contain non ref children
	return node.children[index]
}

module.exports = {find}