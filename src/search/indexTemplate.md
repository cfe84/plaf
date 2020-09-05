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