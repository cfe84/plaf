const should = require("should")
const crawl = require("../src/crawl")
const fakeFs = require("./fakeFs");
const fakePath = require("./fakePath");

describe("crawl", () => {
  it("crawl simple repositories", () => {
    // prepare
    const folders = {
      "start": { type: "folder", name: "start", content: ["markdownFile.md", "textFile.txt", "subfolder"] },
      "start/markdownFile.md": { name: "markdownFile.md", type: "file", content: "Markdown" },
      "start/textFile.txt": { name: "textFile.txt", type: "file", content: "Text file" },
      "start/subfolder": { name: "subfolder", type: "folder", content: ["markdown2.md", "subsubfolder"] },
      "start/subfolder/markdown2.md": { name: "markdown2.md", type: "file", content: "Markdown again" },
      "start/subfolder/subsubfolder": { name: "subsubfolder", type: "folder", content: ["file.txt"] },
      "start/subfolder/subsubfolder/file.txt": { name: "file.txt", type: "file", content: "Text" }
    };
    const fs = fakeFs(folders);
    const path = fakePath;
    const deps = { fs, path }

    // exec
    const output = crawl("start", "dfsf", "", deps);

    // assess
    const properties = Object.getOwnPropertyNames(folders);
    console.log(output)
    properties.splice(1).forEach(propertyName => {
      console.log(propertyName)
      const folder = folders[propertyName];
      const matchingOutput = output.find(out => out.path === propertyName)
      should(matchingOutput).not.be.undefined();
      should(matchingOutput.type).eql(folder.type);
      should(matchingOutput.name).eql(folder.name);
    })
  })
})