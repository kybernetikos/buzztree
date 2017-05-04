const NOT_PRESENT_ARRAY = []
const NOT_PRESENT_ITEM = {}

function findIndex(comparisonFn, item = NOT_PRESENT_ITEM, array = NOT_PRESENT_ARRAY, start = 0, end = array.length) {
	if (array === NOT_PRESENT_ARRAY && start === 0 && end === 0) {
		if (item === NOT_PRESENT_ITEM) {
			return (item, array, start = 0, end = array.length) => findIndex(comparisonFn, item, array, start, end)
		} else {
			return (array, start = 0, end = array.length) => findIndex(comparisonFn, item, array, start, end)
		}
	}

	if (typeof comparisonFn !== 'function') {
		throw new Error(`Comparison function must be a function, was a ${typeof comparisonFn}.`)
	}
	if (typeof start !== 'number') {
		throw new Error(`Start and end must be numbers, start was a ${typeof start}, end was a ${typeof end}.`)
	}
	if (!Array.isArray(array)) {
		throw new Error(`Parameter was not an array ${array}`)
	}

	return binarySearch(comparisonFn, item, array, start, end)
}

/*
 * Returns either the index of the item in a sorted array, or if it isn't there and i is where it should be inserted, 0-i-1.
 *	```
 *		const i = binarySearch(comparisonFn, item, sortedArray)
 *		if (i < 0) {
 *			let insertionPoint = -i-1
 *		} else {
 *			let foundAt = i
 *		}
 *	```
 *  Setting a start and an end restricts the search to occur in the range index=start to index=end-1.
 *	If you have set a range restriction, values outside of that range will not be considered, so the insertion point
 *	will always be reported as between -start-1 and -end.  In the case that you've restricted it to a range, you cannot
 *	assume that inserting the item at -i-1 will keep the list sorted if i is -start-1 or i is -end
 */
function binarySearch(comparisonFn, item, array, start, end) {
	if (end === start) {
		return -start-1
	}
	let midPoint = Math.floor((start + end) / 2)
	let result = comparisonFn(item, array[midPoint])
	if (result < 0) {
		return binarySearch(comparisonFn, item, array, start, midPoint)
	} else if (result === 0) {
		return midPoint
	} else {
		return binarySearch(comparisonFn, item, array, midPoint + 1, end)
	}
}

module.exports = findIndex