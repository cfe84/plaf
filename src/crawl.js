const consts = require("./consts");

function createFolderObject(file, filePath, relativePath, files, hidden) {
  return {
    type: consts.fileType.folder,
    filename: file,
    path: filePath,
    relativePath,
    files,
    properties: {
      template: "index",
      hidden
    }
  };
}

const crawl = (inputFolder, outputFolder, deps) => {

  function isIgnored(file) {
    return file[0] === "."
      || file === outputFolder
  }

  const crawlFolder = (name, inputFolder, inputRelativePath = "") => {
    const files = deps.fs.readdirSync(inputFolder);
    const hidden = files.indexOf(".hide") >= 0;
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
        return crawlFolder(file, filePath, relativePath);
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
      .filter(file => file.type !== "ignore");
    return createFolderObject(name, inputFolder, inputRelativePath, res, hidden);
  }

  const flatten = (folder) =>
    folder.files.reduce((res, file) =>
      res.concat(file.type === consts.fileType.folder ? flatten(file) : [file]), [folder])

  const rootFolderContent = crawlFolder(inputFolder, inputFolder, "");
  let allFilesAndFolders = flatten(rootFolderContent)
  const resourcesFolder = deps.path.join(inputFolder, ".plaf", "resources");

  if (deps.fs.existsSync(resourcesFolder)) {
    const resources = crawlFolder(resourcesFolder, resourcesFolder, "");
    const flattenedResources = flatten(resources).splice(1);
    flattenedResources.forEach(resource => {
      if (!resource.properties) {
        resource.properties = {}
      }
      resource.properties.skipIndexing = true;
      resource.properties.hidden = true;
    })
    allFilesAndFolders = allFilesAndFolders.concat(flattenedResources);
  }
  return allFilesAndFolders;
}

module.exports = crawl;