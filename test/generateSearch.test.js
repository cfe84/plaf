const td = require("testdouble")
const consts = require("../src/consts")
const generateSearchCatalog = require("../src/generateSearchCatalog")
const generateSearchPage = require("../src/generateSearchPage")
const fakePath = require("./fakePath");
const should = require("should")

describe("generate search", () => {

  context("should generate search elements", () => {
    // given
    const fakePath = td.object("join");
    td.when(fakePath.join(td.matchers.anything(), td.matchers.anything(), "lunr.js")).thenReturn("lunr")
    td.when(fakePath.join(td.matchers.anything(), "loadSearch.js")).thenReturn("search")
    td.when(fakePath.join("output", "search", "search.js")).thenReturn("out")
    const fakeFs = td.object(["writeFileSync", "readFileSync", "existsSync"]);
    td.when(fakeFs.readFileSync("lunr")).thenReturn("lunarContent")
    td.when(fakeFs.readFileSync("search")).thenReturn("removeThisLine\nsearchContent\nremoveThisOneAsWell")
    const deps = {
      path: fakePath,
      fs: fakeFs
    }
    const folderContent = []
    td.when(fakePath.join(td.matchers.anything(), "search", "indexTemplate.md")).thenReturn("SEARCH_TEMPLATE")
    td.when(fakeFs.readFileSync("SEARCH_TEMPLATE")).thenReturn("SEARCH_TEMPLATE_CONTENT")
    td.when(fakePath.join("input", "search", "index.md")).thenReturn("SEARCHINDEX")
    td.when(fakePath.join("search", "index.md")).thenReturn("SEARCHFILE")
    td.when(fakeFs.existsSync("SEARCHINDEX")).thenReturn(false)

    // when
    generateSearchPage({ inputFolder: ".", folderContent, deps })
    generateSearchCatalog({ outputFolder: "output", deps })

    // then
    it("generates catalog", () => {
      td.verify(fakeFs.writeFileSync("out", td.matchers.argThat(content =>
        content.indexOf("lunarContent") >= 0 &&
        content.indexOf("searchContent") >= 0 &&
        content.indexOf("removeThisLine") < 0 &&
        content.indexOf("removeThisOneAsWell") < 0
      )));
    })
    it("adds search folder if it aint there", () => {
      const folder = folderContent[0]
      should(folder.relativePath).equal("search")
      should(folder.type).equal("folder")
    })
    it("generates search page if it aint there", () => {
      const search = folderContent[1]
      should(search).not.be.undefined()
      should(search.type).equal("md")
      should(search.relativePath).equal("SEARCHFILE")
      should(search.content).eql("SEARCH_TEMPLATE_CONTENT")
      should(search.properties).eql({ title: "Search" })
    })
  });

})