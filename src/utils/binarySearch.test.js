const {test} = require('ava')
const {findIndex} = require('./binarySearch')
const {binder} = require('./testutils')

function numCompare(a, b) {
	return a - b
}

test((t) => {
	const {is} = binder(t)

	const testData = [ 2, 3, 4, 5, 9, 9, 9, 22, 23, 78, 100 ]

	is(findIndex(numCompare, 100, testData), 10)
	is(findIndex(numCompare, 101, testData), -12)
	is(findIndex(numCompare, 99, testData), -11)
	is(findIndex(numCompare, 1, testData), -1)
	is(findIndex(numCompare, 2, testData), 0)
	is(findIndex(numCompare, 3, testData), 1)
	is(findIndex(numCompare, 7, testData), -5)

	is(findIndex(numCompare, 4, []), -1)
	is(findIndex(numCompare, 0, []), -1)

	is(findIndex(numCompare, 3, testData, 2), -3)
})

test((t) => {
	const is = t.is.bind(t)

	const testData = [ 2, 3, 4, 5, 9, 9, 9, 22, 23, 78, 100 ]

	const numSearch = findIndex(numCompare)
	const find99 = findIndex(numCompare, 99)

	is(numSearch(100, testData), 10)
	is(numSearch(101, testData), -12)
	is(find99(testData), -11)
	is(numSearch(1, testData), -1)
	is(numSearch(2, testData), 0)
	is(numSearch(3, testData), 1)
	is(numSearch(7, testData), -5)

	is(numSearch(4, []), -1)
	is(numSearch(0, []), -1)

	is(numSearch(3, testData, 2), -3)
})