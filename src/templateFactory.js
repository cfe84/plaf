const handlebars = require("handlebars");

const templateFactory = (defaultTemplateName, templateFolder, deps) => {

  const DEFAULT_TEMPLATE = deps.path.join(__dirname, "default.handlebars");

  const helpersFolder = deps.path.join(templateFolder, "helpers");

  const loadHelper = (file) => {
    const content = `${deps.fs.readFileSync(file)}`
    return eval(content);
  }

  const loadHelpers = (folder) => {
    let helpers = [
      { name: "eq", helper: (a, b) => a === b },
      { name: "ge", helper: (a, b) => a >= b },
      { name: "gt", helper: (a, b) => a > b },
      { name: "le", helper: (a, b) => a <= b },
      { name: "lt", helper: (a, b) => a < b },
      { name: "ne", helper: (a, b) => a !== b }
    ]
    if (deps.fs.existsSync(folder)) {
      const helpersFiles = deps.fs.readdirSync(folder);
      helpers = helpers.concat(helpersFiles
        .filter(file => file.endsWith(".js"))
        .map(file => ({
          name: file.substring(0, file.length - 3),
          helper: loadHelper(deps.path.join(folder, file))
        })))
    }
    return helpers
  }
  const helpers = loadHelpers(helpersFolder)

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
          deps.logger.warn(`Template not found: neither ${templatePath} nor ${properties.template} files were found. Defaulting to default template`)
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

    helpers.forEach(helper => handlebars.registerHelper(helper.name, helper.helper))
    const template = handlebars.compile(templateFile)
    return (props) => template(copyAndFlattenObject(props))
  }

  return getTemplate;
};

module.exports = templateFactory;