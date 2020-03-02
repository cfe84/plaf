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
        console.warn(`Template not found: neither ${templatePath} nor ${properties.template} files were found. Defaulting to default template`)
        return null;
      }
    }
  }

  const getTemplate = (properties) => {
    let templateFile = loadTemplateFile(properties);
    if (!templateFile) {
      templateFile = defaultTemplate
    }
    const template = handlebars.compile(templateFile)
    return template
  }

  return getTemplate;
};

module.exports = templateFactory;