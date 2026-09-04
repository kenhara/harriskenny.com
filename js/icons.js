window.ICONS = {
  /* DOS names: ABOUT.EXE is local; everything else is the real domain. */
  files: {
    harris: "ABOUT.EXE",
    outboundsync: "OUTBOUNDSYNC.COM",
    omarchy: "OMARCHY.ORG",
    github: "GITHUB.COM",
    linkedin: "LINKEDIN.COM",
    x: "X.COM",
  },
  /* Photos and official logos as <img>. Era plates wrap them; GitHub and
     Omarchy always sit white/green on a black plate. Brand marks keep their colors. */
  marks: {
    harris: '<img class="glyph glyph-photo" data-icon="harris" src="img/harris-kenny-headshot.jpg?v=1788464000" alt="" width="32" height="32">',
    outboundsync: '<img class="glyph glyph-logo" data-icon="outboundsync" src="img/outboundsync.svg?v=1788464000" alt="" width="32" height="32">',
    omarchy: '<img class="glyph glyph-logo" data-icon="omarchy" src="img/omarchy-logo.svg?v=1788464000" alt="" width="32" height="32">',
    github: '<img class="glyph glyph-logo" data-icon="github" src="img/github.svg?v=1788464000" alt="" width="32" height="32">',
    linkedin: '<img class="glyph glyph-logo" data-icon="linkedin" src="img/linkedin.svg?v=1788464000" alt="" width="32" height="32">',
    x: '<img class="glyph glyph-logo" data-icon="x" src="img/x.svg?v=1788464000" alt="" width="32" height="32">',
    sparklekeys: '<svg class="glyph" viewBox="0 0 32 32" shape-rendering="crispEdges"><rect width="32" height="32" fill="#111"/><rect x="1" y="1" width="30" height="30" fill="#d8d0c0"/><rect x="4" y="16" width="24" height="12" fill="#c8c0b0"/><rect x="6" y="18" width="3" height="4" fill="#fff"/><rect x="11" y="18" width="3" height="4" fill="#fff"/><rect x="16" y="18" width="3" height="4" fill="#fff"/><rect x="21" y="18" width="3" height="4" fill="#fff"/><path d="M16 3l2 5h5l-4 3 2 5-5-3-5 3 2-5-4-3h5z" fill="#ffe14a"/></svg>',
    rocketlauncher: '<svg class="glyph" viewBox="0 0 32 32" shape-rendering="crispEdges"><rect width="32" height="32" fill="#111"/><rect x="1" y="1" width="30" height="30" fill="#1b2838"/><rect x="14" y="4" width="4" height="16" fill="#e8e4dc"/><rect x="12" y="18" width="8" height="3" fill="#c44"/><rect x="13" y="21" width="2" height="6" fill="#e6a23c"/><rect x="17" y="21" width="2" height="6" fill="#e6a23c"/><rect x="10" y="10" width="4" height="3" fill="#e8e4dc"/><rect x="18" y="10" width="4" height="3" fill="#e8e4dc"/></svg>',
    compliantish: '<svg class="glyph" viewBox="0 0 32 32" shape-rendering="crispEdges"><rect width="32" height="32" fill="#111"/><rect x="1" y="1" width="30" height="30" fill="#2a3340"/><rect x="10" y="8" width="12" height="8" fill="none" stroke="#d7dbe3" stroke-width="3"/><rect x="8" y="14" width="16" height="12" fill="#d7dbe3"/><rect x="14" y="18" width="4" height="5" fill="#2a3340"/></svg>',
    enricherino: '<svg class="glyph" viewBox="0 0 32 32" shape-rendering="crispEdges"><rect width="32" height="32" fill="#111"/><rect x="1" y="1" width="30" height="30" fill="#3d4f3a"/><rect x="12" y="6" width="8" height="8" fill="#e8e4dc"/><rect x="8" y="16" width="16" height="10" fill="#e8e4dc"/></svg>',
    encyclopedic: '<svg class="glyph" viewBox="0 0 32 32" shape-rendering="crispEdges"><rect width="32" height="32" fill="#111"/><rect x="1" y="1" width="30" height="30" fill="#3a4554"/><rect x="7" y="7" width="12" height="12" fill="none" stroke="#e8e4dc" stroke-width="3"/><rect x="17" y="17" width="8" height="3" transform="rotate(45 21 18.5)" fill="#e8e4dc"/></svg>',
    scriptural: '<svg class="glyph" viewBox="0 0 32 32" shape-rendering="crispEdges"><rect width="32" height="32" fill="#111"/><rect x="1" y="1" width="30" height="30" fill="#4a3a28"/><rect x="7" y="6" width="18" height="20" fill="#e8e0d0"/><rect x="15" y="6" width="2" height="20" fill="#4a3a28"/><rect x="9" y="10" width="5" height="2" fill="#4a3a28"/><rect x="18" y="10" width="5" height="2" fill="#4a3a28"/></svg>'
  },
  wrap: function (id) {
    var mark = this.marks[id] || "";
    var file = this.files[id] || id.toUpperCase();
    return '<span class="glyph-wrap" data-icon="' + id + '">' + mark +
      '<span class="dos-file" aria-hidden="true">' + file + "</span></span>";
  }
};
