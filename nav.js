/*
 * The site's nav, shared by index.html and leaderboard.html: the awning. A dark fascia carries the name, the
 * section links and the Leaderboard link, and the striped valance hangs from it. The valance is deep at the top of a
 * page and folds up to a narrow fringe once the page scrolls (styles.css, "Nav"). Below 1000px the section links
 * fold into a "Sections" menu. Labels live in content.js (nav).
 */
window.NAV = (() => {
  // COOK·E logo. The face's eyes are drawn here so they can blink (positions from media/cooke-logo.json).
  const wordmark = () => `<span class="wm" role="img" aria-label="COOK·E"><svg viewBox="0 0 1400 248" aria-hidden="true">
    <image class="wm-day" href="media/cooke-logo.png" width="1400" height="248"/>
    <image class="wm-night" href="media/cooke-logo-ink.png" width="1400" height="248"/>
    <g class="wm-eye" fill="#fefdfd"><ellipse cx="560.84" cy="97.38" rx="10.82" ry="18.03"/><ellipse cx="635.68" cy="97.38" rx="10.52" ry="18.03"/></g>
  </svg></span>`;

  const menuIcon = '<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M3 5.5h14M3 10h14M3 14.5h14"/></svg>';

  // page: "home" (index.html, in-page links) or "leaderboard". `extra` goes after the Leaderboard link (the night switch).
  const markup = (C, page, extra = "") => {
    const N = C.nav;
    const home = page === "home";
    const href = (id) => (home ? `#${id}` : `index.html#${id}`);
    return `<header class="nav">
      <div class="nav-band"><div class="wrap nav-in">
        <a class="nav-wm" href="${home ? "#top" : "index.html"}" aria-label="${home ? N.top : N.home}">${wordmark()}</a>
        <nav class="nav-sections" aria-label="${N.label}">
          <button class="nav-menu" type="button" aria-expanded="false" aria-controls="nav-links" aria-label="${N.label}">${menuIcon}<span>${N.label}</span></button>
          <ul class="nav-links" id="nav-links">${N.links.map(([l, id]) => `<li><a href="${href(id)}">${l}</a></li>`).join("")}</ul>
        </nav>
        <a class="nav-lb" href="leaderboard.html"${home ? "" : ' aria-current="page"'}>${N.leaderboard}</a>
        ${extra}
      </div></div>
      <div class="awning nav-awning" aria-hidden="true">${"<i></i>".repeat(24)}</div>
    </header>`;
  };

  const wire = () => {
    const el = document.querySelector(".nav");
    if (!el) return;
    // The valance folds up once the page has scrolled a little.
    const fold = () => el.classList.toggle("is-compact", scrollY > 24);
    addEventListener("scroll", fold, { passive: true });
    fold();
    // Sections menu (narrow screens).
    const btn = el.querySelector(".nav-menu");
    const set = (open) => { btn.setAttribute("aria-expanded", open); el.classList.toggle("is-open", open); };
    btn.addEventListener("click", () => set(btn.getAttribute("aria-expanded") !== "true"));
    el.querySelector(".nav-links").addEventListener("click", (e) => { if (e.target.closest("a")) set(false); });
    document.addEventListener("keydown", (e) => { if (e.key === "Escape" && el.classList.contains("is-open")) { set(false); btn.focus(); } });
    document.addEventListener("click", (e) => { if (!el.contains(e.target)) set(false); });
  };

  return { wordmark, markup, wire };
})();
