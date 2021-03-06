const {test} = require('ava')
const BPlus = require('./BPlus')
const {binder} = require('./utils/testutils')

test("Basic operations on the bplus tree",(t) => {
	const {deepEqual:eq} = binder(t)

	const tree = new BPlus()

	tree.set("hello", "there")
	tree.set("good", "hurrah")
	tree.set("tasty", "bob")
	tree.set("jim", "captain")
	tree.set("crystals", "take it")

	eq(Array.from(tree.entries("dave", "xylophone")), [
		["good", "hurrah"],
		["hello", "there"],
		["jim", "captain"],
		["tasty", "bob"]
	])

	const storedTree = new BPlus(tree.ref)
	eq(Array.from(storedTree), [
		["crystals", "take it"],
		["good", "hurrah"],
		["hello", "there"],
		["jim", "captain"],
		["tasty", "bob"]
	])
	eq(Array.from(storedTree.entries("dave", "xylophone")), [
		["good", "hurrah"],
		["hello", "there"],
		["jim", "captain"],
		["tasty", "bob"]
	])
	eq(Array.from(storedTree.entries("kitchen", "fun")), [
		["jim", "captain"],
		["hello", "there"],
		["good", "hurrah"]
	])

	eq(storedTree.get("hello"), "there")
	eq(storedTree.get("not", "in"), "in")
	eq(storedTree.get("not"), undefined)

})