const td = require("testdouble")
const consts = require("../src/consts")
const generateSearch = require("../src/generateSearch")
const fakePath = require("./fakePath");

describe("generate search", () => {

  it("should save search", () => {
    // given
    const fakePath = td.object("join");
    td.when(fakePath.join(td.matchers.anything(), td.matchers.anything(), "lunr.js")).thenReturn("lunr")
    td.when(fakePath.join(td.matchers.anything(), "loadSearch.js")).thenReturn("search")
    td.when(fakePath.join("output", "search", "search.js")).thenReturn("out")
    const fakeFs = td.object(["writeFileSync", "readFileSync"]);
    td.when(fakeFs.readFileSync("lunr")).thenReturn("lunarContent")
    td.when(fakeFs.readFileSync("search")).thenReturn("removeThisLine\nsearchContent\nremoveThisOneAsWell")
    const deps = {
      path: fakePath,
      fs: fakeFs
    }

    // when
    generateSearch("output", deps)

    // then
    td.verify(fakeFs.writeFileSync("out", td.matchers.argThat(content =>
      content.indexOf("lunarContent") >= 0 &&
      content.indexOf("searchContent") >= 0 &&
      content.indexOf("removeThisLine") < 0 &&
      content.indexOf("removeThisOneAsWell") < 0
    )));
  });

})