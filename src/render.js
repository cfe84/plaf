const path = require("path");
const fs = require("fs");
const handlebars = require("handlebars")
const consts = require("./consts");

const render = (folderContent, outputFolder, defaultTemplate) => {

  const copyFile = (input, output) => {
    fs.copyFileSync(input, output)
  }

  const rmFolder = (folder) => {
    const files = fs.readdirSync(folder);
    files.forEach(file => {
      const fullpath = path.join(folder, file)
      const stats = fs.lstatSync(fullpath);
      if (stats.isDirectory()) {
        rmFolder(fullpath);
      } else {
        fs.unlinkSync(fullpath)
      }
    })
    fs.rmdirSync(folder)
  }

  const generateIndex = (folder, content) => {
    const list = content
      .filter(f => f.type !== consts.fileType.file)
      .sort((f1, f2) => f1.name > f2.name ? -1 : 1)
      .sort(f => f.type === consts.fileType.folder ? -1 : 1)
      .map(item => `<li class="item-${item.type}"><a href="${item.file + (item.type === consts.fileType.folder ? "/index.html" : "")}">${item.title}</a></li>`)
      .join("\n");
    const template = handlebars.compile(defaultTemplate);
    const indexContent = template({
      title: folder,
      content: `<ul class="post-list">${list}</ul>`
    });
    fs.writeFileSync(path.join(folder, "index.html"), indexContent)
  }


  const outputToFolder = (folderContent, outputFolder) => {
    if (fs.existsSync(outputFolder)) {
      rmFolder(outputFolder);
    }
    fs.mkdirSync(outputFolder);
    generateIndex(outputFolder, folderContent);
    folderContent.forEach(file => {
      const filePath = path.join(outputFolder, file.name)
      if (file.type === consts.fileType.folder) {
        outputToFolder(file.content, filePath);
      }
      if (file.type === consts.fileType.file) {
        copyFile(file.path, filePath);
      }
      if (file.type === consts.fileType.md) {
        const htmlFilePath = filePath.substring(0, filePath.length - 3) + ".html";
        fs.writeFileSync(htmlFilePath, file.rendered);
      }
    })
  }

  outputToFolder(folderContent, outputFolder);
}

module.exports = render;