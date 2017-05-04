const cache = {}
let current = 0
const api = {
	create(node) {
		const result = current++
		cache[result] = node
		console.log('create id ', result,  String(node))
		return result
	},
	update(id, node) {
		cache[id] = node
		console.log('update id ', id,  String(node))
	},
	read(id) {
		console.log('read id ', id,  String(cache[id]))
		if (!cache[id]) {
			throw new Error("could not find id="+id)
		}
		return cache[id]
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