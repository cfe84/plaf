const cleanupInMemFs = (context) => {
  if (!context.deps.inMemFs) {
    throw Error("InMemoryFs is not initialized")
  }
  if (!context.deps.linkFs) {
    throw Error("LinkFs is not initialized")
  }
  context.deps.inMemFs.clear()
  context.deps.linkFs.clear()
}

module.exports = cleanupInMemFs