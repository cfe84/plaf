const consts = require("../src/consts");
const td = require("testdouble");
const generateIndex = require("../src/generateIndex")
const fakePath = require("./fakePath")

describe("generate index", () => {
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
    files: [mdFile, mdFileCustomLayout]
  };
  const folder2 = {
    type: consts.fileType.folder,
    title: "subfolder2",
    filename: "subfolder2",
    relativePath: 'subfolder2',
    files: []
  };
  const skippedIndexingfolder = {
    type: consts.fileType.folder,
    title: "subfolder3",
    filename: "subfolder3",
    relativePath: 'subfolder3',
    files: [],
    skipIndexing: true
  };
  const rootfolder = {
    type: consts.fileType.folder,
    title: "root",
    filename: "root",
    relativePath: '',
    files: [folder, folder2, skippedIndexingfolder]
  };
  const crawled = [
    rootfolder,
    mdFile,
    mdFileCustomLayout,
    folder,
    folder2
  ];

  const fakeGetTemplate = (props1) => (props2) => `${props1.template || "default"}: # ${props2.title} - ${props2.content}`
  const outputDirectory = "out-123"
  const fakeFs = td.object(["writeFileSync", "existsSync"]);
  td.when(fakeFs.existsSync(fakePath.join(outputDirectory, "subfolder2", "index.html"))).thenReturn(true)
  deps = {
    path: fakePath,
    fs: fakeFs,
    getTemplate: fakeGetTemplate
  }

  // when
  generateIndex(crawled, outputDirectory, deps)

  // then
  it("renders folder in root", () => {
    td.verify(fakeFs.writeFileSync(fakePath.join(outputDirectory, "index.html"),
      td.matchers.argThat(content => content.startsWith("default: # root - ") &&
        content.indexOf("subfolder") > 0
      )));
  })
  it("skips hidden folder in root", () => {
    td.verify(fakeFs.writeFileSync(fakePath.join(outputDirectory, "index.html"),
      td.matchers.argThat(content => content.startsWith("default: # root - ") &&
        content.indexOf("subfolder3") < 0
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
  });
  it("doesn't override custom indexes", () => {
    td.verify(fakeFs.writeFileSync(fakePath.join(outputDirectory, "subfolder2", "index.html"), td.matchers.anything()),
      { times: 0 });
  })
  it("doesn't index skipped folders", () => {
    td.verify(fakeFs.writeFileSync(fakePath.join(outputDirectory, "subfolder3", "index.html"), td.matchers.anything()),
      { times: 0 });
  })
});