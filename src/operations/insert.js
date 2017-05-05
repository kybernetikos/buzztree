const findIndex = require('../utils/binarySearch')
const Bucket = require('../data/Bucket')
const InternalNode = require('../data/InternalNode')
const Node = require('../data/Node')
const {findChildIndex} = require('../utils/findChildIndex')

function isOverful(node) {
	if (node instanceof Node === false) {
		throw new Error("node is of wrong type " + node)
	}
	return node.children.length > node.maxChildren
}

/*
 * Returns the passed node unchanged if it is not overful.  If the node is overful
 * it splits it in two (mutating it in the process), and then puts the left subtree
 * (made from the old node) and brand new right subtree in a new internal node and returns that.
 *
 * In the case that a split occurs, the returned node *has not be saved*, but its children have.
 */
function splitIfNecessary(api, node) {
	if (!isOverful(node)) {
		return node
	}
	const pivotIndex = Math.floor(node.keys.length / 2)
	const pivot = node.keys[pivotIndex]
	const newKeys = node.keys.splice(pivotIndex)
	let newRightNode
	if (node.terminalNode) {
		const newChildren = node.children.splice(pivotIndex)
		newRightNode = new Bucket(node.minChildren, node.maxChildren, node.keyCompareFn, newKeys, newChildren, node.nextBucket, node.ref)
		newRightNode.store(api)
		node.nextBucket = newRightNode.ref

		if (newRightNode.nextBucket !== undefined) {
			const nextBucket = api.read(newRightNode.nextBucket)
			nextBucket.prevBucket = newRightNode.ref
			nextBucket.store(api)
		}
	} else {
		newKeys.shift()
		const newChildren = node.children.splice(pivotIndex + 1)
		newRightNode = new InternalNode(node.minChildren, node.maxChildren, node.keyCompareFn, newKeys, newChildren)
		newRightNode.store(api)
	}
	node.store(api)
	return new InternalNode(node.minChildren, node.maxChildren, node.keyCompareFn, [pivot], [node.ref, newRightNode.ref])
}

function insert(api, node, key, value) {
	return node.terminalNode ? insertIntoBucket(api, node, key, value) : insertIntoNode(api, node, key, value)
}

function insertIntoBucket(api, bucket, key, value) {
	const index = findIndex(bucket.keyCompareFn, key, bucket.keys)
	if (index >= 0) {
		bucket.children[index] = value
		bucket.store()
		return bucket
	}
	bucket.keys.splice(-index-1, 0, key)
	bucket.children.splice(-index-1, 0, value)
	const result = splitIfNecessary(api, bucket)
	result.store(api)
	return result
}

function insertIntoNode(api, node, key, value) {
	const child = api.read(node.children[findChildIndex(node, key)])
	const result = insert(api, child, key, value)
	if (result === child) {
		return node
	}
	return mergeInsertionRemainder(api, node, result)
}

function mergeInsertionRemainder(api, node, insertionRemainder) {
	const {keys:[pivot], children:[left, right]} = insertionRemainder
	const index = findIndex(node.keyCompareFn, pivot, node.keys)
	node.keys.splice(-index-1, 0, pivot)
	node.children[-index-1] = left
	node.children.splice(-index, 0, right)
	const result = splitIfNecessary(api, node)
	result.store(api)
	return result
}

module.exports = {insert}