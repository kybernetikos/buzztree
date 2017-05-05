const findIndex = require('../utils/binarySearch')
const Bucket = require('../data/Bucket')
const InternalNode = require('../data/InternalNode')
const Node = require('../data/Node')
const {findChildIndex} = require('../utils/findChildIndex')

function maxChildren(config, node) {
	return node.terminalNode ? config.bucket.maxChildren : config.node.maxChildren
}

function isOverful(config, node) {
	if (node instanceof Node === false) {
		throw new Error("node is of wrong type " + node)
	}
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
		newRightNode.store(config)
		node.nextBucket = newRightNode.ref

		if (newRightNode.nextBucket !== undefined) {
			const nextBucket = api.read(newRightNode.nextBucket)
			nextBucket.prevBucket = newRightNode.ref
			nextBucket.store(config)
		}
	} else {
		newKeys.shift()
		const newChildren = node.children.splice(pivotIndex + 1)
		newRightNode = new InternalNode(newKeys, newChildren)
		newRightNode.store(config)
	}
	node.store(config)
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
			bucket.store(config)
		}
		return bucket
	}
	bucket.keys.splice(-index-1, 0, key)
	bucket.children.splice(-index-1, 0, value)
	const result = splitIfNecessary(config, bucket)
	result.store(config)
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
	result.store(config)
	return result
}

module.exports = {insert}