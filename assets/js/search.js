document.addEventListener("DOMContentLoaded", function() {
  const searchInput = document.getElementById("search-input");
  const resultsContainer = document.getElementById("search-results");
  
  if (!searchInput || !resultsContainer) return;
  
  let posts = [];
  let searchTimeout;
  
  // Fetch search data
  fetch(resultsContainer.dataset.indexUrl || "/blog/search.json")
    .then(response => response.json())
    .then(data => {
      posts = data;
    })
    .catch(err => console.error("Search index load error:", err));
  
  // Search function
  function performSearch() {
    const query = searchInput.value.toLowerCase().trim();
    
    if (query.length < 2) {
      resultsContainer.innerHTML = "";
      resultsContainer.classList.remove("show");
      return;
    }
    
    const results = posts.filter(post => {
      return (post.title && post.title.toLowerCase().includes(query)) ||
             (post.content && post.content.toLowerCase().includes(query)) ||
             (post.tags && post.tags.toLowerCase().includes(query)) ||
             (post.category && post.category.toLowerCase().includes(query));
    }).slice(0, 8);
    
    if (results.length === 0) {
      resultsContainer.innerHTML = '<div class="search-empty"><i class="fas fa-search"></i> No results found</div>';
      resultsContainer.classList.add("show");
      return;
    }
    
    resultsContainer.innerHTML = results.map(post => `
      <a href="${post.url}" class="search-result-item">
        <div class="search-result-title">${post.title}</div>
        <div class="search-result-meta">
          <span><i class="fas fa-tag"></i> ${post.category || "Uncategorized"}</span>
          <span><i class="fas fa-calendar"></i> ${post.date || ""}</span>
        </div>
      </a>
    `).join("");
    
    resultsContainer.classList.add("show");
  }
  
  // Input event with debounce
  searchInput.addEventListener("input", function() {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(performSearch, 300);
  });
  
  // Close results when clicking outside
  document.addEventListener("click", function(e) {
    if (!searchInput.contains(e.target) && !resultsContainer.contains(e.target)) {
      resultsContainer.classList.remove("show");
    }
  });
  
  // Prevent closing when clicking inside results
  resultsContainer.addEventListener("click", function(e) {
    e.stopPropagation();
  });
  
  // Handle Enter key
  searchInput.addEventListener("keypress", function(e) {
    if (e.key === "Enter") {
      e.preventDefault();
      const firstResult = resultsContainer.querySelector(".search-result-item");
      if (firstResult) {
        window.location.href = firstResult.href;
      }
    }
  });
});
