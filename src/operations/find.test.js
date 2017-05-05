const {find} = require('./find')
const {test} = require('ava')
const {n, b, kv, binder, config} = require('../utils/testutils')

test('b-tree.find can find items that are in a really simple tree', (t) => {
	const {is} = binder(t)

	const b3 = b([kv(9, 'nine'), kv(100, 'hundred')])
	const b2 = b([kv(3, 'three'), kv(6, 'six'), kv(7, 'seven')], b3)
	const b1 = b([kv(2, 'two')], b2)

	const smallTree = n([3, 9], [b1, b2, b3])

	is(find(config, smallTree, 1), undefined)
	is(find(config, smallTree, 2), 'two')
	is(find(config, smallTree, 3), 'three')
	is(find(config, smallTree, 8), undefined)
	is(find(config, smallTree, 9), 'nine')
})