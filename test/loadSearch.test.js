const should = require("should");
const loadSearch = require("../src/loadSearch")

describe("search", () => {
  context("it searches terms in the catalog", () => {
    // if
    const catalog = [
      { title: "a first thing", mdcontent: "the hairy cat eats a banana", tags: ["police", "crime"] },
      { title: "a second thing", mdcontent: "the mushy food eats straight pages", tags: ["arachnophoby", "spectacles"] },
    ]

    // when
    const search = loadSearch(catalog);

    // then
    it("finds a single word in title", () => {
      const firstResults = search("first");
      should(firstResults).have.length(1);
      should(firstResults[0]).deepEqual(catalog[0]);
    });

    it("finds a word in multiple contents", () => {
      const eatResults = search("eat");
      should(eatResults).have.length(2);
      should(eatResults).containEql(catalog[0]);
      should(eatResults).containEql(catalog[1]);
    })

    it("finds a tag", () => {
      const tagResult = search("spectacle")
      should(tagResult).have.length(1);
      should(tagResult[0]).eql(catalog[1])
    })
  })
})