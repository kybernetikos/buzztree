const api = require('../apis/json')
const Bucket = require('../data/Bucket')
const Node = require('../data/InternalNode')
const {insert} = require('../operations/insert')
const TreeConfig = require('../data/TreeConfig')

const config = new TreeConfig(api, numCompare, 4)

function numCompare(a, b) {
	return a - b
}
function n(keys = [], children = []) {
	const result = new Node(keys, children.map((x) => x.ref))
	result.store(config)
	return result
}
function b(kvs, next) {
	const result = new Bucket(kvs.map((x) => x.key), kvs.map((x) => x.value), next ? next.ref : undefined)
	result.store(config)
	return result
}
function kv(key, value = key) {
	return {key, value}
}

function insertSomeData(config, tree) {
	tree = insert(config, tree, 3, 'three')
	tree = insert(config, tree, 1, 'one')
	tree = insert(config, tree, 10, 'ten')
	tree = insert(config, tree, 7, 'seven')
	tree = insert(config, tree, 2, 'two')
	tree = insert(config, tree, 90, 'ninety')
	tree = insert(config, tree, 6, 'six')
	tree = insert(config, tree, 8, 'eight')
	tree = insert(config, tree, 80, 'eighty')
	tree = insert(config, tree, 85, 'eighty-five')
	tree = insert(config, tree, 86, 'eighty-six')
	tree = insert(config, tree, 87, 'eighty-seven')
	tree = insert(config, tree, 88, 'eighty-eight')
	tree = insert(config, tree, 25, 'twenty-five')
	tree = insert(config, tree, 9, 'nine')
	tree = insert(config, tree, 52, 'fifty-two')
	tree = insert(config, tree, 53, 'fifty-three')
	tree = insert(config, tree, 54, 'fifty-four')
	tree = insert(config, tree, 55, 'fifty-five')
	tree = insert(config, tree, 56, 'fifty-six')
	tree = insert(config, tree, 57, 'fifty-seven')

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

module.exports = {n, b, kv, numCompare, insertSomeData, binder, config}