const consts = require("../src/consts");
const handlebars = require("handlebars")
const encryptContent = (defaultPassword) => ({ deps, folderContent }) => {
  const templateContent = `${deps.fs.readFileSync(deps.path.join(__dirname, "encrypted.handlebars"))}`
  const template = handlebars.compile(templateContent)
  folderContent
    .filter(content => content.type === consts.fileType.md
      && ((content.properties && content.properties.password) || defaultPassword))
    .forEach((content) => {
      const password = content.properties.password || defaultPassword
      content.content = deps.encrypt(content.content, password)
      content.content = template(content)
      content.mdcontent = ""
    })
}

module.exports = encryptContent