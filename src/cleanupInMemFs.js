const cleanupInMemFs = (context) => {
  if (!context.deps.inMemFs) {
    throw Error("InMemoryFs is not active")
  }
  context.deps.inMemFs.clear()
}

module.exports = cleanupInMemFs