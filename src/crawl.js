const consts = require("./consts");

const tagRegex = /(^| )#([a-zA-Z0-9-_]+)/gm


const crawl = (inputFolder, outputFolder, defaultTemplate, deps) => {

  const fixMdLinks = (content) => {
    const regex = /.md(#\w+)?\)/g
    return content.replace(regex, ".html$1)");
  }

  const replaceRefs = (content) => {
    const referenceRegex = /\s*\((\[ref\]\([^)]+\))\)/g
    return content
      .replace(referenceRegex, `<sup>$1</sup>`)
  }

  const replaceFootNotes = (content) => {
    const notesRegex = /(?:\s|^)\[\^(\d+)\]\s*:/g
    const referenceRegex = /(\S)\[\^(\d+)\]/g
    return content
      .replace(notesRegex, ` <a name="note-$1" href="#ref-$1">[$1]</a>: `)
      .replace(referenceRegex, `$1<sup><a name="ref-$2" href="#note-$2">[$2]</a></sup>`)
  }

  const replaceTags = (content) => {
    return content.replace(tagRegex, `$1<a href="/tags/$2.html">#$2</a>`);
  }

  const parseContent = (content) => {
    const headerStartLineIndex = content.indexOf("---\n");
    if (headerStartLineIndex < 0) {
      return { content };
    }
    const headerFinishLineIndex = content.indexOf("---\n", headerStartLineIndex + 3);
    if (headerFinishLineIndex < 0) {
      return { content };
    }
    const headerContent = content.substring(headerStartLineIndex + 4, headerFinishLineIndex).trim();
    const onlyContent = content.substring(headerFinishLineIndex + 4).trim();
    const headerRegex = /^([^:]+)\s*:\s*(.*)/;
    const headers = headerContent
      .split("\n")
      .map(line => {
        const matches = headerRegex.exec(line);
        return {
          key: matches[1],
          value: matches[2]
        }
      })
      .reduce((aggregatedObject, line) => { aggregatedObject[line.key] = line.value; return aggregatedObject }, {});
    const tagMatches = onlyContent.match(tagRegex);
    const tags = tagMatches ? tagMatches.map(tag => tag.substring(1)) : [];
    const res = {
      content: onlyContent,
      headers: headers,
      tags
    }
    return res;
  }

  const loadTemplate = (headers) => {
    if (headers && headers.template && deps.fs.existsSync(headers.template)) {
      return deps.fs.readFileSync(headers.template);
    } else {
      return defaultTemplate
    }
  }

  const renderMd = (file) => {
    const content = `${deps.fs.readFileSync(file)}`;
    const parsedContent = parseContent(content);
    const rendered = deps.marked(fixMdLinks(replaceRefs(replaceTags(replaceFootNotes(parsedContent.content)))));
    const template = loadTemplate(parsedContent.headers);

    const formatter = deps.handlebars.compile(template);
    const values = parsedContent.headers || {};
    if (!values.title)
      values.title = deps.path.basename(file).replace(".md", "");
    values.content = rendered;
    result = formatter(values)
    return {
      rendered: result,
      title: values.title,
      file: file.substring(0, file.length - 3) + ".html",
      tags: parsedContent.tags || []
    };
  }

  function isIgnored(file) {
    return file[0] === "."
      || file === outputFolder
  }

  const crawlFolder = (inputFolder, inputRelativePath = "") => {
    const files = deps.fs.readdirSync(inputFolder);
    const res = files.map(file => {
      if (isIgnored(file)) {
        return {
          type: "ignore"
        }
      }
      const filePath = deps.path.join(inputFolder, file)
      const relativePath = deps.path.join(inputRelativePath, file).replace(/^\//, "");
      const stats = deps.fs.lstatSync(filePath);
      if (stats.isDirectory()) {
        const content = crawlFolder(filePath, relativePath);
        return {
          type: consts.fileType.folder,
          filename: file,
          path: filePath,
          relativePath,
          content
        }
        // } else if (deps.path.extname(file) === ".md") {
        //   const res = renderMd(filePath)
        //   return {
        //     type: consts.fileType.md,
        //     rendered: res.rendered,
        //     title: res.title,
        //     tags: res.tags,
        //     file: deps.path.basename(res.file),
        //     name: file
        //   }
      } else {
        return {
          type: consts.fileType.file,
          path: filePath,
          relativePath,
          filename: file
        }
      }
    })
      .reduce((result, file) => {
        if (file.type === "folder") {
          result.push(file)
          const content = file.content;
          return result.concat(content)
        } else {
          result.push(file);
        }
        return result;
      }, [])
      .filter(file => file.type !== "ignore");
    return res;
  }

  const folderContent = crawlFolder(inputFolder, "");

  return folderContent;
}

module.exports = crawl;