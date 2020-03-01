const should = require("should")
const td = require("testdouble")
const templateFactory = require("../src/templateFactory")
const fakePath = require("./fakePath");

describe("template factory", () => {
  // given
  const fakeFs = td.object(["existsSync", "readFileSync"]);
  const customTemplatePath = fakePath.join("templates", "custom.handlebars");
  const fullPathTemplatePath = fakePath.join("somewhere", "other-custom.handlebars");
  const customDefaultTemplatePath = fakePath.join("some.handlebars");
  td.when(fakeFs.readFileSync(td.matchers.argThat(name => name.endsWith("/default.handlebars")))).thenReturn("default")
  td.when(fakeFs.existsSync(customTemplatePath)).thenReturn(true)
  td.when(fakeFs.readFileSync(customTemplatePath)).thenReturn("custom")
  td.when(fakeFs.existsSync(fullPathTemplatePath)).thenReturn(true)
  td.when(fakeFs.readFileSync(fullPathTemplatePath)).thenReturn("custom2")
  td.when(fakeFs.existsSync(customDefaultTemplatePath)).thenReturn(true)
  td.when(fakeFs.readFileSync(customDefaultTemplatePath)).thenReturn("customDefault")

  deps = {
    fs: fakeFs,
    path: fakePath
  }
  // when
  const getTemplate = templateFactory(undefined, "templates", deps)
  const customTemplate = getTemplate({ template: "custom" })({});
  const customTemplateWithExt = getTemplate({ template: "custom.handlebars" })({});
  const customFullPath = getTemplate({ template: fullPathTemplatePath })({});
  const defaultTemplate = getTemplate({})({});
  const getTemplateWithCustomDefault = templateFactory(customDefaultTemplatePath, "otherTemplates", deps);
  const customDefaultTemplate = getTemplateWithCustomDefault({})({})


  // then
  it("loads templates from layout with no extension", () => should(customTemplate).eql("custom"));
  it("loads templates from layout with extension", () => should(customTemplateWithExt).eql("custom"));
  it("loads templates from fullpath", () => should(customFullPath).eql("custom2"));
  it("defaults to the default template", () => should(defaultTemplate).eql("default"));
  it.skip("uses custom default template with full path", () => should(customDefaultTemplate).eql("customDefault"));
  it.skip("uses default in templates folder", () => { });
});