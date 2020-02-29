const consts = require("./consts");

const render = (folderContent, outputFolder, defaultTemplate, deps) => {

  const copyFile = (input, output) => {
    deps.fs.copyFileSync(input, output)
  }

  const rmFolder = (folder) => {
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

  const generateIndex = (folder, content) => {
    const list = content
      .filter(f => f.type !== consts.fileType.file)
      .sort((f1, f2) => f1.name > f2.name ? -1 : 1)
      .sort(f => f.type === consts.fileType.folder ? -1 : 1)
      .map(item => `<li class="item-${item.type}"><a href="${item.file + (item.type === consts.fileType.folder ? "/index.html" : "")}">${item.title}</a></li>`)
      .join("\n");
    const template = deps.handlebars.compile(defaultTemplate);
    const indexContent = template({
      title: folder,
      content: `<ul class="post-list">${list}</ul>`
    });
    deps.fs.writeFileSync(deps.path.join(folder, "index.html"), indexContent)
  }


  const outputToFolder = (folderContent, outputFolder) => {
    if (deps.fs.existsSync(outputFolder)) {
      rmFolder(outputFolder);
    }
    deps.fs.mkdirSync(outputFolder);
    generateIndex(outputFolder, folderContent);
    folderContent.forEach(file => {
      const filePath = deps.path.join(outputFolder, file.name)
      if (file.type === consts.fileType.folder) {
        outputToFolder(file.content, filePath);
      }
      if (file.type === consts.fileType.file) {
        copyFile(file.path, filePath);
      }
      if (file.type === consts.fileType.md) {
        const htmlFilePath = filePath.substring(0, filePath.length - 3) + ".html";
        deps.fs.writeFileSync(htmlFilePath, file.rendered);
      }
    })
  }

  outputToFolder(folderContent, outputFolder);
}

module.exports = render;