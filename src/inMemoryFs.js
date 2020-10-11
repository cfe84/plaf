const path = require("path")

const inMemoryFs = (structure = {}) => {
  return {
    clear: () => {
      structure = {}
    },
    readdirSync: (folderPath) => {
      if (!structure[folderPath]) {
        throw Error(`ENOENT: no such file or directory, scandir '${folderPath}'`)
      }
      return structure[folderPath].files
    },
    lstatSync: (filename) => {
      if (!structure[filename]) {
        throw Error(`ENOENT: no such file or directory, lstat '${filePath}'`)
      }
      return {
        isDirectory: () => structure[filename].type === "folder"
      }
    },
    readFileSync: (filePath) => {
      if (!structure[filePath]) {
        throw Error(`ENOENT: no such file or directory, open '${filePath}'`)
      }
      return structure[filePath].content
    },
    existsSync: (filename) => !!structure[filename],
    mkdirSync: (folderPath) => {
      const parentFolder = path.dirname(folderPath)
      const folderName = path.basename(folderPath)
      if (parentFolder !== "" && parentFolder !== ".") {
        structure[parentFolder].files.push(folderName)
      }
      structure[folderPath] = {
        type: "folder",
        files: []
      }
    },
    writeFileSync: (filePath, content) => {
      const parentFolder = path.dirname(filePath)
      const baseName = path.basename(filePath)
      if (parentFolder !== "" && parentFolder !== ".") {
        structure[parentFolder].files.push(baseName)
      }
      structure[filePath] = {
        type: "file",
        content: content
      }
    }
  }
}

module.exports = inMemoryFs;