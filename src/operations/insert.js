const findIndex = require('../utils/binarySearch')
const Bucket = require('../data/bucket')
const InternalNode = require('../data/internalNode')
const {findChildIndex} = require('../utils/findChildIndex')

function isOverful(node) {
	return node.children.length > node.maxChildren
}

/*
 * Returns the passed node unchanged if it is not overful.  If the node is overful
 * it splits it in two (mutating it in the process), and then puts the left subtree
 * (made from the old node) and brand new right subtree in a new internal node and returns that.
 *
 * In the case that a split occurs, the returned node *has not be saved*, but its children have.
 */
function splitIfNecessary(node) {
	if (!isOverful(node)) {
		return node
	}
	const pivotIndex = Math.floor(node.keys.length / 2)
	const pivot = node.keys[pivotIndex]
	const newKeys = node.keys.splice(pivotIndex)
	let newRightNode
	if (node.terminalNode) {
		const newChildren = node.children.splice(pivotIndex)
		newRightNode = new Bucket(node.api, node.minChildren, node.maxChildren, node.keyCompareFn, newKeys, newChildren, node.nextBucket, node.ref)
		newRightNode.store()
		node.nextBucket = newRightNode.ref

		if (newRightNode.nextBucket !== undefined) {
			const nextBucket = node.api.read(newRightNode.nextBucket)
			nextBucket.prevBucket = newRightNode.ref
			nextBucket.store()
		}
	} else {
		newKeys.shift()
		const newChildren = node.children.splice(pivotIndex + 1)
		newRightNode = new InternalNode(node.api, node.minChildren, node.maxChildren, node.keyCompareFn, newKeys, newChildren)
		newRightNode.store()
	}
	node.store()
	return new InternalNode(node.api, node.minChildren, node.maxChildren, node.keyCompareFn, [pivot], [node.ref, newRightNode.ref])
}

function insert(node, key, value) {
	return node.terminalNode ? insertIntoBucket(node, key, value) : insertIntoNode(node, key, value)
}

function insertIntoBucket(bucket, key, value) {
	const index = findIndex(bucket.keyCompareFn, key, bucket.keys)
	if (index >= 0) {
		bucket.children[index] = value
		bucket.store()
		return bucket
	}
	bucket.keys.splice(-index-1, 0, key)
	bucket.children.splice(-index-1, 0, value)
	const result = splitIfNecessary(bucket)
	result.store()
	return result
}

function insertIntoNode(node, key, value) {
	const child = node.api.read(node.children[findChildIndex(node, key)])
	const result = insert(child, key, value)
	if (result === child) {
		return node
	}
	return mergeInsertionRemainder(node, result)
}

function mergeInsertionRemainder(node, insertionRemainder) {
	const {keys:[pivot], children:[left, right]} = insertionRemainder
	const index = findIndex(node.keyCompareFn, pivot, node.keys)
	node.keys.splice(-index-1, 0, pivot)
	node.children[-index-1] = left
	node.children.splice(-index, 0, right)
	const result = splitIfNecessary(node)
	result.store()
	return result
}

module.exports = {insert}