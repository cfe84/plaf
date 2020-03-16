const should = require("should")
const crawl = require("../src/crawl")
const fakeFs = require("./fakeFs");
const fakePath = require("./fakePath");

describe("crawl", () => {
  // prepare
  const folders = {
    "start": { type: "folder", name: "start", files: ["markdownFile.md", "textFile.txt", "subfolder"] },
    "start/markdownFile.md": { name: "markdownFile.md", type: "file", expectedType: "md", content: "Markdown" },
    "start/textFile.txt": { name: "textFile.txt", type: "file", content: "Text file" },
    "start/.textFile.txt": { name: "textFile.txt", ignored: true, type: "file", content: "Text file" },
    "start/.plaf/": { name: "resources", ignored: true, type: "folder", files: ["textFile.txt", "resources"] },
    "start/.plaf/textFile.txt": { name: "textFile.txt", ignored: true, type: "file", content: "Text file" },
    "start/.plaf/resources": { name: "resources", ignored: true, type: "folder", files: ["textFile.txt"] },
    "start/.plaf/resources/textFile.txt": { name: "textFile.txt", type: "file", content: "Text file", targetRelativePath: "textFile.txt", skipIndexing: true },
    "start/subfolder": { name: "subfolder", type: "folder", files: ["markdown2.md", "subsubfolder"] },
    "start/subfolder/markdown2.md": { name: "markdown2.md", type: "file", expectedType: "md", content: "Markdown again" },
    "start/subfolder/subsubfolder": { name: "subsubfolder", type: "folder", files: ["file.txt"] },
    "start/subfolder/subsubfolder/file.txt": { name: "file.txt", type: "file", content: "Text" }
  };
  const ignored = 4;
  const fs = fakeFs(folders);
  const path = fakePath;
  const deps = { fs, path }

  // exec
  const output = crawl("start", "dfsf", deps);
  // assess
  it("gets all folders and repositories", () => {
    const properties = Object.getOwnPropertyNames(folders);
    properties.forEach(propertyName => {
      const folder = folders[propertyName];
      const matchingOutput = output.find(out => out.path === propertyName)
      if (folder.ignored) {
        should(matchingOutput).be.undefined();
      } else {
        should(matchingOutput).not.be.undefined();
        should(matchingOutput.type).eql(folder.expectedType || folder.type);
        should(matchingOutput.filename).eql(folder.name);
        if (folder.targetRelativePath) {
          should(matchingOutput.relativePath).eql(folder.targetRelativePath);
        }
        else {
          should(matchingOutput.relativePath).eql(propertyName.replace("start/", "").replace("start", ""));
        }
        if (folder.skipIndexing) {
          should(matchingOutput.skipIndexing).be.true()
        }
        if (folder.type === "folder") {
          should(matchingOutput.files).have.length(folder.files.length);
        }
      }
    })
    should(output).have.lengthOf(properties.length - ignored)
  });
})