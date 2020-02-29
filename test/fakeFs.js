const fakeFs = (structure) => {
  return {
    readdirSync: (filename) => structure[filename].content,
    lstatSync: (filename) => ({
      isDirectory: () => structure[filename].type === "folder"
    }),
    readFileSync: (file) => structure[file]
  }
}

module.exports = fakeFs;