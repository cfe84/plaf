const consts = require("./consts");

const tagRegex = /(^| )#([a-zA-Z0-9-_]+)/gm


const crawl = (inputFolder, outputFolder, deps) => {

  function isIgnored(file) {
    return file[0] === "."
      || file === outputFolder
  }

  const crawlFolder = (inputFolder, inputRelativePath = "") => {
    const files = deps.fs.readdirSync(inputFolder);
    const res = files.map(file => {
      if (isIgnored(file)) {
        return {
          type: "ignore"
        }
      }
      const filePath = deps.path.join(inputFolder, file)
      const relativePath = deps.path.join(inputRelativePath, file).replace(/^\//, "");
      const stats = deps.fs.lstatSync(filePath);
      if (stats.isDirectory()) {
        const content = crawlFolder(filePath, relativePath);
        return {
          type: consts.fileType.folder,
          filename: file,
          path: filePath,
          relativePath,
          content
        }
      } else {
        const type = /\.md$/i.exec(file);
        return {
          type: !!type ? consts.fileType.md : consts.fileType.file,
          path: filePath,
          relativePath,
          filename: file
        }
      }
    })
      .reduce((result, file) => {
        if (file.type === "folder") {
          result.push(file)
          const content = file.content;
          return result.concat(content)
        } else {
          result.push(file);
        }
        return result;
      }, [])
      .filter(file => file.type !== "ignore");
    return res;
  }

  const folderContent = crawlFolder(inputFolder, "");

  return folderContent;
}

module.exports = crawl;