const handlebars = require("handlebars");

const templateFactory = (defaultTemplateName, templateFolder, deps) => {

  const DEFAULT_TEMPLATE = deps.path.join(__dirname, "default.handlebars");

  if (!defaultTemplateName) {
    const defaultInTemplateDirectory = deps.path.join(templateFolder, "default.handlebars")
    if (templateFolder && deps.fs.existsSync(defaultInTemplateDirectory)) {
      defaultTemplateName = defaultInTemplateDirectory
    } else {
      defaultTemplateName = DEFAULT_TEMPLATE
    }
  }

  const defaultTemplate = `${deps.fs.readFileSync(defaultTemplateName)}`

  const loadTemplateFile = (properties) => {
    if (properties && properties.template) {
      const templateFileName = properties.template.endsWith(".handlebars") ? properties.template : properties.template + ".handlebars"
      const templatePath = deps.path.join(templateFolder, templateFileName);
      if (deps.fs.existsSync(templatePath)) {
        return `${deps.fs.readFileSync(templatePath)}`;
      } else if (deps.fs.existsSync(properties.template)) {
        return `${deps.fs.readFileSync(properties.template)}`;
      } else {
        if (properties.template !== "index" && properties.template !== "tags") {
          console.warn(`Template not found: neither ${templatePath} nor ${properties.template} files were found. Defaulting to default template`)
        }
        return null;
      }
    }
  }

  const copyAndFlattenObject = (obj, res = {}) => {
    Object.getOwnPropertyNames(obj).forEach(key => {
      if (key === "properties") {
        copyAndFlattenObject(obj[key], res)
      } else {
        res[key] = obj[key];
      }
    })
    return res;
  }

  const getTemplate = (properties) => {
    let templateFile = loadTemplateFile(copyAndFlattenObject(properties));
    if (!templateFile) {
      templateFile = defaultTemplate
    }
    handlebars.registerHelper("eq", (a, b) => a === b)
    handlebars.registerHelper("ge", (a, b) => a >= b)
    handlebars.registerHelper("gt", (a, b) => a > b)
    handlebars.registerHelper("le", (a, b) => a <= b)
    handlebars.registerHelper("lt", (a, b) => a < b)
    handlebars.registerHelper("ne", (a, b) => a !== b)
    const template = handlebars.compile(templateFile)
    return (props) => template(copyAndFlattenObject(props))
  }

  return getTemplate;
};

module.exports = templateFactory;