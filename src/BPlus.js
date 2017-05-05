const apis = require('./apis')
const TreeConfig = require('./data/TreeConfig')
const Bucket = require('./data/Bucket')
const ops = require('./operations')

function naturalCompare(a, b) {
	return a < b ? -1 : (a === b ? 0 : 1)
}

class BPlus {
	// this {ref, rootRef, root, config}
	constructor(ref = undefined, api = apis.json, keyCompareFn = naturalCompare, maxNodeChildren = 3) {
		this.config = new TreeConfig(api, keyCompareFn, maxNodeChildren)
		this.ref = ref
		if (ref === undefined) {
			this.root = new Bucket()
			ops.store(this.config, this.root)
			this.rootRef = this.root.ref

			ops.store(this.config, this)
		} else {
			Object.assign(this, api.read(ref))
			this.rootRef = this.root.ref
		}
	}

	set(key, value) {
		const result = ops.insert(this.config, this.root, key, value)
		updateRoot(this, result)
	}

	get(key, defaultValue = undefined) {
		return ops.find(this.config, this.root, key, defaultValue)
	}

	//noinspection ReservedWordAsName mimicking the rather dumb js map api.
	delete(key) {
		const result = ops.remove(this.config, this.root, key)
		updateRoot(this, result)
	}

	*entries(minKey, maxKey) {
		yield* ops.iterate(this.config, this.root, minKey, maxKey)
	}

	*[Symbol.iterator]() {
		yield* this.entries()
	}
}

module.exports = BPlus

function updateRoot(node, result) {
	if (result !== node.root) {
		node.root = result
		node.rootRef = result.ref
		ops.store(node.config, node)
	}
}