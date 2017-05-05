const api = require('../apis/json')
const Bucket = require('../data/bucket')
const Node = require('../data/internalNode')
const {insert} = require('../operations/insert')

function numCompare(a, b) {
	return a - b
}
function n(keys = [], children = []) {
	const result = new Node(api, 2, 4, numCompare, keys, children.map((x) => x.ref))
	result.store()
	return result
}
function b(kvs, next) {
	const result = new Bucket(api, 1, 3, numCompare, kvs.map((x) => x.key), kvs.map((x) => x.value), next ? next.ref : undefined)
	result.store()
	return result
}
function kv(key, value = key) {
	return {key, value}
}

function insertSomeData(tree) {
	tree = insert(tree, 3, 'three')
	tree = insert(tree, 1, 'one')
	tree = insert(tree, 10, 'ten')
	tree = insert(tree, 7, 'seven')
	tree = insert(tree, 2, 'two')
	tree = insert(tree, 90, 'ninety')
	tree = insert(tree, 6, 'six')
	tree = insert(tree, 8, 'eight')
	tree = insert(tree, 80, 'eighty')
	tree = insert(tree, 85, 'eighty-five')
	tree = insert(tree, 86, 'eighty-six')
	tree = insert(tree, 87, 'eighty-seven')
	tree = insert(tree, 88, 'eighty-eight')
	tree = insert(tree, 25, 'twenty-five')
	tree = insert(tree, 9, 'nine')
	tree = insert(tree, 52, 'fifty-two')
	tree = insert(tree, 53, 'fifty-three')
	tree = insert(tree, 54, 'fifty-four')
	tree = insert(tree, 55, 'fifty-five')
	tree = insert(tree, 56, 'fifty-six')
	tree = insert(tree, 57, 'fifty-seven')

	return tree
}

function binder(thing) {
	return new Proxy(thing, {
		get(target, property) {
			const result = target[property]
			return (typeof result === 'function') ? result.bind(thing) : result
		}
	})
}

module.exports = {n, b, kv, numCompare, insertSomeData, binder}