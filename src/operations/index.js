module.exports = Object.assign({},
	require("./find"),
	require("./insert"),
	{remove: require("./remove").remove},
	require("./iterate")
)