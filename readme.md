BuzzTree
========

A B+Tree with the node access logic split out, so that it's pluggable.

```
const {BPlus, apis} = require('kybernetikos/buzztree')

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

// tree also supports get and delete.
```

By default, all node access is serialized to json and stored in memory.  For better performance you can
use a direct memory api.

```js
const alreadyStoredTreeRef = undefined
const tree = new BPlus(alreadyStoredTreeRef, apis.memory)

// you can get the ref from the tree with `tree.ref` after it's been constructed.
```

The apis can be any object that implement standard CURR behaviour 
* create(node) => ref
* update(ref, node)
* read(ref) => node
* remove(ref)

At the moment, these aren't asynchronous methods, but this can be resolved by having them keep a cache,
record transactions and have an asychronous commit.

It should also be easy to make the tree work with asynchronous APIs, but it would mean changes across the
code and I don't need it yet.

See https://github.com/kybernetikos/gos-bplus for integration with goshawkdb.