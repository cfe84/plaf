const consts = require("../src/consts");
const td = require("testdouble");
const generateIndex = require("../src/generateIndex")
const fakePath = require("./fakePath")

describe("renderMd", () => {
  // given
  const mdFile = {
    type: consts.fileType.md,
    filename: "mdFile.md",
    relativePath: "subfolder/mdFile.md",
    title: "title-1",
    properties: { title: 'title-1' }
  };
  const mdFileCustomLayout = {
    type: consts.fileType.md,
    filename: "mdFileCustom.md",
    relativePath: "subfolder/mdFileCustom.md",
    title: "title-2",
    properties: { title: 'title-2' }
  };
  const folder = {
    type: consts.fileType.folder,
    title: "subfolder",
    filename: "subfolder",
    relativePath: 'subfolder',
    content: [mdFile, mdFileCustomLayout]
  };
  const crawled = [
    mdFile,
    mdFileCustomLayout,
    folder
  ];

  const fakeGetTemplate = (props1) => (props2) => `${props1.template || "default"}: # ${props2.title} - ${props2.content}`
  const fakeFs = td.object(["writeFileSync"]);
  deps = {
    path: fakePath,
    fs: fakeFs,
    getTemplate: fakeGetTemplate
  }
  const outputDirectory = "out-123"

  // when
  generateIndex(crawled, outputDirectory, "blerh", deps)

  // then
  it("renders indexes in subfolders", () => {
    td.verify(fakeFs.writeFileSync(fakePath.join(outputDirectory, "subfolder", "index.html"),
      td.matchers.argThat(content => content.startsWith("default: # subfolder - ") &&
        content.indexOf("mdFile.html") > 0 &&
        content.indexOf("mdFileCustom.html") > 0 &&
        content.indexOf("title-1") > 0 &&
        content.indexOf("title-2") > 0 &&
        content.indexOf("title-2") > content.indexOf("title-1")
      )));
    td.verify(fakeFs.writeFileSync(fakePath.join(outputDirectory, "/index.html"),
      td.matchers.argThat(content => content.startsWith("default: # blerh - ") &&
        content.indexOf("mdFile.html") < 0 &&
        content.indexOf("mdFileCustom.html") < 0 &&
        content.indexOf("subfolder/index.html") > 0
      )));
  })
});