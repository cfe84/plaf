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
      throw Error(`ENOENT: no such file or directory, lstat '${filename}'`)
    },
    readFileSync: (filePath) => {
      for (let i = 0; i < fsArray.length; i++) {
        try {
          return fsArray[i].readFileSync(filePath)
        } catch { }
      }
      throw Error(`ENOENT: no such file or directory, open '${filePath}'`)
    },
    copyFileSync: (from, to) => {
      for (let i = 0; i < fsArray.length; i++) {
        try {
          return fsArray[i].copyFileSync(from, to)
        } catch { }
      }
      throw Error(`ENOENT: no such file or directory, copy '${filePath}'`)
    },
    existsSync: (filename) => fsArray.map(fs => fs.existsSync(filename)).reduce((res, val) => res || val, false),
    mkdirSync: (folderPath) => {
      for (let i = 0; i < fsArray.length; i++) {
        try {
          return fsArray[i].mkdirSync(folderPath)
        } catch { }
      }
      throw Error(`ENOENT: no such file or directory, mkdir '${filePath}'`)
    },
    writeFileSync: (filePath, content) => {
      for (let i = 0; i < fsArray.length; i++) {
        try {
          return fsArray[i].writeFileSync(filePath, content)
        } catch { }
      }
      throw Error(`ENOENT: no such file or directory, mkdir '${filePath}'`)
    }
  }
}

module.exports = compositeFs;