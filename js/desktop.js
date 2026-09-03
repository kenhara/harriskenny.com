(function () {
  var SITE = window.SITE;
  var eras = SITE.eras;
  var eraIndex = 0;
  var z = 8;
  var tmDrag = false;

  function $(sel, el) { return (el || document).querySelector(sel); }
  function $all(sel, el) { return [].slice.call((el || document).querySelectorAll(sel)); }

  function currentEra() { return eras[eraIndex]; }

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
    paintChrome(era.id);
  }

  function applyEra(i, fromUi) {
    eraIndex = Math.max(0, Math.min(eras.length - 1, i));
    var era = currentEra();
    paintEra(eraIndex);
    $("#tm-track").setAttribute("aria-valuenow", String(eraIndex));
    $("#tm-track").setAttribute("aria-valuemax", String(eras.length - 1));
    $("#tm-track").setAttribute("aria-valuetext", era.name);
    if ($("#start-menu")) $("#start-menu").classList.remove("open");
    renderTasks();
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

  function openApp(id) {
    var win = $(".window[data-win='" + id + "']");
    if (!win) return;
    win.classList.add("open", "front");
    win.style.zIndex = String(++z);
    $all(".window").forEach(function (w) { if (w !== win) w.classList.remove("front"); });
    $all(".icon").forEach(function (ic) {
      ic.classList.toggle("active", ic.getAttribute("data-app") === id);
    });
    renderTasks();
  }

  function closeApp(id) {
    var win = $(".window[data-win='" + id + "']");
    if (win) win.classList.remove("open", "front", "zoomed");
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
      return "<span>Activities</span><span class='panel-clock' style='margin:0 auto'></span>" +
        "<span class='panel-status'><i></i><i></i><i></i></span>";
    }
    if (id === "omarchy") {
      return "<span class='panel-ws'><b class='on'>1</b><b>2</b><b>3</b></span>" +
        "<span class='panel-clock' style='margin:0 auto'></span>" +
        "<span class='panel-status'><i></i><i></i><i></i></span>";
    }
    return "";
  }
  var lastClockText = "";
  function paintChrome(id) {
    var menubar = $("#menubar"), panel = $("#panel-top");
    if (menubar) menubar.innerHTML = menubarHtml(id);
    if (panel) panel.innerHTML = panelHtml(id);
    if (lastClockText) $all("#clock, .panel-clock").forEach(function (n) { n.textContent = lastClockText; });
  }

  function render() {
    var ticks = $("#tm-ticks");
    ticks.innerHTML = eras.map(function (e, i) {
      var left = 3 + (i / (eras.length - 1)) * 94;
      return "<button type='button' class='tm-tick' data-i='" + i + "' style='left:" + left + "%'><i></i>" + e.short + "</button>";
    }).join("");

    var board = $("#board");
    var dock = $("#dock");
    var wins = $("#windows");
    var start = $("#start-menu");

    board.innerHTML = SITE.apps.map(function (app) {
      return "<button type='button' class='icon i-" + app.id + "' data-app='" + app.id + "'>" +
        window.ICONS.wrap(app.id) + "<span class='label'>" + app.name + "</span></button>";
    }).join("");

    if (dock) {
      dock.innerHTML = SITE.apps.map(function (app) {
        return "<button type='button' class='icon i-" + app.id + "' data-app='" + app.id + "'>" + window.ICONS.wrap(app.id) + "</button>";
      }).join("");
    }

    wins.innerHTML = SITE.apps.map(function (app, i) {
      var wide = app.kind === "folder" ? " win-folder" : "";
      return "<section class='window" + wide + "' data-win='" + app.id + "' style='top:" + (28 + i * 18) + "px;left:" + (140 + i * 14) + "px'>" +
        "<div class='titlebar' data-drag='" + app.id + "'>" +
        "<button class='widget widget-close' type='button' data-act='close' aria-label='Close'></button>" +
        "<span class='title'>" + app.windowTitle + "</span>" +
        "<button class='widget widget-shade' type='button' data-act='min' aria-label='Minimize'></button>" +
        "<button class='widget widget-zoom' type='button' data-act='zoom' aria-label='Zoom'></button>" +
        "</div>" +
        "<div class='pane'>" + paneFor(app) + "</div></section>";
    }).join("");

    start.innerHTML = SITE.apps.map(function (app) {
      return "<button type='button' data-app='" + app.id + "'>" + app.name + "</button>";
    }).join("");

    paintChrome(currentEra().id);

    $all("[data-app]").forEach(function (el) {
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
          if (act === "close" || act === "min") closeApp(id);
          if (act === "zoom") win.classList.toggle("zoomed");
        });
      });
    });
    $all("[data-drag]").forEach(function (bar) {
      var drag = null;
      bar.addEventListener("pointerdown", function (e) {
        if (e.target.closest(".widget")) return;
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
  }

  function bindTimeMachine() {
    var track = $("#tm-track");
    /* Track pointerdown (drag/click) plus tick click (keyboard). Overlap is harmless. */
    track.addEventListener("pointerdown", function (e) {
      tmDrag = true;
      try { track.setPointerCapture(e.pointerId); } catch (err) {}
      applyEra(eraFromClientX(e.clientX), true);
    });
    $all(".tm-tick").forEach(function (t) {
      var i = Number(t.getAttribute("data-i"));
      t.addEventListener("click", function () { applyEra(i, true); });
      t.addEventListener("mouseenter", function () { paintEra(i); });
      t.addEventListener("focus", function () { paintEra(i); });
    });
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

  function tickClock() {
    var fmt = new Intl.DateTimeFormat("en-US", {
      weekday: "short", hour: "numeric", minute: "2-digit", hour12: true,
      timeZone: "America/Denver"
    });
    function go() {
      var t = fmt.format(new Date()).replace(",", "");
      lastClockText = t;
      $all("#clock, .panel-clock").forEach(function (n) { n.textContent = t; });
    }
    go();
    setInterval(go, 30000);
  }

  render();
  bindTimeMachine();
  tickClock();

  var q = new URLSearchParams(location.search).get("era");
  var start = SITE.defaultEra;
  if (q) start = q;
  var idx = 0;
  eras.forEach(function (e, i) { if (e.id === start) idx = i; });
  applyEra(idx, false);
  var openQ = new URLSearchParams(location.search).get("open");
  if (openQ) openApp(openQ);
})();
