const consts = require("../src/consts");
const { v4: uuidv4 } = require('uuid');
const handlebars = require("handlebars")
const encryptContent = (defaultPassword) => ({ deps, folderContent }) => {
  const templateContent = `${deps.fs.readFileSync(deps.path.join(__dirname, "encrypted.handlebars"))}`
  const template = handlebars.compile(templateContent)
  folderContent
    .filter(content => content.type === consts.fileType.md
      && ((content.properties && content.properties.password) || defaultPassword))
    .forEach((content) => {
      // Used to give a unique identifier for the div, 
      // in case you want to have multiple encrypted content
      // divs in a single page (e.g. an index.)
      content.id = uuidv4().replace(/-/g, "")
      const password = content.properties.password || defaultPassword
      content.content = deps.encrypt(content.content, password)
      content.content = template(content)
      content.mdcontent = ""
    })
}

module.exports = encryptContent