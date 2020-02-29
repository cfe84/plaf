const fakeFs = (structure) => {
  return {
    readdirSync: (filename) => structure[filename].content,
    lstatSync: (filename) => ({
      isDirectory: () => structure[filename].type === "directory"
    }),

  }
}

module.exports = fakeFs;