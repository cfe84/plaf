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
  const rootfolder = {
    type: consts.fileType.folder,
    title: "root",
    filename: "root",
    relativePath: '',
    content: [folder]
  };
  const crawled = [
    rootfolder,
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
  generateIndex(crawled, outputDirectory, deps)

  // then
  it("renders folder in root", () => {
    td.verify(fakeFs.writeFileSync(fakePath.join(outputDirectory, "index.html"),
      td.matchers.argThat(content => content.startsWith("default: # root - ") &&
        content.indexOf("subfolder") > 0
      )));
  })
  it("does not render content from subfolders in root", () => {
    td.verify(fakeFs.writeFileSync(fakePath.join(outputDirectory, "index.html"),
      td.matchers.argThat(content => content.startsWith("default: # root - ") &&
        content.indexOf("mdFile.html") < 0 &&
        content.indexOf("title-1") < 0
      )));
  })
  it("does not render root folder within root folder itself", () => {
    td.verify(fakeFs.writeFileSync(fakePath.join(outputDirectory, "index.html"),
      td.matchers.argThat(content => content.startsWith("default: # root - ") &&
        content.indexOf(">root<") < 0
      )));
  })
  it("renders indexes in subfolders", () => {
    td.verify(fakeFs.writeFileSync(fakePath.join(outputDirectory, "subfolder", "index.html"),
      td.matchers.argThat(content => content.startsWith("default: # subfolder - ") &&
        content.indexOf("mdFile.html") > 0 &&
        content.indexOf("mdFileCustom.html") > 0 &&
        content.indexOf("title-1") > 0 &&
        content.indexOf("title-2") > 0 &&
        content.indexOf("title-2") > content.indexOf("title-1")
      )));
  })
});