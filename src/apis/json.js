const InternalNode = require('../data/InternalNode')
const Bucket = require('../data/Bucket')

const cache = {}
let current = 0
const api = {
	create(node) {
		const result = current++
		const {keys, children, terminalNode, nextBucket, prevBucket} = node
		cache[result] = JSON.stringify({keys, children, terminalNode, nextBucket, prevBucket})
		console.log('create', result,  cache[result])
		return result
	},
	update(id, node) {
		const {keys, children, terminalNode, nextBucket, prevBucket} = node
		cache[id] = JSON.stringify({keys, children, terminalNode, nextBucket, prevBucket})
		console.log('update id ', id,  cache[id])
	},
	read(id) {
		console.log('read id ', id,  cache[id])
		if (!cache[id]) {
			throw new Error("could not find id="+id)
		}
		const {keys, children, terminalNode, nextBucket, prevBucket} = JSON.parse(cache[id])
		let result
		if (terminalNode) {
			result = new Bucket(keys, children, nextBucket, prevBucket)
		} else {
			result = new InternalNode(keys, children)
		}
		result.ref = id
		return result
	},
	remove(id) {
		if (id in cache === false) {
			throw new Error('id not in cache' + id)
		}
		console.log('remove id ', id,  String(cache[id]))
		delete cache[id]
	}
}

module.exports = api