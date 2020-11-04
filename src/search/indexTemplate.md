<div class="search-bar" id="loading">Loading search catalog...</div>

<script src="catalog.js"></script>
<script src="search.js"></script>
<script>  
  function s(evt) {
    if (window.history) {
      window.history.pushState("", `Search: ${evt.value}`, `?q=${evt.value}`)
    }
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
  document.getElementById("loading").remove();
</script>

<input type="text" class="search-bar" id="search-bar" onkeyup="s(this)">
<div>
  <ul id="search-results" class="post-list"></ul>
</div>

<script>
  (() => {
    document.getElementById("search-bar").focus()
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has("q")) {
      const query = urlParams.get("q")
      document.getElementById("search-bar").value = query
      document.getElementById("search-bar").onkeyup()
    }
  })()
</script>