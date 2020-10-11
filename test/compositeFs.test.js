const compositeFs = require("../src/compositeFs")
const inMemoryFs = require("../src/inMemoryFs")
const linkFs = require("../src/linkFs")

describe("CompositeFS", () => {
  // given
  fs1 = inMemoryFs({})
  fs2 = inMemoryFs({})
  fs3 = linkFs({ fs: fs1 })
  compFs = compositeFs(fs1, fs2, fs3)
  fs1.mkdirSync("root")
  fs1.writeFileSync("root/file1.txt", "file1")
  fs2.mkdirSync("root")
  fs2.writeFileSync("root/file1.txt", "nope")
  fs2.writeFileSync("root/file2.txt", "file2")
  fs2.mkdirSync("root/dir2")

  // when
  const file1 = compFs.readFileSync("root/file1.txt")
  const file2 = compFs.readFileSync("root/file2.txt")
  compFs.writeFileSync("root/file3.txt", "file3")
  const file3 = fs1.readFileSync("root/file3.txt")
  compFs.copyFileSync("root/file3.txt", "out/file3.txt")
  const file4 = fs3.readFileSync("out/file3.txt")

  // then
  it("should read from fs1 first", () => should(file1).eql("file1"))
  it("should read from fs2 if not found in f1", () => should(file2).eql("file2"))
  it("should create file on fs1", () => should(file3).eql("file3"))
  it("should find subdir on fs2", () => should(compFs.readdirSync("root/dir2")).be.empty())
  it("should lstat files and folders", () => {
    should(compFs.lstatSync("root/dir2").isDirectory()).be.true()
    should(compFs.lstatSync("root/file1.txt").isDirectory()).be.false()
  })
  it("should throw for file not found", () => should(() => compositeFs.readFileSync("root/file-not.txt")).throw())
  it("should throw for directory not found", () => {
    should(() => compositeFs.readdirSync("root/dir3")).throw()
    should(() => compositeFs.lstatSync("root/dir3").isDirectory()).throw()
  })
  it("should default to the first capable for copying", () => {
    should(file4).eql("file3")
  })
})