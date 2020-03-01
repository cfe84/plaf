const handlebars = require("handlebars");

const templateFactory = (defaultTemplateName, templateFolder, deps) => {
  const DEFAULT_TEMPLATE = deps.fs.readFileSync(deps.path.join(__dirname, "default.handlebars")).toString();
  const loadTemplateFile = (properties, defaultTemplate) => {
    if (properties && properties.template) {
      const templateFileName = properties.template.endsWith(".handlebars") ? properties.template : properties.template + ".handlebars"
      const templatePath = deps.path.join(templateFolder, templateFileName);
      if (deps.fs.existsSync(templatePath)) {
        return `${deps.fs.readFileSync(templatePath)}`;
      } else if (deps.fs.existsSync(properties.template)) {
        return `${deps.fs.readFileSync(properties.template)}`;
      } else {
        console.warn(`Template not found: neither ${templatePath} nor ${properties.template} files were found. Defaulting to default template`)
      }
    }
    return defaultTemplate
  }

  let defaultTemplate = defaultTemplateName ? loadTemplateFile(defaultTemplateName, DEFAULT_TEMPLATE) : DEFAULT_TEMPLATE;

  const getTemplate = (properties) => {
    const templateFile = loadTemplateFile(properties, defaultTemplate);
    const template = handlebars.compile(templateFile)
    return template
  }

  return getTemplate;
};

module.exports = templateFactory;