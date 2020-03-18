const fakeFs = (structure) => {
  return {
    readdirSync: (filename) => structure[filename].files,
    lstatSync: (filename) => ({
      isDirectory: () => structure[filename].type === "folder"
    }),
    readFileSync: (file) => structure[file].content,
    existsSync: (filename) => !!structure[filename]
  }
}

module.exports = fakeFs;