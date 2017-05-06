const {findIndex} = require('../utils/binarySearch')
const Bucket = require('../data/Bucket')
const InternalNode = require('../data/InternalNode')
const {findChildIndex} = require('../utils/findChildIndex')
const {store} = require('../operations/store')

function maxChildren(config, node) {
	return node.terminalNode ? config.bucket.maxChildren : config.node.maxChildren
}

function isOverful(config, node) {
	return node.children.length > maxChildren(config, node)
}

/*
 * Returns the passed node unchanged if it is not overful.  If the node is overful
 * it splits it in two (mutating it in the process), and then puts the left subtree
 * (made from the old node) and brand new right subtree in a new internal node and returns that.
 *
 * In the case that a split occurs, the returned node *has not be saved*, but its children have.
 */
function splitIfNecessary(config, node) {
	const {api} = config
	if (!isOverful(config, node)) {
		return node
	}
	const pivotIndex = Math.floor(node.keys.length / 2)
	const pivot = node.keys[pivotIndex]
	const newKeys = node.keys.splice(pivotIndex)
	let newRightNode
	if (node.terminalNode) {
		const newChildren = node.children.splice(pivotIndex)
		newRightNode = new Bucket(newKeys, newChildren, node.nextBucket, node.ref)
		store(config, newRightNode)
		node.nextBucket = newRightNode.ref

		if (newRightNode.nextBucket !== undefined) {
			const nextBucket = api.read(newRightNode.nextBucket)
			nextBucket.prevBucket = newRightNode.ref
			store(config, nextBucket)
		}
	} else {
		newKeys.shift()
		const newChildren = node.children.splice(pivotIndex + 1)
		newRightNode = new InternalNode(newKeys, newChildren)
		store(config, newRightNode)
	}
	store(config, node)
	return new InternalNode([pivot], [node.ref, newRightNode.ref])
}

function insert(config, node, key, value) {
	return node.terminalNode ? insertIntoBucket(config, node, key, value) : insertIntoNode(config, node, key, value)
}

function insertIntoBucket(config, bucket, key, value) {
	const index = findIndex(config.keyCompareFn, key, bucket.keys)
	if (index >= 0) {
		if (bucket.children[index] !== value) {
			bucket.children[index] = value
			store(config, bucket)
		}
		return bucket
	}
	bucket.keys.splice(-index-1, 0, key)
	bucket.children.splice(-index-1, 0, value)
	store(config, bucket)
	const result = splitIfNecessary(config, bucket)
	store(config, result)
	return result
}

function insertIntoNode(config, node, key, value) {
	const child = config.api.read(node.children[findChildIndex(config, node, key)])
	const result = insert(config, child, key, value)
	if (result === child) {
		return node
	}
	return mergeInsertionRemainder(config, node, result)
}

function mergeInsertionRemainder(config, node, insertionRemainder) {
	const {keys:[pivot], children:[left, right]} = insertionRemainder
	const index = findIndex(config.keyCompareFn, pivot, node.keys)
	node.keys.splice(-index-1, 0, pivot)
	node.children[-index-1] = left
	node.children.splice(-index, 0, right)
	const result = splitIfNecessary(config, node)
	store(config, result)
	return result
}

module.exports = {insert}