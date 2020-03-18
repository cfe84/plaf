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
    properties: {
      template: "index"
    },
    title: "subfolder",
    filename: "subfolder",
    relativePath: 'subfolder',
    files: [mdFile, mdFileCustomLayout]
  };
  const folder2 = {
    type: consts.fileType.folder,
    properties: {
      template: "index"
    },
    title: "subfolder2",
    filename: "subfolder2",
    relativePath: 'subfolder2',
    files: []
  };
  const skippedIndexingfolder = {
    type: consts.fileType.folder,
    properties: {
      template: "index",
      skipIndexing: true
    },
    title: "subfolder3",
    filename: "subfolder3",
    relativePath: 'subfolder3',
    files: [],
  };
  const hiddenfolder = {
    type: consts.fileType.folder,
    properties: {
      template: "index",
      hidden: true
    },
    title: "hiddenSubfolder",
    filename: "hiddenSubfolder",
    relativePath: 'hiddenSubfolder',
    files: [],
  };
  const rootfolder = {
    type: consts.fileType.folder,
    title: "root",
    properties: {
      template: "index"
    },
    filename: "root",
    relativePath: '',
    files: [folder, folder2, skippedIndexingfolder, hiddenfolder]
  };
  const crawled = [
    rootfolder,
    mdFile,
    mdFileCustomLayout,
    folder,
    folder2,
    skippedIndexingfolder,
    hiddenfolder
  ];

  const fakeGetTemplate = (props1) => (props2) => `${(props1.properties ? props1.properties.template : "") || "default"}: # ${props2.title} - ${props2.content}`
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

  it("passes the template", () => {
    td.verify(fakeFs.writeFileSync(fakePath.join(outputDirectory, "index.html"),
      td.matchers.argThat(content => content.startsWith("index: # root - "))));
  });
  // then
  it("renders folders in root", () => {
    td.verify(fakeFs.writeFileSync(fakePath.join(outputDirectory, "index.html"),
      td.matchers.argThat(content => content.startsWith("index: # root - ") &&
        content.indexOf("subfolder") > 0 &&
        content.indexOf("subfolder3") > 0
      )));
  })
  it("skips hidden folder in root", () => {
    td.verify(fakeFs.writeFileSync(fakePath.join(outputDirectory, "index.html"),
      td.matchers.argThat(content => content.startsWith("index: # root - ") &&
        content.indexOf("hiddenSubfolder") < 0
      )));
  })
  it("does not render content from subfolders in root", () => {
    td.verify(fakeFs.writeFileSync(fakePath.join(outputDirectory, "index.html"),
      td.matchers.argThat(content => content.startsWith("index: # root - ") &&
        content.indexOf("mdFile.html") < 0 &&
        content.indexOf("title-1") < 0
      )));
  })
  it("does not render root folder within root folder itself", () => {
    td.verify(fakeFs.writeFileSync(fakePath.join(outputDirectory, "index.html"),
      td.matchers.argThat(content => content.startsWith("index: # root - ") &&
        content.indexOf(">root<") < 0
      )));
  })
  it("renders indexes in subfolders", () => {
    td.verify(fakeFs.writeFileSync(fakePath.join(outputDirectory, "subfolder", "index.html"),
      td.matchers.argThat(content => content.startsWith("index: # subfolder - ") &&
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
  it("indexes hidden folders", () => {
    td.verify(fakeFs.writeFileSync(fakePath.join(outputDirectory, "hiddenSubfolder", "index.html"), td.matchers.anything()));
  })
});