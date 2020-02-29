const td = require("testdouble");
const crawl = require("../src/crawl")
const fakeFs = require("./fakeFs");
const fakePath = require("./fakePath");

describe("crawl", () => {
  it("crawl simple repositories", () => {
    // prepare
    const folder = {
      "start": { type: "directory", content: ["markdownFile.md", "textFile.txt", "subfolder"] },
      "start/markdownFile.md": { type: "file", content: "Markdown" },
      "start/textFile.txt": { type: "file", content: "Text file" },
      "start/subfolder": { type: "directory", content: ["markdown2.md"] },
      "start/subfolder/markdown2.md": { type: "file", content: "Markdown again" }
    };
    const fs = fakeFs(folder);
    const path = fakePath;
    const deps = { fs, path }

    // exec
    const output = crawl("start", "dfsf", "", deps);

    // assess
    console.log(output)
  })
})