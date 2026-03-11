(function () {
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
    const m = str
      .trim()
      .match(/^(.*?)\s+(\d+)(?::(\d+))?(?:\s*[-–]\s*(\d+)(?::(\d+))?)?$/);
    if (!m) return null;

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
        v2 = 9999;
      }
    } else {
      ch2 = ch1;
      v2 = v1 > 0 ? v1 : 9999;
    }

    return { book, start: ch1 * 10000 + v1, end: ch2 * 10000 + v2 };
  }

  // ── State ──────────────────────────────────────────────────────────────────
  let activeTestament = "";
  let verseQuery = null;
  let activePreacher = "";
  let fromYear = "";
  let toYear = "";

  // ── DataTable ──────────────────────────────────────────────────────────────
  const REF_COL = 2;

  const table = new DataTable("#sermons", {
    columnDefs: [{ orderable: false, targets: [4, 5, 6] }],
    layout: {
      topStart: null,
      topEnd: null,
      bottomStart: "info",
      bottomEnd: "paging",
      bottom2Start: null,
      bottom2End: null,
    },
  });

  // ── Custom search ──────────────────────────────────────────────────────────
  $.fn.dataTable.ext.search.push(function (_settings, data) {
    const ref = parseRef(data[REF_COL]);

    if (activeTestament) {
      if (!ref || testament(ref.book) !== activeTestament) return false;
    }

    if (verseQuery) {
      if (!ref || ref.book !== verseQuery.book) return false;
      if (ref.end < verseQuery.start || ref.start > verseQuery.end)
        return false;
    }

    if (activePreacher && data[3].trim() !== activePreacher) return false;

    if (fromYear && data[0] < fromYear) return false;
    if (toYear && data[0] > toYear) return false;

    return true;
  });

  // ── Testament tabs ─────────────────────────────────────────────────────────
  document.querySelectorAll(".testament-tab").forEach((btn) => {
    btn.addEventListener("click", () => {
      document
        .querySelectorAll(".testament-tab")
        .forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      activeTestament = btn.dataset.t;
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
      verseQuery = raw ? parseRef(raw) : null;
      elClear.style.display = raw ? "flex" : "none";
      table.draw();
    }, 300);
  });

  elClear.addEventListener("click", () => {
    elVerse.value = "";
    elClear.style.display = "none";
    verseQuery = null;
    table.draw();
    elVerse.focus();
  });

  // ── Preacher & date filters ────────────────────────────────────────────────
  const elPreacher = document.getElementById("filter-preacher");
  const elDateFrom = document.getElementById("filter-date-from");
  const elDateTo = document.getElementById("filter-date-to");

  const preachers = [
    ...new Set(
      Array.from(document.querySelectorAll("#sermons tbody tr td:nth-child(4)"))
        .map((td) => td.textContent.trim())
        .filter(Boolean),
    ),
  ].sort();
  preachers.forEach((p) => {
    elPreacher.insertAdjacentHTML(
      "beforeend",
      `<option value="${p}">${p}</option>`,
    );
  });

  const today = new Date().toISOString().slice(0, 10);
  elDateFrom.min = elDateTo.min = "2010-01-01";
  elDateFrom.max = elDateTo.max = today;

  elPreacher.addEventListener("change", () => {
    activePreacher = elPreacher.value;
    table.draw();
  });
  elDateFrom.addEventListener("input", () => {
    fromYear = elDateFrom.value;
    table.draw();
  });
  elDateTo.addEventListener("input", () => {
    toYear = elDateTo.value;
    table.draw();
  });
})();
