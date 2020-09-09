const td = require("testdouble")
const consts = require("../src/consts")
const fakePath = require("./fakePath");
const should = require("should")
const encryptContent = require("../src/encryptContent")

describe("encrypt content", () => {
  // given
  const defaultPassword = "pwd1"
  const createContent = () => {
    const mdFile1 = {
      type: consts.fileType.md,
      filename: "mdFile-1.md",
      relativePath: "subfolder/mdFile-1.md",
      title: "title-1",
      content: "This is markdown",
      properties: { title: "title-1", tags: ['tag-1', 'tag-2'] }
    };
    const mdFile2 = {
      type: consts.fileType.md,
      filename: "mdFile-1.md",
      relativePath: "subfolder/mdFile-1.md",
      title: "title-1",
      content: "This is markdown also",
      properties: { password: "pwd2", title: "title-1", tags: ['tag-1', 'tag-2'] }
    };
    const txtFile = {
      type: consts.fileType.file,
      filename: "textfile-1.txt",
      relativePath: "subfolder/textfile-1.txt",
      title: "title-2",
      content: "This is text",
      properties: { title: 'title-2', tags: ['tag-2', 'tag-3'] }
    };
    return [
      mdFile1,
      mdFile2,
      txtFile,
    ];
  }

  const deps = {
    encrypt: (content, key) => {
      return `encrypt(${content}, ${key})`
    },
    path: fakePath,
    fs: td.object("readFileSync")
  }

  td.when(deps.fs.readFileSync(td.matchers.contains("encrypted.handlebars"))).thenReturn("TEMPLATE={{{content}}}=")

  context("with a default password", () => {
    // when
    const folderContent = createContent()
    encryptContent(defaultPassword)({ folderContent: folderContent, deps })

    // then
    it("encrypts markdown content with default password", () => {
      should(folderContent[0].content).eql(`TEMPLATE=${deps.encrypt("This is markdown", defaultPassword)}=`)
    })

    it("encrypts markdown content with file specific password", () => {
      should(folderContent[1].content).eql(`TEMPLATE=${deps.encrypt("This is markdown also", "pwd2")}=`)
    })

    it("doesn't touch text files", () => {
      should(folderContent[2].content).eql("This is text")
    })
  })

  context("with no password", () => {
    // when
    const folderContent = createContent()
    encryptContent(undefined)({ folderContent, deps })

    // then
    it("doesn't encrypt markdown content by default", () => {
      should(folderContent[0].content).eql("This is markdown")
    })

    it("encrypts markdown content with file specific password", () => {
      should(folderContent[1].content).eql(`TEMPLATE=${deps.encrypt("This is markdown also", "pwd2")}=`)
    })

    it("doesn't touch text files", () => {
      should(folderContent[2].content).eql("This is text")
    })
  })
});
