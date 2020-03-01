const cleanup = (outputFolder, deps) => {
  const rmFolder = (folder) => {
    if (!deps.fs.existsSync(folder)) {
      return;
    }
    const files = deps.fs.readdirSync(folder);
    files.forEach(file => {
      const fullpath = deps.path.join(folder, file)
      const stats = deps.fs.lstatSync(fullpath);
      if (stats.isDirectory()) {
        rmFolder(fullpath);
      } else {
        deps.fs.unlinkSync(fullpath)
      }
    })
    deps.fs.rmdirSync(folder)
  }

  rmFolder(outputFolder)
}

module.exports = cleanup;