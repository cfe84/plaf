const consts = require("./consts");

const renderMd = ({ folderContent, outputFolder, deps }) => {
  folderContent
    .filter(file => file.type === consts.fileType.md)
    .forEach(mdFile => {
      const template = deps.getTemplate(mdFile.properties);
      const rendered = template(mdFile);
      const fileName = deps.path.join(outputFolder, mdFile.relativePath.replace(/\.md$/i, ".html"));
      deps.fs.writeFileSync(fileName, rendered)
    })
};

module.exports = renderMd;