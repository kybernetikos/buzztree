function store({api}, node) {
	if (node.ref === undefined) {
		node.ref = api.create(node)
	} else {
		api.update(node.ref, node)
	}
	return node.ref
}


module.exports = {store}