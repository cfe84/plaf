const { parseCommandLine } = require("yaclip");
const fs = require("fs");
const path = require("path")
const handlebars = require("handlebars")
const marked = require("marked");
const crawl = require("./src/crawl")
const preprocess = require("./src/preprocess")
const processMd = require("./src/processMd")
const copyFiles = require("./src/copyFiles");
const cleanup = require("./src/cleanup");


const render = require("./src/render")

const options = [
  { name: "out", alias: "o", type: String, multiple: false },
  { name: "in", alias: "i", type: String, multiple: false },
  { name: "template", alias: "t", type: String, multiple: false }
]

const DEFAULT_TEMPLATE = fs.readFileSync(path.join(__dirname, "src", "default.handlebars")).toString();

let inputFolder = process.cwd();
let outputFolder = "rendered";
let defaultTemplate = DEFAULT_TEMPLATE;

const deps = { fs, path, handlebars, marked }

const command = parseCommandLine(options);
if (command.out) {
  outputFolder = command.out.value;
}
if (command.in) {
  inputFolder = command.in.value;
}
if (command.template) {
  defaultTemplate = `${fs.readFileSync(command.template.value)}`;
}

let folderContent = crawl(inputFolder, outputFolder, defaultTemplate, deps);
preprocess(folderContent);
processMd(folderContent, deps);
cleanup(outputFolder, deps);
copyFiles(folderContent, outputFolder, deps);

//render(folderContent, outputFolder, defaultTemplate, deps)