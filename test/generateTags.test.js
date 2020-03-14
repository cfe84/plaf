const consts = require("../src/consts");
const td = require("testdouble");
const generateTags = require("../src/generateTags")
const fakePath = require("./fakePath")

describe("generate tags", () => {
  // given
  const mdFile1 = {
    type: consts.fileType.md,
    filename: "mdFile-1.md",
    relativePath: "subfolder/mdFile-1.md",
    title: "title-1",
    properties: { title: "title-1", tags: ['tag-1', 'tag-2'] }
  };
  const mdFile2 = {
    type: consts.fileType.md,
    filename: "mdFile-2.md",
    relativePath: "subfolder/mdFile-2.md",
    title: "title-2",
    properties: { title: 'title-2', tags: ['tag-2', 'tag-3'] }
  };
  const crawled = [
    mdFile1,
    mdFile2,
  ];

  const fakeGetTemplate = (props1) => (props2) => `${props1.template || "default"}: # ${props2.title} - ${props2.content} - l${props2.files.length} - -${props2.type}-`
  const fakeFs = td.object(["writeFileSync", "mkdirSync"]);
  deps = {
    path: fakePath,
    fs: fakeFs,
    getTemplate: fakeGetTemplate
  }
  const outputDirectory = "out-123"

  // when
  generateTags(crawled, outputDirectory, deps)

  // then
  it("creates tags folder", () => { td.verify(fakeFs.mkdirSync(fakePath.join(outputDirectory, "tags"))) })
  it("generates tags files", () => {
    td.verify(fakeFs.writeFileSync(fakePath.join(outputDirectory, "tags", "tag-2.html"),
      td.matchers.argThat(content => content.startsWith("default: # tag-2 - ") &&
        content.indexOf("mdFile-1.html") > 0 &&
        content.indexOf("title-1") > 0 &&
        content.indexOf("mdFile-2.html") > 0 &&
        content.indexOf("title-2") > 0 &&
        content.indexOf("l2") > 0 &&
        content.indexOf("-tag-") > 0
      )));
    td.verify(fakeFs.writeFileSync(fakePath.join(outputDirectory, "tags", "tag-1.html"),
      td.matchers.argThat(content => content.startsWith("default: # tag-1 - ") &&
        content.indexOf("mdFile-1.html") > 0 &&
        content.indexOf("title-1") > 0 &&
        content.indexOf("mdFile-2.html") < 0 &&
        content.indexOf("l1") > 0 &&
        content.indexOf("title-2") < 0
      )));
    td.verify(fakeFs.writeFileSync(fakePath.join(outputDirectory, "tags", "tag-3.html"),
      td.matchers.argThat(content => content.startsWith("default: # tag-3 - ") &&
        content.indexOf("mdFile-1.html") < 0 &&
        content.indexOf("title-1") < 0 &&
        content.indexOf("mdFile-2.html") > 0 &&
        content.indexOf("l1") > 0 &&
        content.indexOf("title-2") > 0
      )));
  });
  it("generates tags index", () => {
    td.verify(fakeFs.writeFileSync(fakePath.join(outputDirectory, "tags", "index.html"),
      td.matchers.argThat(content => content.startsWith("default: # Tags - ") &&
        content.indexOf("tag-1.html") > 0 &&
        content.indexOf("tag-2.html") > 0 &&
        content.indexOf("tag-3.html") > 0 &&
        content.indexOf("tag-1") > 0 &&
        content.indexOf("tag-2") > 0 &&
        content.indexOf("tag-3") > 0 &&
        content.indexOf("tag-1") > content.indexOf("tag-2") &&
        content.indexOf("tag-3") > content.indexOf("tag-2") &&
        content.indexOf("l3") > 0 &&
        content.indexOf("-tags-") > 0
      )));
  })

});