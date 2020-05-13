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
const generateTags = require("./src/generateTags")
const saveCatalog = require("./src/saveCatalog")
const generateSearch = require("./src/generateSearch")
const usage = require("command-line-usage")
const mdExtensions = require("./src/mdExtensions")
const mdConvert = require("./src/mdConvert")

const options = [
  { name: "help", alias: "h", type: Boolean, multiple: false, description: "Display this message" },
  { name: "name", alias: "n", type: String, multiple: false, description: "Name for the root" },
  { name: "out", alias: "o", type: String, multiple: false, description: "Folder where to render. This will be wiped out, be sure you're ok with that first" },
  { name: "in", alias: "i", type: String, multiple: false, description: "Folder which will be crawled and rendered" },
  { name: "template", alias: "t", type: String, multiple: false, description: "Default template file" },
  { name: "template-folder", alias: "T", type: String, multiple: false, description: "Folder where templates will be looked for" },
  { name: "generate-search", alias: "s", type: Boolean, multiple: false, description: "Generate a search index (experimental)" }
]


function displayHelp() {
  const structure = [
    {
      header: 'Plaf - static site generator'
    },
    {
      header: 'Commands',
      optionList: options
    }
  ];
  const message = usage(structure);
  console.log(message);
}

let search = false;
let inputFolder = process.cwd();
let outputFolder = "rendered";
let defaultTemplate = null;
let name = path.basename(inputFolder);


const command = parseCommandLine(options);
if (command.help) {
  displayHelp();
  return;
}
if (command.out) {
  outputFolder = command.out.value;
}
if (command.in) {
  inputFolder = command.in.value;
}
let templateFolder = path.join(inputFolder, ".plaf");
if (command["template-folder"]) {
  templateFolder = command["template-folder"].value;
}
if (command.template) {
  defaultTemplate = command.template.value;
}
if (command.name) {
  name = command.name.value
}
if (command["generate-search"]) {
  search = true;
}

const deps = { fs, path, handlebars, marked }
deps.getTemplate = templateFactory(defaultTemplate, templateFolder, deps)

const context = {
  inputFolder,
  outputFolder,
  deps,
  name
}

const pipeline = [
  { order: 100, step: (context) => context.folderContent = crawl(context) },
  { order: 200, step: preprocess },
  { order: 300, step: processMd },
  { order: 320, step: mdExtensions },
  { order: 340, step: mdConvert },
  { order: 400, step: cleanup },
  { order: 500, step: buildDirectoryStructure },
  { order: 600, step: copyFiles },
  { order: 700, step: renderMd },
  { order: 800, step: generateIndex },
  { order: 900, step: generateTags },
]

if (search) {
  pipeline.push(
    { order: 1000, step: (context) => fs.mkdirSync(path.join(context.outputFolder, "search"), { recursive: true }) },
    { order: 1100, step: saveCatalog },
    { order: 1200, step: generateSearch },
  )
}

pipeline
  .sort((a, b) => a - b)
  .forEach(step => step.step(context))