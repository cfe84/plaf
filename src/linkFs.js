/*
** This is a contraption used for the "serve" use-case
** and which just serves files from the actual file system
** using in-memory links created instead of actually copying
** content to target directory.
*/
const linkFs = (deps) => {
  let links = {}

  return {
    clear: () => {
      links = {}
    },
    readFileSync: (filename) => {
      if (!links[filename]) {
        throw Error(`Link does not exist: ${filename}`)
      }
      return deps.fs.readFileSync(links[filename])
    },
    lstatSync: (filename) => {
      if (!links[filename]) {
        throw Error(`ENOENT: no such file or directory, lstat '${filename}'`)
      }
      return {
        isDirectory: () => false
      }
    },
    existsSync: (filename) => {
      return links[filename] !== undefined
    },
    copyFileSync: (actualFilename, linkFilename) => {
      const logger = deps.logger || { debug: () => { } }
      logger.debug(`LinkFS - copying file from ${actualFilename} to ${linkFilename}`)
      links[linkFilename] = actualFilename
    }
  }
}

module.exports = linkFs