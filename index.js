const { parseCommandLine } = require("yaclip");
const render = require("./src/render")
const crawl = require("./src/crawl")
const fs = require("fs");
const path = require("path")
const handlebars = require("handlebars")
const marked = require("marked");

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

const folderContent = crawl(inputFolder, outputFolder, defaultTemplate, deps);
render(folderContent, outputFolder, defaultTemplate, deps)