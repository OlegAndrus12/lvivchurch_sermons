(function () {
  // ── Constants ──────────────────────────────────────────────────────────────
  const LINK_COL = 0;
  const DATE_COL = 1;
  const REF_COL = 3;
  const PREACHER_COL = 4;
  const AUDIO_COL = 5;
  const AGENDA_COL = 6;
  const TEXT_COL = 7;
  const MAX_VERSE = 9999;
  const CHAPTER_MULTIPLIER = 10_000;
  const VERSE_DEBOUNCE_MS = 300;
  const COPIED_FEEDBACK_MS = 1500;
  const SCROLL_DELAY_MS = 50;
  const DATE_MIN = "2010-01-01";

  // ── Book name normalisation ────────────────────────────────────────────────
  const BOOK_NORM = {
    матвія: "матвій",
    "від матвія": "матвій",
    марка: "марко",
    "від марка": "марко",
    луки: "лука",
    "від луки": "лука",
    івана: "йоан",
    "від івана": "йоан",
    йоана: "йоан",
    "від йоана": "йоан",
    "дії апостолів": "дії",
    "діі апостолів": "дії",
    діі: "дії",
    "до римлян": "римляни",
    римлян: "римляни",
    єфесян: "ефесян",
    "пилип'ян": "филип'ян",
    "до євреїв": "євреїв",
    "1 івана": "1 йоана",
    "2 івана": "2 йоана",
    "3 івана": "3 йоана",
    одкровення: "об'явлення",
    суддів: "судді",
    "1 самуїлова": "1 самуїла",
    "2 самуїлова": "2 самуїла",
    псалом: "псалми",
    псалтир: "псалми",
    приповістей: "приповісті",
    ісаї: "ісая",
    єремії: "єремія",
    "плач єремії": "плач єремії",
    єзекіїля: "єзекіїль",
    даниїла: "даниїл",
  };

  function normalizeBook(raw) {
    const b = raw
      .trim()
      .toLowerCase()
      .replace(/[\u2018\u2019\u02bc]/g, "'");
    return BOOK_NORM[b] ?? b;
  }

  // ── NT book set ────────────────────────────────────────────────────────────
  const NT = new Set([
    "матвій",
    "марко",
    "лука",
    "йоан",
    "дії",
    "дії апостолів",
    "римляни",
    "1 коринтян",
    "2 коринтян",
    "галатів",
    "ефесян",
    "филип'ян",
    "колосян",
    "1 солунян",
    "2 солунян",
    "1 тимофія",
    "2 тимофія",
    "тита",
    "филимона",
    "євреїв",
    "якова",
    "1 петра",
    "2 петра",
    "1 йоана",
    "2 йоана",
    "3 йоана",
    "юди",
    "об'явлення",
  ]);

  function testament(normalizedBook) {
    return NT.has(normalizedBook) ? "NT" : "OT";
  }

  // ── Reference parser ───────────────────────────────────────────────────────
  function parseRef(str) {
    const trimmed = str.trim();
    const m = trimmed.match(
      /^(.*?)\s+(\d+)(?::(\d+))?(?:\s*[-–]\s*(\d+)(?::(\d+))?)?$/,
    );
    if (!m) {
      const book = normalizeBook(trimmed);
      return {
        book,
        start: 0,
        end: MAX_VERSE * CHAPTER_MULTIPLIER + MAX_VERSE,
      };
    }

    const book = normalizeBook(m[1]);
    const ch1 = +m[2],
      v1 = m[3] ? +m[3] : 0;
    let ch2, v2;

    if (m[4] !== undefined) {
      if (m[5] !== undefined) {
        ch2 = +m[4];
        v2 = +m[5];
      } else if (v1 > 0) {
        ch2 = ch1;
        v2 = +m[4];
      } else {
        ch2 = +m[4];
        v2 = MAX_VERSE;
      }
    } else {
      ch2 = ch1;
      v2 = v1 > 0 ? v1 : MAX_VERSE;
    }

    return {
      book,
      start: ch1 * CHAPTER_MULTIPLIER + v1,
      end: ch2 * CHAPTER_MULTIPLIER + v2,
    };
  }

  // ── Filter state ───────────────────────────────────────────────────────────
  const state = {
    testament: "",
    verse: null,
    preacher: "",
    fromDate: "",
    toDate: "",
  };

  // ── DataTable ──────────────────────────────────────────────────────────────
  const table = new DataTable("#sermons", {
    order: [[DATE_COL, "desc"]],
    columnDefs: [
      {
        orderable: false,
        targets: [LINK_COL, AUDIO_COL, AGENDA_COL, TEXT_COL],
      },
    ],
    layout: {
      topStart: null,
      topEnd: null,
      bottomStart: "info",
      bottomEnd: "paging",
      bottom2Start: null,
      bottom2End: null,
    },
  });

  // ── Copy permalink ─────────────────────────────────────────────────────────
  $("#sermons tbody").on(
    "click",
    ".sermon-link-btn:not(.sermon-link-btn--copied)",
    function () {
      const btn = this;
      const id = $(btn).closest("tr").data("id");
      const url = `${location.origin}${location.pathname}?sermon=${id}`;
      navigator.clipboard.writeText(url);
      btn.classList.add("sermon-link-btn--copied");
      setTimeout(
        () => btn.classList.remove("sermon-link-btn--copied"),
        COPIED_FEEDBACK_MS,
      );
    },
  );

  // ── On-load permalink scroll ───────────────────────────────────────────────
  const targetId = new URLSearchParams(location.search).get("sermon");
  if (targetId) {
    const allNodes = table.rows({ order: "current" }).nodes().toArray();
    const rowNode = allNodes.find((tr) => tr.dataset.id === targetId);
    if (rowNode) {
      const displayIdx = allNodes.indexOf(rowNode);
      const pageNum = Math.floor(displayIdx / table.page.len());
      table.page(pageNum).draw(false);
      rowNode.classList.add("sermon--highlighted");
      setTimeout(
        () => rowNode.scrollIntoView({ behavior: "smooth", block: "center" }),
        SCROLL_DELAY_MS,
      );
    }
  }

  // ── Custom search ──────────────────────────────────────────────────────────
  $.fn.dataTable.ext.search.push(function (_settings, data) {
    const ref = parseRef(data[REF_COL]);

    if (state.testament) {
      if (!ref || testament(ref.book) !== state.testament) return false;
    }

    if (state.verse) {
      if (!ref || ref.book !== state.verse.book) return false;
      if (ref.end < state.verse.start || ref.start > state.verse.end)
        return false;
    }

    if (state.preacher && data[PREACHER_COL].trim() !== state.preacher)
      return false;

    if (state.fromDate && data[DATE_COL] < state.fromDate) return false;
    if (state.toDate && data[DATE_COL] > state.toDate) return false;

    return true;
  });

  // ── Testament tabs ─────────────────────────────────────────────────────────
  document.querySelectorAll(".testament-tab").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".testament-tab").forEach((b) => {
        b.classList.remove("active");
        b.setAttribute("aria-selected", "false");
      });
      btn.classList.add("active");
      btn.setAttribute("aria-selected", "true");
      state.testament = btn.dataset.t;
      table.draw();
    });
  });

  // ── Verse search ───────────────────────────────────────────────────────────
  const elVerse = document.getElementById("filter-verse");
  const elClear = document.getElementById("filter-verse-clear");

  let debounce;
  elVerse.addEventListener("input", () => {
    clearTimeout(debounce);
    debounce = setTimeout(() => {
      const raw = elVerse.value.trim();
      state.verse = raw ? parseRef(raw) : null;
      elClear.classList.toggle("verse-search__clear--visible", Boolean(raw));
      table.draw();
    }, VERSE_DEBOUNCE_MS);
  });

  elClear.addEventListener("click", () => {
    elVerse.value = "";
    elClear.classList.remove("verse-search__clear--visible");
    state.verse = null;
    table.draw();
    elVerse.focus();
  });

  // ── Reset all filters ──────────────────────────────────────────────────────
  document.getElementById("filter-reset").addEventListener("click", () => {
    elVerse.value = "";
    elClear.classList.remove("verse-search__clear--visible");

    document.querySelectorAll(".testament-tab").forEach((b) => {
      b.classList.toggle("active", b.dataset.t === "");
      b.setAttribute("aria-selected", String(b.dataset.t === ""));
    });

    state.testament = "";
    state.verse = null;
    state.preacher = "";
    state.fromDate = "";
    state.toDate = "";

    document.getElementById("filter-preacher").value = "";
    document.getElementById("filter-date-from").value = "";
    document.getElementById("filter-date-to").value = "";

    table.draw();
  });

  // ── Preacher & date filters ────────────────────────────────────────────────
  const elPreacher = document.getElementById("filter-preacher");
  const elDateFrom = document.getElementById("filter-date-from");
  const elDateTo = document.getElementById("filter-date-to");

  const today = new Date().toISOString().slice(0, 10);
  elDateFrom.min = elDateTo.min = DATE_MIN;
  elDateFrom.max = elDateTo.max = today;

  elPreacher.addEventListener("change", () => {
    state.preacher = elPreacher.value;
    table.draw();
  });
  elDateFrom.addEventListener("input", () => {
    state.fromDate = elDateFrom.value;
    table.draw();
  });
  elDateTo.addEventListener("input", () => {
    state.toDate = elDateTo.value;
    table.draw();
  });
})();
