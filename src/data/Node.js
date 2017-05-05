class Node {
	constructor(keys, children) {
		if (!Array.isArray(keys) || !Array.isArray(children)) {
			throw new Error(`Keys and children must be arrays, keys was ${keys} and values was ${children}.`)
		}
		Object.assign(this, {ref: undefined, keys, children})
	}
}

module.exports = Node