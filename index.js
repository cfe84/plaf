const { parseCommandLine } = require("yaclip");
const fs = require("fs");
const path = require("path")
const handlebars = require("handlebars")
const marked = require("marked");
const templateFactory = require("./src/templateFactory")
const crawl = require("./src/crawl")
const preprocess = require("./src/preprocess")
const processMd = require("./src/processMd")
const cleanup = require("./src/cleanup");
const buildDirectoryStructure = require("./src/buildDirectoryStructure")
const copyFiles = require("./src/copyFiles");
const renderMd = require("./src/renderMd");
const generateIndex = require("./src/generateIndex")

const options = [
  { name: "name", alias: "n", type: String, multiple: false, description: "Name for the root" },
  { name: "out", alias: "o", type: String, multiple: false, description: "Folder where to render" },
  { name: "in", alias: "i", type: String, multiple: false, description: "Folder which will be crawled and rendered" },
  { name: "template", alias: "t", type: String, multiple: false, description: "Default template file" },
  { name: "template-folder", alias: "T", type: String, multiple: false, description: "Folder where templates will be looked for" }
]


let inputFolder = process.cwd();
let outputFolder = "rendered";
const DEFAULT_TEMPLATE = fs.readFileSync(path.join(__dirname, "src", "default.handlebars")).toString();
let defaultTemplate = DEFAULT_TEMPLATE;
let templateFolder = ".plaf";
let name = "Root";


const command = parseCommandLine(options);
if (command.out) {
  outputFolder = command.out.value;
}
if (command.in) {
  inputFolder = command.in.value;
}
if (command["template-folder"]) {
  templateFolder = command["template-folder"].value;
}
if (command.template) {
  let templateName = command.template.value;
  if (fs.existsSync(templateName)) {
    defaultTemplate = `${fs.readFileSync(command.template.value)}`;
  } else {
    if (!templateName.endsWith(".handlebars")) {
      templateName += ".handlebars";
    }
    templateName = path.join(templateFolder, templateName);
    if (fs.existsSync(templateName)) {
      defaultTemplate = `${fs.readFileSync(templateName)}`
    } else {
      console.error(`Could not load default template: Neither `)
      process.exit(1);
    }
  }
}
if (command.name) {
  name = command.name.value
}

const deps = { fs, path, handlebars, marked }
deps.getTemplate = templateFactory(defaultTemplate, templateFolder, deps)

let folderContent = crawl(inputFolder, outputFolder, defaultTemplate, deps);
preprocess(folderContent);
processMd(folderContent, deps);
cleanup(outputFolder, deps);
buildDirectoryStructure(outputFolder, folderContent, deps);
copyFiles(folderContent, outputFolder, deps);
renderMd(folderContent, outputFolder, deps)
generateIndex(folderContent, outputFolder, name, deps)
