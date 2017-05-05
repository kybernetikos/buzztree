const cache = new WeakMap()
let current = 0
const api = {
	create(node) {
		const x = current++
		const result = {toString() {return "#"+x}}
		cache.set(result, node)
		console.log('create id ', result,  String(node))
		return result
	},
	update(id, node) {
		cache.set(id, node)
		console.log('update id ', id,  String(node))
	},
	read(id) {
		console.log('read id ', id,  String(cache.get(id)))
		if (!cache.has(id)) {
			throw new Error("could not find id="+id)
		}
		return cache.get(id)
	},
	remove(id) {
		if (!cache.has(id)) {
			throw new Error('id not in cache' + id)
		}
		console.log('remove id ', id,  String(cache.get(id)))
		cache.delete(id)
	}
}

module.exports = api