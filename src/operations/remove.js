const {findIndex} = require('../utils/binarySearch')
const {findChildIndex} = require('../utils/findChildIndex')
const {store} = require('../operations/store')

/**
 * Modifies a bucket by removing a key/value from it.
 * Returns the passed bucket.
 */
function removeFromBucket(config, bucket, key) {
	const index = findIndex(config.keyCompareFn, key, bucket.keys)
	if (index >= 0) {
		bucket.keys.splice(index, 1)
		bucket.children.splice(index, 1)
	}
	store(config, bucket)
	return bucket
}

const BALANCE = {}, MERGE = {}

function minChildren(config, node) {
	return node.terminalNode ? config.bucket.minChildren : config.node.minChildren
}

/**
 * Chooses a sibling, to balance across if possible, or to merge if balancing is not
 * possible.
 * Does not mutate anything.
 */
function selectChildAndSiblingForMerging(config, node, childIndex) {
	let result = {}
	if (childIndex > 0) {
		const leftSib = config.api.read(node.children[childIndex - 1])
		const rightSib = config.api.read(node.children[childIndex])
		const totalChildren = rightSib.children.length + leftSib.children.length
		const minAcrossBoth = minChildren(config, rightSib) + minChildren(config, leftSib)
		result = {
			action: totalChildren >= minAcrossBoth ? BALANCE : MERGE,
			index: childIndex - 1,
			left: leftSib,
			pivot: node.keys[childIndex - 1],
			right: rightSib
		}
	}
	if (!(result && result.action === BALANCE) && childIndex < (node.children.length - 1)) {
		const leftSib = config.api.read(node.children[childIndex])
		const rightSib = config.api.read(node.children[childIndex + 1])
		const totalChildren = leftSib.children.length + rightSib.children.length
		const minAcrossBoth = minChildren(config, rightSib) + minChildren(config, leftSib)
		result = {
			action: totalChildren >= minAcrossBoth ? BALANCE : MERGE,
			index: childIndex,
			left: leftSib,
			pivot: node.keys[childIndex],
			right: rightSib
		}
	}
	return result
}

function isUnderful(config, node) {
	return node.children.length < minChildren(config, node)
}

/**
 * Removes a value from a (sub)tree making all the changes necessary to keep the tree
 * invariants.
 * Returns either the passed subtree root or, if there is only a single child that child.
 */
function removeFromNode(config, node, key) {
	let childIndex = findChildIndex(config, node, key);
	let child = config.api.read(node.children[childIndex])

	child = remove(config, child, key)
	node.children[childIndex] = child.ref

	if (isUnderful(config, child)) {
		const richSibling = selectChildAndSiblingForMerging(config, node, childIndex)
		if (richSibling.action === BALANCE) {
			const {index, left:leftSib, pivot:pivotBefore, right:rightSib} = richSibling
			const {pivot} = balance(config, leftSib, pivotBefore, rightSib)
			node.keys[index] = pivot
		} else if (richSibling.action === MERGE) {
			const {index, left:leftSib, pivot:pivotBefore, right:rightSib} = richSibling
			merge(config, leftSib, pivotBefore, rightSib)
			node.children.splice(index + 1, 1)
			node.keys.splice(index, 1)
		} else {
			throw new Error('Assertion Error: unable to choose an action MERGE/BALANCE.')
		}
		store(config, node)
	}

	// I'm worried that this might be wrong.  Under what circumstances should
	// we unwrap a child?  Is it always when there is only one of them?
	if (!node.terminalNode && node.children.length === 1) {
		config.api.remove(node.ref)
		return config.api.read(node.children[0])
	}
	return node
}

function remove(config, node, key) {
	if (node.terminalNode) {
		return removeFromBucket(config, node, key)
	} else {
		return removeFromNode(config, node, key)
	}
}

/**
 * merges two nodes together.  Afterward, all the
 * keys and children are in the node and sibling is no longer needed.
 */
function merge(config, node, splitPoint, sibling) {
	node.children = node.children.concat(sibling.children)
	if (node.terminalNode) {
		node.keys = node.keys.concat(sibling.keys)
		node.nextBucket = sibling.nextBucket

		const nextRef = sibling.nextBucket
		if (nextRef !== undefined) {
			const newNext = config.api.read(nextRef)
			newNext.prevBucket = node.ref
			store(config, newNext)
		}
	} else {
		node.keys = node.keys.concat(splitPoint, sibling.keys)
	}
	store(config, node)
	config.api.remove(sibling.ref)
}

/**
 * Tries to split the children across two nodes evenly.
 * Mutates both children.
 */
function balance(config, node, splitPoint, sibling) {
	const allChildren = node.children.slice().concat(sibling.children)
	let middle = Math.floor(allChildren.length / 2)
	let allKeys
	if (node.terminalNode) {
		allKeys = node.keys.slice().concat(sibling.keys)
		Object.assign(node, {
			keys: allKeys.slice(0, middle),
			children: allChildren.slice(0, middle),
			nextBucket: sibling.ref
		})
		Object.assign(sibling, {
			keys: allKeys.slice(middle),
			children: allChildren.slice(middle),
			nextBucket: sibling.nextBucket
		})
	} else {
		allKeys = node.keys.slice().concat(splitPoint, sibling.keys)
		middle = Math.floor(allKeys.length / 2)
		Object.assign(node, {
			keys: allKeys.slice(0, middle),
			children: allChildren.slice(0, middle + 1)
		})
		Object.assign(sibling, {
			keys: allKeys.slice(middle + 1),
			children: allChildren.slice(middle + 1)
		})
	}
	store(config, node)
	store(config, sibling)
	return {left: node, pivot: allKeys[middle], right: sibling}
}

module.exports = {
	remove, balance
}