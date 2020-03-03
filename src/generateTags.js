const consts = require("./consts");
const generateTags = (content, outputFolder, deps) => {
  const getTags = (content) =>
    content
      .filter(file => !!file.properties.tags)
      .map(file => file.properties.tags)
      .reduce((res, tags) => res.concat(tags), [])
      .filter((item, pos, self) => self.indexOf(item) === pos)
      .sort()
  const md =
    content
      .filter(file => file.type === consts.fileType.md)
  const tags = getTags(md);
  console.log(tags)
  deps.fs.mkdirSync(deps.path.join(outputFolder, "tags"));
  const template = deps.getTemplate({})
  tags.forEach(tag => {
    const items = md.filter(item => item.properties && item.properties.tags && item.properties.tags.indexOf(tag) >= 0);
    const formattedItems = items
      .map(item => `<li class="item-md"><a href="../${item.relativePath.replace(/\.md$/i, ".html")}">${item.properties.title}</a></li>`)
      .join("\n");
    const rendered = template({ title: tag, content: `<ul class="post-list">${formattedItems}</ul>` });
    deps.fs.writeFileSync(deps.path.join(outputFolder, "tags", tag + ".html"), rendered);
  })
  const formattedTags = tags.map(tag => `<li class="item-md"><a href="${tag}.html">${tag}</a></li>`).join("\n");
  const renderedTags = template({ title: "Tags", content: `<ul class="post-list">${formattedTags}</ul>` })
  deps.fs.writeFileSync(deps.path.join(outputFolder, "tags", "index.html"), renderedTags)
};

module.exports = generateTags