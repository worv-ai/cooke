/*
 * The site's nav, shared by index.html and leaderboard.html: the awning.
 * Home: only the striped valance hangs from the top of the page, deep at the top and a narrow fringe once the page
 * scrolls. The section links sit in a rail in the left margin from 1280px, and behind a floating "Sections" button
 * below that. The Leaderboard link is one of the hero's buttons.
 * Leaderboard: a dark fascia above the valance carries the name, the section links and the Leaderboard link.
 * Styles are in styles.css ("Nav", "Side rail"). Labels live in content.js (nav).
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
    // Home, from 1280px: the section links leave the band for a rail in the left margin (styles.css, "Side rail").
    const rail = home ? `<nav class="rail" aria-label="${N.label}"><ul>${N.links.map(([l, id]) => `<li><a href="#${id}"><span>${l}</span></a></li>`).join("")}</ul></nav>` : "";
    const sections = `<nav class="nav-sections" aria-label="${N.label}">
          <button class="nav-menu" type="button" aria-expanded="false" aria-controls="nav-links" aria-label="${N.label}">${menuIcon}<span>${N.label}</span></button>
          <ul class="nav-links" id="nav-links">${N.links.map(([l, id]) => `<li><a href="${href(id)}">${l}</a></li>`).join("")}</ul>
        </nav>`;
    const awning = `<div class="awning nav-awning" aria-hidden="true">${"<i></i>".repeat(24)}</div>`;
    // Home has no fascia: only the valance hangs from the top of the page. The Leaderboard link is one of the hero's
    // buttons (content.js), and below 1280px a floating "Sections" button stands in for the rail.
    if (home) return `<header class="nav is-home">${awning}${sections}</header>${rail}`;
    return `<header class="nav">
      <div class="nav-band"><div class="wrap nav-in">
        <a class="nav-wm" href="index.html" aria-label="${N.home}">${wordmark()}</a>
        ${sections}
        <a class="nav-lb" href="leaderboard.html" aria-current="page">${N.leaderboard}</a>
        ${extra}
      </div></div>
      ${awning}
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
    // The side rail comes in once the hero has mostly left the screen, and steps aside for the footer.
    const rail = document.querySelector(".rail");
    const hero = document.querySelector(".hero");
    const foot = document.querySelector(".foot");
    if (rail && hero) new IntersectionObserver(([e]) => rail.classList.toggle("is-on", !e.isIntersecting), { threshold: 0.4 }).observe(hero);
    if (rail && foot) new IntersectionObserver(([e]) => rail.classList.toggle("is-end", e.isIntersecting)).observe(foot);
  };

  return { wordmark, markup, wire };
})();
