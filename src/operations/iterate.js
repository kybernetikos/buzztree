const {findChildIndex} = require('../utils/findChildIndex')
const {findIndex} = require('../utils/binarySearch')

function* iterate(config, node, minKey, maxKey) {
	if (node.terminalNode === false) {
		const index = minKey === undefined ? 0 : findChildIndex(config, node, minKey)
		yield* iterate(config, config.api.read(node.children[index]), minKey, maxKey)
	} else {
		let fromIdx = minKey !== undefined ? findIndex(config.keyCompareFn, minKey, node.keys) : 0
		if (fromIdx < 0) {
			fromIdx = -fromIdx-1
		}
		let done = false
		for (let i = fromIdx; i < node.keys.length; ++i) {
			const currentKey = node.keys[i]
			if (maxKey === undefined || config.keyCompareFn(currentKey, maxKey) <= 0) {
				yield [currentKey, node.children[i]]
			} else {
				done = true
				break
			}
		}
		if (node.nextBucket !== undefined && !done) {
			yield* iterate(config, config.api.read(node.nextBucket), undefined, maxKey)
		}
	}
}

function* reverseIterate(config, node, startKey, endKey) {
	if (node.terminalNode === false) {
		const index = startKey === undefined ? node.children.length - 1 : findChildIndex(config, node, startKey)
		yield* reverseIterate(config, config.api.read(node.children[index]), startKey, endKey)
	} else {
		let fromIdx = startKey !== undefined ? findIndex(config.keyCompareFn, startKey, node.keys) : node.children.length - 1
		if (fromIdx < 0) {
			fromIdx = -fromIdx-1
		}
		let done = false
		for (let i = fromIdx; i >= 0; --i) {
			const currentKey = node.keys[i]
			if (endKey === undefined || config.keyCompareFn(currentKey, endKey) >= 0) {
				yield [currentKey, node.children[i]]
			} else {
				done = true
				break
			}
		}
		if (node.prevBucket !== undefined && !done) {
			yield* reverseIterate(config, config.api.read(node.prevBucket), undefined, endKey)
		}
	}
}

module.exports = {iterate, reverseIterate}