const consts = require("./consts");
const generateTags = (content, outputFolder, deps) => {
  const getTags = (content) =>
    content
      .filter(file => !!file.properties.tags)
      .map(file => file.properties.tags)
      .reduce((res, tags) => res.concat(tags), [])
      .filter((item, pos, self) => self.indexOf(item) === pos)
      .sort()
  const mdFiles =
    content
      .filter(file => file.type === consts.fileType.md)
  let tags = getTags(mdFiles);
  deps.fs.mkdirSync(deps.path.join(outputFolder, "tags"));
  const template = deps.getTemplate({})
  tags = tags.map(tagname => ({
    tag: tagname,
    title: tagname,
    relativePath: deps.path.join("tags", tagname + ".html"),
    type: "tag",
    files: mdFiles.filter(item => item.properties && item.properties.tags && item.properties.tags.indexOf(tagname) >= 0)
  })
  );
  tags.forEach(tag => {
    const formattedItems = tag.files
      .map(item => `<li class="item-md"><a href="../${item.relativePath.replace(/\.md$/i, ".html")}">${item.properties.title}</a></li>`)
      .join("\n");
    tag.content = `<ul class="post-list">${formattedItems}</ul>`
    const rendered = template(tag);
    deps.fs.writeFileSync(deps.path.join(outputFolder, tag.relativePath), rendered);
  })
  const formattedTags = tags.map(tag => `<li class="item-md"><a href="${tag.tag}.html">${tag.title}</a></li>`).join("\n");
  const tagIndex = {
    title: "Tags",
    content: `<ul class="post-list">${formattedTags}</ul>`,
    type: "tags",
    files: tags
  }
  const renderedTags = template(tagIndex)
  deps.fs.writeFileSync(deps.path.join(outputFolder, "tags", "index.html"), renderedTags)
};

module.exports = generateTags