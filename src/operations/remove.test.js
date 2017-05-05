const {balance, remove} = require('./remove')
const {find} = require('./find')
const {test} = require('ava')
const {n, b, kv, insertSomeData, binder, api} = require('../utils/testutils')

test("Balancing between nodes works",(t) => {
	const {deepEqual:eq} = binder(t)

	const b1 = b([kv(20, 'twenty')])
	const b2 = b([kv(15, 'fifteen')], b1)
	const b3 = b([kv(12, 'twelve')], b2)
	const b4 = b([kv(10, 'ten')], b3)
	const b5 = b([kv(5, 'five')], b4)
	const b6 = b([kv(1, 'one')], b5)

	let leftSib = n([5, 10, 12], [b6, b5, b4, b3])
	let rightSib = n([20], [b2, b1])

	const smallTree = n(
		[15],
		[ leftSib , rightSib ]
	)

	balance(api, leftSib, 15, rightSib)

	eq(Array.from(smallTree.iterator(api)), [[1, 'one'], [5, 'five'], [10, 'ten'], [12, 'twelve'], [15, 'fifteen'], [20, 'twenty']])
	eq(leftSib.children.length, 3)
	eq(rightSib.children.length, 3)
})

test("Balancing between buckets works",(t) => {
	const {deepEqual:eq} = binder(t)
	const b3 = b([kv(9, 'nine'), kv(100, 'hundred')])
	const b2 = b([kv(3, 'three'), kv(6, 'six'), kv(7, 'seven')], b3)
	const b1 = b([kv(2, 'two')], b2)

	const smallTree = n([3, 9], [b1, b2, b3])
	const smallTreeEntries = [[2, 'two'], [3, 'three'], [6, 'six'], [7, 'seven'], [9, 'nine'], [100, 'hundred']]

	const {left, pivot, right} = balance(api, b1, 3, b2)
	smallTree.keys[0] = pivot

	eq(left.children, ['two', 'three'])
	eq(left.keys, [2, 3])
	eq(pivot, 6)
	eq(right.children, ['six', 'seven'])
	eq(right.keys, [6, 7])
	eq(Array.from(smallTree.iterator(api)), smallTreeEntries)
})

test("balance two buckets of same size keeps them the same", (t) => {
	const {deepEqual:eq} = binder(t)
	const {left, pivot, right} = balance(api, b([kv(1, 'one')]), 2, b([kv(2, 'two')]))

	eq(left.keys, [1])
	eq(left.children, ['one'])
	eq(right.keys, [2])
	eq(right.children, ['two'])
	eq(pivot, 2)
})

test("balance an empty bucket with a bucket of size 2 divides the values evenly", (t) => {
	const {deepEqual:eq} = binder(t)
	const {left, pivot, right} = balance(api, b([]), 0, b([kv(1, 'one'), kv(2, 'two')]))

	eq(left.keys, [1])
	eq(left.children, ['one'])
	eq(right.keys, [2])
	eq(right.children, ['two'])
	eq(pivot, 2)
})

test("balance a bucket of size 2 with an empty bucket divides the values evenly", (t) => {
	const {deepEqual:eq} = binder(t)
	const {left, pivot, right} = balance(api, b([kv(1, 'one'), kv(2, 'two')]), 4, b([]))

	eq(left.keys, [1])
	eq(left.children, ['one'])
	eq(right.keys, [2])
	eq(right.children, ['two'])
	eq(pivot, 2)
})

test("Deletion", (t) => {
	const [is, eq] = [t.is.bind(t), t.deepEqual.bind(t)]
	const b3 = b([kv(9, 'nine'), kv(100, 'hundred')])
	const b2 = b([kv(3, 'three'), kv(6, 'six'), kv(7, 'seven')], b3)
	const b1 = b([kv(2, 'two')], b2)

	let smallTree = n([3, 9], [b1, b2, b3])

	smallTree = remove(api, smallTree, 9)
	eq(Array.from(smallTree.iterator(api)), [[2, 'two'], [3, 'three'], [6, 'six'], [7, 'seven'], [100, 'hundred']])

	smallTree = remove(api, smallTree, 3)
	eq(Array.from(smallTree.iterator(api)), [[2, 'two'], [6, 'six'], [7, 'seven'], [100, 'hundred']])

	smallTree = remove(api, smallTree, 2)
	eq(Array.from(smallTree.iterator(api)), [[6, 'six'], [7, 'seven'], [100, 'hundred']])

	smallTree = remove(api, smallTree, 100)
	eq(Array.from(smallTree.iterator(api)), [[6, 'six'], [7, 'seven']])

	smallTree = remove(api, smallTree, 6)
	eq(Array.from(smallTree.iterator(api)), [[7, 'seven']])

	smallTree = remove(api, smallTree, 7)
	eq(Array.from(smallTree.iterator(api)), [])

	smallTree = remove(api, smallTree, 99)
	eq(Array.from(smallTree.iterator(api)), [])

	smallTree = insertSomeData(api, smallTree)

	smallTree = remove(api, smallTree, 7)
	smallTree = remove(api, smallTree, 88)
	smallTree = remove(api, smallTree, 11)

	is(find(api, smallTree, 0), undefined)
	is(find(api, smallTree, 1), 'one')
	is(find(api, smallTree, 2), 'two')
	is(find(api, smallTree, 7), undefined)
	is(find(api, smallTree, 8), 'eight')
	is(find(api, smallTree, 11), undefined)
	is(find(api, smallTree, 88), undefined)
})