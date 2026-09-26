/* ============================================================
   FLOATING TEXT EXPERIENCE
   Video background + intro + floating lines + finale
   ============================================================ */
(function () {
  "use strict";

  /* ---------- DOM ---------- */
  var stage = document.getElementById("stage");
  var stageInner = document.getElementById("stageInner");
  var tapHint = document.getElementById("tapHint");
  var bgVideo = document.getElementById("bgVideo");
  var bgOverlay = document.getElementById("bgOverlay");
  var ambient = document.getElementById("ambient");
  var intro = document.getElementById("intro");
  var introText = document.getElementById("introText");
  var introCursor = document.getElementById("introCursor");
  var finale = document.getElementById("finale");

  /* ============================================================
     THE SCRIPT — each item is one line
     type: "dedication" | "hand" | "italic" | "signature" | "quiet" | "heart" | ""
     ============================================================ */
  var LINES = [
    { text: "for you, Asa", type: "dedication" },
    { text: "This is a little something from me to you", type: "hand" },
    { text: "I am sorry I did not text you properly.", type: "" },
    { text: "I am sorry that we fought.", type: "" },
    { text: "I do not want that to happen again.", type: "italic" },
    { text: "I am sorry for keeping you distant.", type: "" },
    { text: "And I am sorry that I barely knew you were ill.", type: "" },
    { text: "I should have been there.", type: "italic" },
    { text: "You mean more to me than I show sometimes.", type: "" },
    { text: "And I want to do better.", type: "italic" },
    { text: "\u2665", type: "heart" },
    { text: "I am sorry.", type: "quiet" },
    { text: "my Asa", type: "signature" }
  ];

  /* ---------- Timing ---------- */
  var INTRO_WORD = "Hi babe";
  var INTRO_LETTER_DELAY = 150;
  var INTRO_HOLD_AFTER = 1000;
  var INTRO_FADE_MS = 1200;
  var START_AFTER_INTRO = 900;

  var SHOW_DELAY = 200;
  var LINE_INTERVAL = 3000;
  var SIGNATURE_HOLD = 4200;
  var FINALE_FADE_DELAY = 1200;

  /* ---------- State ---------- */
  var currentIndex = -1;
  var lineEls = [];
  var isPaused = false;
  var timerHandle = null;

  /* ============================================================
     VIDEO — slow it down
     ============================================================ */
  if (bgVideo) {
    bgVideo.playbackRate = 0.75;

    var startVideo = function () {
      bgVideo.play().catch(function () {});
    };
    startVideo();
    document.addEventListener("touchstart", startVideo, { once: true, passive: true });
    document.addEventListener("click", startVideo, { once: true });
  }

  /* ============================================================
     AMBIENT MUSIC — soft fade in
     ============================================================ */
  function startAmbient() {
    if (!ambient) return;
    ambient.volume = 0;
    var p = ambient.play();
    if (!p || !p.then) return;

    p.then(function () {
      fadeAmbient();
    }).catch(function () {
      var onFirst = function () {
        ambient.play().then(fadeAmbient).catch(function () {});
        document.removeEventListener("click", onFirst);
        document.removeEventListener("touchstart", onFirst);
      };
      document.addEventListener("click", onFirst);
      document.addEventListener("touchstart", onFirst, { passive: true });
    });
  }

  function fadeAmbient() {
    var vol = 0;
    var target = 0.28;
    var fade = setInterval(function () {
      vol += 0.015;
      if (vol >= target) { vol = target; clearInterval(fade); }
      ambient.volume = vol;
    }, 120);
  }

  /* ============================================================
     INTRO — "Hi babe" handwritten
     ============================================================ */
  function playIntro() {
    if (!intro || !introText) {
      revealMain();
      return;
    }

    var fragments = [];
    for (var i = 0; i < INTRO_WORD.length; i++) {
      var ch = INTRO_WORD[i];
      if (ch === " ") {
        fragments.push("<span class=\"intro__letter\" style=\"width:.35em\">&nbsp;</span>");
      } else {
        fragments.push("<span class=\"intro__letter\">" + ch + "</span>");
      }
    }
    introText.innerHTML = fragments.join("");
    if (introCursor) introCursor.classList.add("is-visible");

    var letters = introText.querySelectorAll(".intro__letter");
    letters.forEach(function (el, idx) {
      el.style.animationDelay = (idx * INTRO_LETTER_DELAY / 1000) + "s";
    });

    var totalWrite = letters.length * INTRO_LETTER_DELAY;
    var dismissAt = totalWrite + INTRO_HOLD_AFTER;

    setTimeout(function () {
      if (introCursor) introCursor.classList.remove("is-visible");
      if (bgVideo) bgVideo.classList.add("is-visible");
      if (bgOverlay) bgOverlay.classList.add("is-visible");
      if (stage) stage.classList.add("is-visible");

      intro.classList.add("is-hiding");
      startAmbient();

      setTimeout(function () {
        intro.classList.add("is-hidden");
        setTimeout(revealMain, START_AFTER_INTRO);
      }, INTRO_FADE_MS);
    }, dismissAt);
  }

  /* ============================================================
     MAIN — build lines & sequence
     ============================================================ */
  function revealMain() {
    LINES.forEach(function (item) {
      var el = document.createElement("p");
      el.className = "line";
      if (item.type) el.classList.add("line--" + item.type);
      el.textContent = item.text;
      stageInner.appendChild(el);
      lineEls.push(el);
    });

    setTimeout(showNextLine, SHOW_DELAY);
    setTimeout(function () {
      if (tapHint && !isPaused) {
        tapHint.textContent = "tap to pause";
        tapHint.classList.add("is-visible");
      }
    }, 3200);

    console.log("[stage] " + LINES.length + " lines ready.");
  }

  function showNextLine() {
    if (isPaused) return;

    if (currentIndex >= 0) {
      var prev = lineEls[currentIndex];
      if (prev) prev.classList.add("is-fading");
    }

    currentIndex++;

    if (currentIndex >= lineEls.length) {
      if (tapHint) {
        tapHint.textContent = "\u2665";
        tapHint.classList.add("is-visible");
      }
      return;
    }

    var el = lineEls[currentIndex];
    el.classList.add("is-visible");

    if (el.classList.contains("line--signature")) {
      setTimeout(function () {
        for (var i = 0; i < lineEls.length - 1; i++) {
          lineEls[i].classList.add("is-fading");
        }
      }, 800);

      setTimeout(showFinale, SIGNATURE_HOLD);
      return;
    }

    timerHandle = setTimeout(showNextLine, LINE_INTERVAL);
  }

  /* ============================================================
     FINALE
     ============================================================ */
  function showFinale() {
    if (!finale) return;

    if (stage) stage.classList.remove("is-visible");
    if (tapHint) tapHint.classList.remove("is-visible");
    if (bgVideo) bgVideo.classList.remove("is-visible");
    if (bgOverlay) bgOverlay.classList.remove("is-visible");

    setTimeout(function () {
      finale.setAttribute("aria-hidden", "false");
      finale.classList.add("is-active");
      console.log("[finale] Shown.");
    }, FINALE_FADE_DELAY);
  }

  /* ============================================================
     PAUSE / RESUME
     ============================================================ */
  function togglePause() {
    isPaused = !isPaused;

    if (isPaused) {
      clearTimeout(timerHandle);
      if (tapHint) {
        tapHint.textContent = "paused";
        tapHint.classList.add("is-visible", "is-paused");
      }
    } else {
      if (tapHint) {
        tapHint.textContent = "tap to pause";
        tapHint.classList.remove("is-paused");
      }
      if (currentIndex < lineEls.length - 1) {
        timerHandle = setTimeout(showNextLine, 400);
      }
    }
  }

  stage.addEventListener("click", function (e) {
    if (!e.target.closest(".stage")) return;
    togglePause();
  });

  stage.addEventListener("keydown", function (e) {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      togglePause();
    }
  });

  /* ============================================================
     GO
     ============================================================ */
  playIntro();

  console.log("[boot] Ready.");
})();