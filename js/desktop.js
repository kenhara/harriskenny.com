(function () {
  var SITE = window.SITE;
  var phoneMq = window.matchMedia("(max-width: " + SITE.phoneBreakpoint + "px)");
  var phoneMode = phoneMq.matches;
  var eras = phoneMode ? SITE.phoneEras : SITE.eras;
  var eraIndex = 0;
  var z = 8;
  var tmDrag = false;
  var phoneOpenId = null;
  var phoneFocus = 0;
  var FEATURE = { t28: 1, nokia3310: 1, razr: 1, gzone: 1 };

  function $(sel, el) { return (el || document).querySelector(sel); }
  function $all(sel, el) { return [].slice.call((el || document).querySelectorAll(sel)); }

  function currentEra() { return eras[eraIndex]; }
  function isFeaturePhone() { return phoneMode && !!FEATURE[currentEra().id]; }
  function isSmartPhone() { return phoneMode && !FEATURE[currentEra().id]; }

  function activeEras() { return phoneMode ? SITE.phoneEras : SITE.eras; }
  function defaultEraId() { return phoneMode ? SITE.defaultPhoneEra : SITE.defaultEra; }

  /* Visual paint only — no eraIndex / history. Hover preview and commit both use this. */
  function paintEra(i) {
    var era = eras[Math.max(0, Math.min(eras.length - 1, i))];
    document.documentElement.setAttribute("data-era", era.id);
    $("#tm-era").textContent = era.name;
    $("#era-sheet").href = "themes/" + era.id + ".css" + (window.__V ? ("?v=" + window.__V) : "");
    var ticks = $all(".tm-tick");
    var handle = $("#tm-handle");
    var track = $("#tm-track");
    var idx = eras.indexOf(era);
    if (ticks[idx] && track) {
      var tr = track.getBoundingClientRect();
      var r = ticks[idx].getBoundingClientRect();
      handle.style.left = (r.left + r.width / 2 - tr.left) + "px";
    }
    ticks.forEach(function (t, n) { t.classList.toggle("on", n === idx); });
    if (!phoneMode) paintChrome(era.id);
    else paintPhoneChrome(era.id);
  }

  function applyEra(i, fromUi) {
    eraIndex = Math.max(0, Math.min(eras.length - 1, i));
    var era = currentEra();
    paintEra(eraIndex);
    $("#tm-track").setAttribute("aria-valuenow", String(eraIndex));
    $("#tm-track").setAttribute("aria-valuemax", String(eras.length - 1));
    $("#tm-track").setAttribute("aria-valuetext", era.name);
    $("#tm-track").setAttribute("aria-label", phoneMode ? "Phone history" : "Computer history");
    if ($("#start-menu")) $("#start-menu").classList.remove("open");
    if (phoneMode) {
      closePhoneSheet();
      renderPhoneHome();
      syncPhoneSoftkeys();
    } else {
      syncLauncherChrome();
      renderTasks();
    }
    if (fromUi) {
      try { history.replaceState(null, "", "?era=" + era.id + location.hash); } catch (e) {}
    }
  }

  function eraFromClientX(x) {
    var track = $("#tm-track");
    var r = track.getBoundingClientRect();
    var t = (x - r.left) / r.width;
    t = Math.max(0, Math.min(1, t));
    return Math.round(t * (eras.length - 1));
  }

  function paneFor(app) {
    if (app.kind === "about") {
      var paras = (app.body || [app.blurb]).filter(Boolean).map(function (p) {
        return "<p>" + p + "</p>";
      }).join("");
      var v = window.__V ? ("?v=" + window.__V) : "";
      return "<div class='inner about-pane'><img class='headshot' src='img/harris-kenny-headshot.jpg" + v + "' alt='" + SITE.person.name + "' width='120' height='120'>" +
        "<div class='about-body'>" + paras + "</div></div>";
    }
    if (app.kind === "folder") {
      var kids = "<div class='folder-lead'><h1>" + app.kids.title + "</h1><p>" + app.kids.blurb + "</p></div>";
      var list = "<ul class='folder'>" + app.items.map(function (it) {
        var mark = (window.ICONS.marks && window.ICONS.marks[it.id]) || "";
        return "<li><a href='" + it.href + "' target='_blank' rel='noopener'>" + mark +
          "<span><b>" + it.name + "</b><em>" + it.blurb + "</em></span></a></li>";
      }).join("") + "</ul>";
      var btn = app.kids.action ? "<a class='btn' href='" + app.kids.action.href + "' target='_blank' rel='noopener'>" + app.kids.action.label + "</a>" : "";
      return kids + list + btn;
    }
    var html = "<div class='inner'><h1>" + app.windowTitle + "</h1><p>" + (app.blurb || "") + "</p>";
    if (app.action) html += "<a class='btn' href='" + app.action.href + "' target='_blank' rel='noopener'>" + app.action.label + "</a>";
    return html + "</div>";
  }

  function renderTasks() {
    var tasks = $("#tasks");
    if (!tasks) return;
    tasks.innerHTML = $all(".window.open").map(function (w) {
      var id = w.getAttribute("data-win");
      var app = SITE.apps.find(function (a) { return a.id === id; });
      return "<button type='button' class='task-button" + (w.classList.contains("front") ? " front" : "") + "' data-task='" + id + "'>" + app.name + "</button>";
    }).join("");
    $all("[data-task]", tasks).forEach(function (b) {
      b.addEventListener("click", function () { openApp(b.getAttribute("data-task")); });
    });
  }

  function isOmarchy() { return !phoneMode && currentEra().id === "omarchy"; }
  function isPopos() { return !phoneMode && currentEra().id === "popos"; }
  function usesLauncher() { return isOmarchy() || isPopos(); }

  function goMenuEl() { return $("#go-menu"); }
  function activitiesEl() { return $("#activities"); }

  function showGoMenu(on) {
    var go = goMenuEl();
    if (!go) return;
    if (!isOmarchy()) {
      go.hidden = true;
      go.classList.remove("open");
      return;
    }
    go.hidden = !on;
    go.classList.toggle("open", !!on);
  }

  function showActivities(on) {
    var act = activitiesEl();
    if (!act) return;
    if (!isPopos()) {
      act.hidden = true;
      act.classList.remove("open");
      return;
    }
    act.hidden = !on;
    act.classList.toggle("open", !!on);
  }

  function resetWindowGeometry(w) {
    w.classList.remove("hypr", "omarchy-pop", "pop-pop");
    if (w.dataset.homeTop) w.style.top = w.dataset.homeTop;
    if (w.dataset.homeLeft) w.style.left = w.dataset.homeLeft;
    w.style.right = "";
    w.style.bottom = "";
    w.style.width = "";
    w.style.height = "";
    w.style.maxWidth = "";
    w.style.transform = "";
  }

  function syncLauncherChrome() {
    if (!usesLauncher()) {
      showGoMenu(false);
      showActivities(false);
      $all(".window").forEach(resetWindowGeometry);
      return;
    }
    var open = $all(".window.open");
    if (open.length) {
      showGoMenu(false);
      showActivities(false);
      open.forEach(placeLauncherPop);
    } else if (isOmarchy()) {
      showActivities(false);
      showGoMenu(true);
    } else {
      showGoMenu(false);
      showActivities(true);
    }
  }

  function placeLauncherPop(win) {
    var app = SITE.apps.find(function (a) { return a.id === win.getAttribute("data-win"); });
    var wide = app && app.kind === "folder";
    var about = app && app.kind === "about";
    var w = wide ? 440 : (about ? 380 : 360);
    win.classList.add(isPopos() ? "pop-pop" : "omarchy-pop");
    win.classList.remove("hypr", "zoomed");
    win.style.width = w + "px";
    win.style.maxWidth = "min(92vw, " + w + "px)";
    win.style.height = "auto";
    win.style.left = "50%";
    win.style.top = "50%";
    win.style.right = "auto";
    win.style.bottom = "auto";
    win.style.transform = "translate(-50%, -50%)";
  }

  /* —— Phone shell —— */
  function closePhoneSheet() {
    phoneOpenId = null;
    var sheet = $("#phone-sheet");
    if (sheet) sheet.hidden = true;
    var home = $("#phone-home");
    if (home) home.hidden = false;
    syncPhoneSoftkeys();
  }

  function openPhoneSheet(id) {
    var app = SITE.apps.find(function (a) { return a.id === id; });
    if (!app) return;
    phoneOpenId = id;
    var sheet = $("#phone-sheet");
    var home = $("#phone-home");
    var title = $("#phone-sheet-title");
    var body = $("#phone-sheet-body");
    if (home) home.hidden = true;
    if (sheet) sheet.hidden = false;
    if (title) title.textContent = app.windowTitle;
    if (body) body.innerHTML = paneFor(app);
    syncPhoneSoftkeys();
  }

  function syncPhoneSoftkeys() {
    var sk = $("#phone-softkeys");
    var id = currentEra().id;
    var open = !!phoneOpenId;
    document.documentElement.classList.toggle("phone-app-open", open);
    if (!sk) return;
    var l = $("#phone-sk-l"), c = $("#phone-sk-c"), r = $("#phone-sk-r");
    if (id === "nokia3310") {
      l.textContent = open ? "Back" : "";
      c.textContent = open ? "Select" : "Menu";
      r.textContent = "";
    } else if (id === "razr") {
      l.textContent = open ? "Back" : "Phonebook";
      c.textContent = open ? "OK" : "";
      r.textContent = open ? "" : "Media";
    } else if (id === "t28") {
      l.textContent = open ? "Back" : "Names";
      c.textContent = open ? "Select" : "Menu";
      r.textContent = open ? "" : "";
    } else if (id === "gzone") {
      l.textContent = open ? "Back" : "Back";
      c.textContent = open ? "Select" : "Select";
      r.textContent = "";
    } else {
      l.textContent = "Back";
      c.textContent = "Select";
      r.textContent = "";
    }
  }

  function paintPhoneChrome(id) {
    document.documentElement.classList.toggle("phone-feature", isFeaturePhone());
    var carrier = $("#phone-carrier");
    if (carrier) {
      if (id === "nokia3310") carrier.textContent = "NOKIA";
      else if (id === "razr") carrier.textContent = "MOTOROLA";
      else if (id === "t28") carrier.textContent = "T28";
      else if (id === "gzone") carrier.textContent = "G'zOne";
      else if (id === "ios") carrier.textContent = "5G";
      else if (id === "pixel" || id === "iphone") carrier.textContent = "";
      else carrier.textContent = "Carrier";
    }
    if (lastPhoneClockText) {
      $all("#phone-time").forEach(function (n) { n.textContent = lastPhoneClockText; });
    }
  }

  function renderPhoneHome() {
    var home = $("#phone-home");
    if (!home) return;
    var id = currentEra().id;
    phoneFocus = Math.min(phoneFocus, SITE.apps.length - 1);
    if (id === "gzone") {
      home.className = "phone-home phone-home-grid";
      home.innerHTML = "<div class='phone-grid'>" + SITE.apps.map(function (app, i) {
        return "<button type='button' class='phone-grid-item" + (i === phoneFocus ? " focus" : "") + "' data-app='" + app.id + "' data-i='" + i + "'>" +
          window.ICONS.wrap(app.id) + "<span class='label'>" + app.name + "</span></button>";
      }).join("") + "</div>";
    } else if (FEATURE[id]) {
      home.className = "phone-home phone-home-list";
      home.innerHTML = "<ul class='phone-list'>" + SITE.apps.map(function (app, i) {
        return "<li class='phone-list-item" + (i === phoneFocus ? " focus" : "") + "' data-app='" + app.id + "' data-i='" + i + "'>" +
          "<button type='button' data-app='" + app.id + "'>" +
          "<span class='phone-num'>" + (i + 1) + ".</span> " + app.name + "</button></li>";
      }).join("") + "</ul>";
    } else {
      home.className = "phone-home phone-home-icons" + (id === "ios" ? " phone-home-ios" : "");
      var useDock = (id === "ios" || id === "pixel");
      var isIos = id === "ios";
      /* iOS: all SITE.apps in 4-col grid + dock(4). Pixel: Material grid without Apple widgets. */
      var gridApps = isIos ? SITE.apps : (useDock ? SITE.apps.slice(4) : SITE.apps);
      var dockApps = useDock ? SITE.apps.slice(0, 4) : null;
      function iconBtn(app, dock) {
        return "<button type='button' class='phone-icon i-" + app.id + (dock ? " phone-dock-icon" : "") + "' data-app='" + app.id + "'>" +
          window.ICONS.wrap(app.id) + (dock ? "" : "<span class='label'>" + app.name + "</span>") + "</button>";
      }
      var html = "";
      if (isIos) {
        var now = new Date();
        var dow = new Intl.DateTimeFormat("en-US", { weekday: "long", timeZone: "America/Denver" }).format(now).toUpperCase();
        var dom = new Intl.DateTimeFormat("en-US", { day: "numeric", timeZone: "America/Denver" }).format(now);
        html += "<div class='phone-widgets' aria-hidden='true'>" +
          "<div class='phone-widget phone-widget-weather'>" +
            "<div class='phone-widget-face'>" +
              "<div class='pw-loc'>Denver</div>" +
              "<div class='pw-temp'>72°</div>" +
              "<div class='pw-cond'>Partly Cloudy</div>" +
              "<div class='pw-hl'>H:78° L:55°</div>" +
            "</div>" +
            "<span class='phone-widget-label'>Weather</span>" +
          "</div>" +
          "<div class='phone-widget phone-widget-cal'>" +
            "<div class='phone-widget-face'>" +
              "<div class='pw-dow'>" + dow + "</div>" +
              "<div class='pw-dom'>" + dom + "</div>" +
              "<div class='pw-events'>No Events Today</div>" +
            "</div>" +
            "<span class='phone-widget-label'>Calendar</span>" +
          "</div>" +
        "</div>";
      }
      html += "<div class='phone-icons'>" + gridApps.map(function (app) { return iconBtn(app, false); }).join("") + "</div>";
      if (dockApps) {
        html += "<div class='phone-pages' aria-hidden='true'><span class='on'></span></div>";
        if (isIos) {
          html += "<button type='button' class='phone-search' aria-hidden='true' tabindex='-1'>" +
            "<span class='phone-search-ico' aria-hidden='true'></span>Search</button>";
        }
        html += "<div class='phone-dock'>" + dockApps.map(function (app) { return iconBtn(app, true); }).join("") + "</div>";
      }
      home.innerHTML = html;
    }
    home.hidden = !!phoneOpenId;
    $all("[data-app]", home).forEach(function (el) {
      el.addEventListener("click", function (e) {
        e.stopPropagation();
        var appId = el.getAttribute("data-app");
        var i = Number(el.getAttribute("data-i"));
        if (!isNaN(i)) phoneFocus = i;
        if (isFeaturePhone() && !phoneOpenId) {
          phoneFocus = SITE.apps.findIndex(function (a) { return a.id === appId; });
          renderPhoneHome();
          openPhoneSheet(appId);
        } else {
          openApp(appId);
        }
      });
    });
  }

  function bindPhoneChrome() {
    var back = $("#phone-back");
    var homeBtn = $("#phone-home-btn");
    var skL = $("#phone-sk-l");
    var skC = $("#phone-sk-c");
    var skR = $("#phone-sk-r");
    function goBack() {
      if (phoneOpenId) closePhoneSheet();
    }
    function doSelect() {
      if (phoneOpenId) return;
      var app = SITE.apps[phoneFocus];
      if (app) openPhoneSheet(app.id);
    }
    if (back) back.addEventListener("click", function (e) { e.stopPropagation(); goBack(); });
    if (homeBtn) homeBtn.addEventListener("click", function (e) { e.stopPropagation(); closePhoneSheet(); });
    var gesture = $(".phone-gesture");
    if (gesture) gesture.addEventListener("click", function (e) { e.stopPropagation(); closePhoneSheet(); });
    if (skL) skL.addEventListener("click", function (e) {
      e.stopPropagation();
      if (phoneOpenId) goBack();
    });
    if (skC) skC.addEventListener("click", function (e) {
      e.stopPropagation();
      if (!phoneOpenId) doSelect();
    });
    if (skR) skR.addEventListener("click", function (e) { e.stopPropagation(); });
  }

  function setPhoneVisibility(on) {
    var phone = $("#phone");
    if (phone) phone.hidden = !on;
  }

  function openApp(id) {
    if (phoneMode) {
      openPhoneSheet(id);
      return;
    }
    var win = $(".window[data-win='" + id + "']");
    if (!win) return;
    if (usesLauncher()) {
      $all(".window.open").forEach(function (w) {
        if (w !== win) {
          w.classList.remove("open", "front", "omarchy-pop", "pop-pop");
          resetWindowGeometry(w);
        }
      });
    }
    win.classList.add("open", "front");
    win.style.zIndex = String(++z);
    $all(".window").forEach(function (w) { if (w !== win) w.classList.remove("front"); });
    $all(".icon").forEach(function (ic) {
      ic.classList.toggle("active", ic.getAttribute("data-app") === id);
    });
    syncLauncherChrome();
    renderTasks();
  }

  function closeApp(id) {
    if (phoneMode) {
      closePhoneSheet();
      return;
    }
    var win = $(".window[data-win='" + id + "']");
    if (win) {
      win.classList.remove("open", "front", "zoomed", "hypr", "omarchy-pop", "pop-pop");
      resetWindowGeometry(win);
    }
    syncLauncherChrome();
    renderTasks();
  }

  function backToLauncher() {
    if (phoneMode) {
      closePhoneSheet();
      return;
    }
    $all(".window.open").forEach(function (w) {
      w.classList.remove("open", "front", "zoomed", "hypr", "omarchy-pop", "pop-pop");
      resetWindowGeometry(w);
    });
    syncLauncherChrome();
    renderTasks();
  }

  /* Menubar vs top-panel HTML; visibility is in the era stylesheet. */
  function menubarHtml(id) {
    if (id === "mac8") {
      return "<span class='mb-apple' aria-hidden='true'></span><span class='mb-app'>Finder</span>" +
        "<span>File</span><span>Edit</span><span>View</span><span>Special</span><span>Help</span>";
    }
    if (id === "osx" || id === "macos") {
      return "<span class='mb-apple' aria-hidden='true'></span><span class='mb-app'>Finder</span>" +
        "<span>File</span><span>Edit</span><span>View</span><span>Go</span><span>Window</span><span>Help</span>" +
        "<span class='panel-clock' style='margin-left:auto'></span>";
    }
    if (id === "win31") {
      return "<span>File</span><span>Options</span><span>Window</span><span>Help</span>";
    }
    return "";
  }
  function panelHtml(id) {
    if (id === "xfce") {
      return "<span>Applications</span><span>Places</span>" +
        "<span style='margin-left:auto' class='panel-clock'></span>";
    }
    if (id === "popos") {
      return "<button type='button' class='panel-activities' id='panel-activities'>Activities</button>" +
        "<span class='panel-clock' style='margin:0 auto'></span>" +
        "<span class='panel-status'><i></i><i></i><i></i></span>";
    }
    if (id === "omarchy") {
      var v = window.__V ? ("?v=" + window.__V) : "";
      return "<span class='panel-brand' aria-hidden='true'><img class='panel-logo' src='img/omarchy-logo.svg" + v + "' alt=''></span>" +
        "<span class='panel-ws'><b class='on'>1</b><b>2</b><b>3</b></span>" +
        "<span class='panel-clock' style='margin:0 auto'></span>" +
        "<span class='panel-status'><i></i><i></i><i></i></span>";
    }
    return "";
  }
  var lastClockText = "";
  var lastPhoneClockText = "";
  function paintChrome(id) {
    var menubar = $("#menubar"), panel = $("#panel-top");
    if (menubar) menubar.innerHTML = menubarHtml(id);
    if (panel) panel.innerHTML = panelHtml(id);
    if (lastClockText) $all("#clock, .panel-clock").forEach(function (n) { n.textContent = lastClockText; });
    var actBtn = $("#panel-activities");
    if (actBtn) actBtn.addEventListener("click", function (e) {
      e.stopPropagation();
      if ($(".window.open")) backToLauncher();
      else showActivities(!(activitiesEl() && activitiesEl().classList.contains("open")));
    });
  }

  function rebuildTicks() {
    var ticks = $("#tm-ticks");
    ticks.innerHTML = eras.map(function (e, i) {
      var left = eras.length === 1 ? 50 : 3 + (i / (eras.length - 1)) * 94;
      return "<button type='button' class='tm-tick' data-i='" + i + "' style='left:" + left + "%'><i></i>" + e.short + "</button>";
    }).join("");
    $all(".tm-tick").forEach(function (t) {
      var i = Number(t.getAttribute("data-i"));
      t.addEventListener("click", function () { applyEra(i, true); });
      t.addEventListener("mouseenter", function () { paintEra(i); });
      t.addEventListener("focus", function () { paintEra(i); });
    });
  }

  function render() {
    rebuildTicks();

    var board = $("#board");
    var dock = $("#dock");
    var wins = $("#windows");
    var start = $("#start-menu");

    board.innerHTML = SITE.apps.map(function (app) {
      return "<button type='button' class='icon i-" + app.id + "' data-app='" + app.id + "'>" +
        window.ICONS.wrap(app.id) + "<span class='label'>" + app.name + "</span></button>";
    }).join("");

    var go = goMenuEl();
    if (go) {
      go.innerHTML =
        "<div class='go-head'><span class='go-tab'>Go</span>" +
        "<input class='go-filter' type='search' placeholder='Filter…' aria-label='Filter' autocomplete='off'></div>" +
        "<ul class='go-list'>" + SITE.apps.map(function (app) {
          return "<li><button type='button' class='go-item' data-app='" + app.id + "'>" +
            window.ICONS.wrap(app.id) + "<span>" + app.name + "</span></button></li>";
        }).join("") + "</ul>" +
        "<p class='go-hint'>Super · Esc</p>";
      var filter = $(".go-filter", go);
      if (filter) filter.addEventListener("input", function () {
        var q = filter.value.trim().toLowerCase();
        $all(".go-item", go).forEach(function (btn) {
          var name = (btn.textContent || "").toLowerCase();
          btn.parentElement.hidden = q && name.indexOf(q) === -1;
        });
      });
      filter && filter.addEventListener("keydown", function (e) { e.stopPropagation(); });
    }

    var act = activitiesEl();
    if (act) {
      act.innerHTML =
        "<div class='act-search'><input type='search' class='act-filter' placeholder='Type to search…' aria-label='Search' autocomplete='off'></div>" +
        "<div class='act-grid'>" + SITE.apps.map(function (app) {
          return "<button type='button' class='act-app' data-app='" + app.id + "'>" +
            window.ICONS.wrap(app.id) + "<span class='act-label'>" + app.name + "</span></button>";
        }).join("") + "</div>" +
        "<div class='act-tabs'><button type='button' class='act-tab'>Frequent</button>" +
        "<button type='button' class='act-tab on'>All</button></div>" +
        "<p class='act-hint'>Super · Esc · Activities</p>";
      var af = $(".act-filter", act);
      if (af) {
        af.addEventListener("input", function () {
          var q = af.value.trim().toLowerCase();
          $all(".act-app", act).forEach(function (btn) {
            var name = (btn.textContent || "").toLowerCase();
            btn.hidden = q && name.indexOf(q) === -1;
          });
        });
        af.addEventListener("keydown", function (e) { e.stopPropagation(); });
      }
    }

    if (dock) {
      dock.innerHTML = SITE.apps.map(function (app) {
        return "<button type='button' class='icon i-" + app.id + "' data-app='" + app.id + "'>" + window.ICONS.wrap(app.id) + "</button>";
      }).join("");
    }

    wins.innerHTML = SITE.apps.map(function (app, i) {
      var wide = app.kind === "folder" ? " win-folder" : "";
      var top = (28 + i * 18) + "px";
      var left = (140 + i * 14) + "px";
      return "<section class='window" + wide + "' data-win='" + app.id + "' data-home-top='" + top + "' data-home-left='" + left + "' style='top:" + top + ";left:" + left + "'>" +
        "<div class='titlebar' data-drag='" + app.id + "'>" +
        "<button class='widget widget-back' type='button' data-act='back' aria-label='Back'>←</button>" +
        "<button class='widget widget-close' type='button' data-act='close' aria-label='Close'></button>" +
        "<span class='title'>" + app.windowTitle + "</span>" +
        "<button class='widget widget-shade' type='button' data-act='min' aria-label='Minimize'></button>" +
        "<button class='widget widget-zoom' type='button' data-act='zoom' aria-label='Zoom'></button>" +
        "<button class='widget widget-exit' type='button' data-act='close' aria-label='Exit'>Exit</button>" +
        "</div>" +
        "<div class='pane'>" + paneFor(app) + "</div></section>";
    }).join("");

    start.innerHTML = SITE.apps.map(function (app) {
      return "<button type='button' data-app='" + app.id + "'>" + app.name + "</button>";
    }).join("");

    if (!phoneMode) paintChrome(currentEra().id);

    $all("[data-app]").forEach(function (el) {
      if (el.closest("#phone")) return;
      el.addEventListener("click", function (e) {
        e.stopPropagation();
        openApp(el.getAttribute("data-app"));
        $("#start-menu").classList.remove("open");
      });
    });
    $all(".window").forEach(function (win) {
      win.addEventListener("mousedown", function () { openApp(win.getAttribute("data-win")); });
      $all("[data-act]", win).forEach(function (btn) {
        btn.addEventListener("click", function (e) {
          e.stopPropagation();
          var act = btn.getAttribute("data-act");
          var id = win.getAttribute("data-win");
          if (act === "back") { backToLauncher(); return; }
          if (act === "close" || act === "min") {
            if (usesLauncher()) backToLauncher();
            else closeApp(id);
          }
          if (act === "zoom") win.classList.toggle("zoomed");
        });
      });
    });
    $all("[data-drag]").forEach(function (bar) {
      var drag = null;
      bar.addEventListener("pointerdown", function (e) {
        if (e.target.closest(".widget")) return;
        if (usesLauncher()) return;
        var win = bar.closest(".window");
        var r = win.getBoundingClientRect();
        var desk = $(".desktop").getBoundingClientRect();
        drag = { dx: e.clientX - r.left, dy: e.clientY - r.top, desk: desk, win: win };
        bar.setPointerCapture(e.pointerId);
      });
      bar.addEventListener("pointermove", function (e) {
        if (!drag) return;
        drag.win.style.left = Math.max(0, e.clientX - drag.desk.left - drag.dx) + "px";
        drag.win.style.top = Math.max(0, e.clientY - drag.desk.top - drag.dy) + "px";
      });
      bar.addEventListener("pointerup", function () { drag = null; });
    });

    var startBtn = $("#start");
    if (startBtn) startBtn.addEventListener("click", function (e) {
      e.stopPropagation();
      $("#start-menu").classList.toggle("open");
    });
    document.addEventListener("click", function () { $("#start-menu").classList.remove("open"); });

    bindPhoneChrome();
    renderPhoneHome();
    setPhoneVisibility(phoneMode);
  }

  function bindTimeMachine() {
    var track = $("#tm-track");
    /* Track pointerdown (drag/click) plus tick click (keyboard). Overlap is harmless. */
    track.addEventListener("pointerdown", function (e) {
      tmDrag = true;
      try { track.setPointerCapture(e.pointerId); } catch (err) {}
      applyEra(eraFromClientX(e.clientX), true);
    });
    rebuildTicks();
    track.addEventListener("mouseleave", function () { if (!tmDrag) paintEra(eraIndex); });
    track.addEventListener("focusout", function () { paintEra(eraIndex); });
    track.addEventListener("pointermove", function (e) {
      if (!tmDrag) return;
      applyEra(eraFromClientX(e.clientX), true);
    });
    track.addEventListener("pointerup", function () { tmDrag = false; });
    track.addEventListener("pointercancel", function () { tmDrag = false; });
    track.addEventListener("keydown", function (e) {
      var next = eraIndex;
      if (e.key === "ArrowRight" || e.key === "ArrowUp") next += 1;
      if (e.key === "ArrowLeft" || e.key === "ArrowDown") next -= 1;
      if (e.key === "Home") next = 0;
      if (e.key === "End") next = eras.length - 1;
      if (next !== eraIndex) { e.preventDefault(); applyEra(next, true); }
    });
    window.addEventListener("resize", function () { paintEra(eraIndex); });
  }

  function applyDeviceMode(on) {
    phoneMode = on;
    eras = activeEras();
    document.documentElement.dataset.device = phoneMode ? "phone" : "desktop";
    var tmTrack = $("#tm-track");
    if (tmTrack) tmTrack.setAttribute("aria-label", phoneMode ? "Phone history" : "Computer history");
    if (!phoneMode) document.documentElement.classList.remove("phone-feature", "phone-app-open");
    setPhoneVisibility(phoneMode);
    if (phoneMode) {
      $all(".window.open").forEach(function (w) {
        w.classList.remove("open", "front", "zoomed", "hypr", "omarchy-pop", "pop-pop");
        resetWindowGeometry(w);
      });
      showGoMenu(false);
      showActivities(false);
    } else {
      closePhoneSheet();
    }
    rebuildTicks();
    var startId = defaultEraId();
    var idx = 0;
    eras.forEach(function (e, i) { if (e.id === startId) idx = i; });
    applyEra(idx, false);
  }

  function bindPhoneMode() {
    document.documentElement.dataset.device = phoneMode ? "phone" : "desktop";
    var tmTrack0 = $("#tm-track");
    if (tmTrack0) tmTrack0.setAttribute("aria-label", phoneMode ? "Phone history" : "Computer history");
    setPhoneVisibility(phoneMode);
    var onChange = function (e) { applyDeviceMode(e.matches); };
    if (phoneMq.addEventListener) phoneMq.addEventListener("change", onChange);
    else if (phoneMq.addListener) phoneMq.addListener(onChange);
  }

  function tickClock() {
    var fmt = new Intl.DateTimeFormat("en-US", {
      weekday: "short", hour: "numeric", minute: "2-digit", hour12: true,
      timeZone: "America/Denver"
    });
    var phoneFmt = new Intl.DateTimeFormat("en-US", {
      hour: "numeric", minute: "2-digit", hour12: true,
      timeZone: "America/Denver"
    });
    function go() {
      var t = fmt.format(new Date()).replace(",", "");
      lastClockText = t;
      $all("#clock, .panel-clock").forEach(function (n) { n.textContent = t; });
      var pt = phoneFmt.format(new Date());
      lastPhoneClockText = pt;
      $all("#phone-time").forEach(function (n) { n.textContent = pt; });
    }
    go();
    setInterval(go, 30000);
  }

  document.addEventListener("keydown", function (e) {
    if (phoneMode) {
      if (e.key === "Escape") {
        if (phoneOpenId) { e.preventDefault(); closePhoneSheet(); }
        return;
      }
      if (isFeaturePhone() && !phoneOpenId) {
        if (e.key === "ArrowDown") {
          e.preventDefault();
          phoneFocus = Math.min(SITE.apps.length - 1, phoneFocus + 1);
          renderPhoneHome();
        }
        if (e.key === "ArrowUp") {
          e.preventDefault();
          phoneFocus = Math.max(0, phoneFocus - 1);
          renderPhoneHome();
        }
        if (e.key === "Enter") {
          e.preventDefault();
          var app = SITE.apps[phoneFocus];
          if (app) openPhoneSheet(app.id);
        }
      }
      return;
    }
    if (!usesLauncher()) return;
    if (e.key === "Escape") {
      if ($(".window.open")) { e.preventDefault(); backToLauncher(); }
      return;
    }
    /* Super / Meta toggles the era launcher (Go or Activities). */
    if (e.key === "Meta" || e.key === "OS" || e.code === "MetaLeft" || e.code === "MetaRight") {
      e.preventDefault();
      if ($(".window.open")) { backToLauncher(); return; }
      if (isOmarchy()) {
        var go = goMenuEl();
        if (!go) return;
        showGoMenu(go.hidden || !go.classList.contains("open"));
      } else if (isPopos()) {
        var act = activitiesEl();
        if (!act) return;
        showActivities(act.hidden || !act.classList.contains("open"));
      }
    }
  });

  bindPhoneMode();
  render();
  bindTimeMachine();
  tickClock();

  var q = new URLSearchParams(location.search).get("era");
  var start = defaultEraId();
  if (q && eras.some(function (e) { return e.id === q; })) start = q;
  var idx = 0;
  eras.forEach(function (e, i) { if (e.id === start) idx = i; });
  applyEra(idx, false);
  var openQ = new URLSearchParams(location.search).get("open");
  if (openQ) openApp(openQ);
})();
