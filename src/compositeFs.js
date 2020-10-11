const compositeFs = (...fsArray) => {
  return {
    readdirSync: (folderPath) => {
      for (let i = 0; i < fsArray.length; i++) {
        try {
          return fsArray[i].readdirSync(folderPath)
        } catch { }
      }
      throw Error(`ENOENT: no such file or directory, scandir '${folderPath}'`)
    },
    lstatSync: (filename) => {
      for (let i = 0; i < fsArray.length; i++) {
        try {
          return fsArray[i].lstatSync(filename)
        } catch { }
      }
      throw Error(`ENOENT: no such file or directory, lstat '${filePath}'`)
    },
    readFileSync: (filePath) => {
      for (let i = 0; i < fsArray.length; i++) {
        try {
          return fsArray[i].readFileSync(filePath)
        } catch { }
      }
      throw Error(`ENOENT: no such file or directory, open '${filePath}'`)
    },
    existsSync: (filename) => fsArray.map(fs => fs.existsSync(filename)).reduce((res, val) => res || val, false),
    mkdirSync: (folderPath) => {
      fsArray[0].mkdirSync(folderPath)
    },
    writeFileSync: (filePath, content) => {
      fsArray[0].writeFileSync(filePath, content)
    }
  }
}

module.exports = compositeFs;