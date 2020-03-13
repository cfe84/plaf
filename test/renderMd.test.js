const consts = require("../src/consts");
const td = require("testdouble");
const renderMd = require("../src/renderMd")
const fakePath = require("./fakePath")

describe("renderMd", () => {
  // given
  const mdFile = {
    type: consts.fileType.md,
    path: 'start/markdown1.md',
    relativePath: 'markdown1.md',
    filename: 'markdown1.md',
    content: "the content",
    properties: { title: 'The title' }
  };
  const mdFileCustomLayout = {
    type: consts.fileType.md,
    path: 'start/markdown2.md',
    relativePath: 'markdown2.md',
    filename: 'markdown2.md',
    content: "the other content",
    properties: { title: 'The title', template: "something" }
  };
  const folder = {
    type: consts.fileType.folder,
    filename: 'subfolder',
    path: 'start/subfolder',
    relativePath: 'subfolder',
    files: [mdFile, mdFileCustomLayout]
  };
  const crawled = [
    mdFile,
    mdFileCustomLayout,
    folder
  ];

  const fakeGetTemplate = (props1) => (props2) => `${props1.template || "default"}: # ${props2.properties.title} - ${props2.content}`
  const fakeFs = td.object(["writeFileSync"]);
  deps = {
    path: fakePath,
    fs: fakeFs,
    getTemplate: fakeGetTemplate
  }
  const outputDirectory = "out-123"

  // when
  renderMd(crawled, outputDirectory, deps)

  // then
  it("renders markdown files in templates", () => {
    td.verify(fakeFs.writeFileSync(td.matchers.anything(), td.matchers.anything()), { times: 2 });
    td.verify(fakeFs.writeFileSync(fakePath.join(outputDirectory, "markdown1.html"), "default: # The title - the content"));
    td.verify(fakeFs.writeFileSync(fakePath.join(outputDirectory, "markdown2.html"), "something: # The title - the other content"));
  })
});