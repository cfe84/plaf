plaf is a markdown static website generator. It only expects you to write documents in markdown, with minimal profile. Use your own folder structure, your own file names, your own style with [handlebars](https://handlebarsjs.com/) templates. No config files. No conventions. 

## How does it work?

**Step 0.**: Install plaf (you need [nodejs](https://www.nodejs.org) for that.)

```sh
npm i -g plaf
```

**Step 1.** Go to the folder containing markdown files.

```sh
cd ~/my-folder
```

**Step 2.** Run plaf

```sh
plaf
```

**Step 3.** Success. You static website is in the `rendered` directory.

## What else can I do?

**Specify which folder to render, and where to output**

Use `--in` (or `-i`) to specify the input folder.

Use `--out` (or `-o`) to specify the output folder. **THE CONTENT OF THE OUTPUT FOLDER WILL BE WIPED BEFORE RENDERING, MAKE SURE YOU'RE OK WITH THAT**.

**Use templates**

Use your own templates using [handlebars](https://handlebarsjs.com) syntax. The content goes into a `content` variable. The title goes into a `title` variable. [This is an example](https://github.com/cfe84/plaf/blob/master/src/default.handlebars) of what a template looks like:

```html
<html>

<head>
  <title>{{title}}</title>

<body>
  <header>
    <div class="site-title">
      {{title}}
    </div>
  </header>
  <div>{{{content}}}</div>
</body>

</html>
```

To use a template, specify the `--template` (or `-t`) option to plaf, and point to the handlebars file.

**Your own variables**

Plaf supports yaml headers on your markdown files. Add this to your markdown file:


```md
---
title: This is the title
category: bla
---

This is the body
```

By default it's using your file names as title. You can override that with the headers. You can add all the headers you want, and use them as variables in your templates. Plaf also sends its internal values to the template, if you want to use them, including:

- `title`
- `type`: `md` for markdown files, `folder` for folders.
- `content` and `mdcontent`: the content.
- `path`, `relativePath`: files paths
- `tags`: a list of tags for md files
- `files`: a list of `files` contained in the folder or tag. These files have the same properties.

**Customize templates per file**

If you add a `template` property to your markdown headers, and set the value to the path of the file you want to use as a template.

**Create a template library**

Create a `.plaf` folder at the root of your markdown folder, and add template files to this folder. Then, from the markdown files, you can refer to these using only their names rather than their path. Plaf uses the `.handlebars` as default for the templates, so if you have a `.plaf/blog-post.handlebars` template file, then your header can be:

```md
---
title: This is a blog post
template: blog-post
---
```

You can point to another template library by using the `--templates` (or `-T`) option.

Plaf uses `default.handlebars` by default, and `index.handlebars` for indexes, and `tags.handlebars` for tags index.

**Use helpers in templates**

plaf uses handlebars for generation. It comes with the following helpers: `ne`, `eq`, `ge`, `lt`, `le`, `gt`. This means that you can use the following syntax in your template:

```handlebars
{{#if eq someproperty "true"}}
<script>somescript</script>
{{}}
```

You can add you custom helpers in the `.plaf/helpers` folder at the root of the directory you're processing. Plaf will use the file name, minus the `js` extension, as the helper name. The helper content must be a javascript function.

**Create your custom index**

If you don't want to use a list of the markdown files in the directory but use your own index instead, create an `index.md` or a `index.html` file in the directory, and plaf will use that instead.

**Copy resource files**

If you create a `.plaf/resources` directory, plaf will copy everything from it to the render directory, and will not index it. This is useful if you want to include things like fonts or CSS.

**Configure sub folders**

Add a `.plaf` file in a folder. Give it properties the same way you would a file. This way, you can specify a custom template for a given index.

**Use Markdown extensions**

If you use #tags in your md files, then plaf will use them and generate a tags index.

Plaf will also convert --> to &rarr; and ==> to &rArr; (and same for left). You can also try <=>, -- and ---, << and >>. To deactivate special characters processing, add `specialCharacters: false` in the front-matter or use command `--no-markdown-extensions`


It also handle footnotes in this format[^1].

[^1]: This is the footnote.

It also handles references like this `([ref](some link))` and will make them appear as superscript<sup><a href="#">ref</a></sup>

It processes wikilinks, such as `[[an article file name]]` or `[[an article file name|label for the link]]`. This will resolve to any markdown file in the current structure with a similar file name. It is case insensitive, and ignores spaces, dashed and underscores.

If you don't want plaf to mess with your markdown, use the `--no-markdown-extensions` (or `-M` for short) command.

**Build a client-side search index (experimental)**

Plaf uses [Lunr](https://lunrjs.com/guides/getting_started.html) to build a search catalog. If you use `--generate-search` it will build two files:
- `/search/catalog.js` which contains the search catalog as json (in `const catalog=`).
- `/search/search.js` which contains the search libs.

These can be used by adding a `search.md` file in a `search` directory in your folder using these. For example:

```
---
title: search
---

<div class="search-bar" id="loading">Loading search catalog...</div>

<script src="catalog.js"></script>
<script src="search.js"></script>
<script>
  function s(evt) {
    const searchResultsComponent = document.getElementById("search-results")
    const res = search(evt.value)
    searchResultsComponent.innerHTML = "";
    res
      .map(result => {
        const elt = document.createElement("li");
        elt.innerHTML = `<a href="/${result.relativePath.replace(/\.md$/, ".html")}">${result.title}</a>`
        return elt;
      })
      .forEach(elt => searchResultsComponent.appendChild(elt));
  }
  loading = document.getElementById("loading").remove();
</script>

<input type="text" class="search-bar" id="search-bar" onkeyup="s(this)">
<div>
    <ul id="search-results" class="post-list"></ul>
</div>

<script>
  document.getElementById("search-bar").focus()
</script>
```

Folders and files can be skipped from indexing by adding a `noSearch` property in their config files or front matter.

# Features

- [ ] generate search page 
- [ ] serve dynamically 

# What's new

## 1.22

Add support for WikiLinks.
