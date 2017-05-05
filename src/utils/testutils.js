const api = require('../apis/json')
const Bucket = require('../data/bucket')
const Node = require('../data/internalNode')
const {insert} = require('../operations/insert')

function numCompare(a, b) {
	return a - b
}
function n(keys = [], children = []) {
	const result = new Node(2, 4, numCompare, keys, children.map((x) => x.ref))
	result.store(api)
	return result
}
function b(kvs, next) {
	const result = new Bucket(1, 3, numCompare, kvs.map((x) => x.key), kvs.map((x) => x.value), next ? next.ref : undefined)
	result.store(api)
	return result
}
function kv(key, value = key) {
	return {key, value}
}

function insertSomeData(api, tree) {
	tree = insert(api, tree, 3, 'three')
	tree = insert(api, tree, 1, 'one')
	tree = insert(api, tree, 10, 'ten')
	tree = insert(api, tree, 7, 'seven')
	tree = insert(api, tree, 2, 'two')
	tree = insert(api, tree, 90, 'ninety')
	tree = insert(api, tree, 6, 'six')
	tree = insert(api, tree, 8, 'eight')
	tree = insert(api, tree, 80, 'eighty')
	tree = insert(api, tree, 85, 'eighty-five')
	tree = insert(api, tree, 86, 'eighty-six')
	tree = insert(api, tree, 87, 'eighty-seven')
	tree = insert(api, tree, 88, 'eighty-eight')
	tree = insert(api, tree, 25, 'twenty-five')
	tree = insert(api, tree, 9, 'nine')
	tree = insert(api, tree, 52, 'fifty-two')
	tree = insert(api, tree, 53, 'fifty-three')
	tree = insert(api, tree, 54, 'fifty-four')
	tree = insert(api, tree, 55, 'fifty-five')
	tree = insert(api, tree, 56, 'fifty-six')
	tree = insert(api, tree, 57, 'fifty-seven')

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

module.exports = {n, b, kv, numCompare, insertSomeData, binder, api}