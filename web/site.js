(function () {
  var KEY = "caption-site-lang";

  function apply(lang) {
    if (lang !== "en" && lang !== "vi") lang = "vi";
    document.documentElement.lang = lang;
    try {
      localStorage.setItem(KEY, lang);
    } catch (err) {
      /* Storage can be blocked. The page still switches for this visit. */
    }

    var title = document.querySelector("title");
    if (title) {
      var nextTitle = title.getAttribute(lang === "en" ? "data-en" : "data-vi");
      if (nextTitle) title.textContent = nextTitle;
    }

    var desc = document.querySelector('meta[name="description"]');
    if (desc) {
      var nextDesc = desc.getAttribute(lang === "en" ? "data-en" : "data-vi");
      if (nextDesc) desc.setAttribute("content", nextDesc);
    }

    document.querySelectorAll(".lang-btn").forEach(function (btn) {
      btn.setAttribute("aria-pressed", btn.getAttribute("data-lang") === lang ? "true" : "false");
    });
  }

  document.querySelectorAll(".lang-btn").forEach(function (btn) {
    btn.addEventListener("click", function () {
      apply(btn.getAttribute("data-lang"));
    });
  });

  apply(document.documentElement.lang);
})();
