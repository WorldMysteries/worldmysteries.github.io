/* ==========================================================================
   UNTOLD ARCHIVE — логика каталога
   Данные лежат в js/data.js, значки — в js/glyphs.js.
   ========================================================================== */

import { CATEGORIES, ITEMS } from './data.js';
import { glyphSvg } from './glyphs.js';

/* ------------------------------ Помощники -------------------------------- */

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

const ESCAPES = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
const esc = (value) => String(value ?? '').replace(/[&<>"']/g, (ch) => ESCAPES[ch]);

/** Приводит строку к виду для поиска: нижний регистр, «ё» = «е». */
const norm = (value) => String(value ?? '').toLowerCase().replace(/ё/g, 'е').trim();

/** Русское склонение: plural(3, ['материал', 'материала', 'материалов']) */
const plural = (n, [one, few, many]) => {
  const mod100 = Math.abs(n) % 100;
  const mod10 = mod100 % 10;
  if (mod100 > 10 && mod100 < 20) return many;
  if (mod10 === 1) return one;
  if (mod10 > 1 && mod10 < 5) return few;
  return many;
};

const store = {
  get(key) {
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  },
  set(key, value) {
    try {
      localStorage.setItem(key, value);
    } catch {
      /* хранилище недоступно — просто не запоминаем */
    }
  },
};

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

/* ------------------------------- Данные ---------------------------------- */

const FALLBACK_CATEGORY = { id: 'other', label: 'Без раздела', short: 'Разное', color: '#b9b9b9' };
const categoryById = new Map(CATEGORIES.map((category) => [category.id, category]));

const items = ITEMS.map((item, index) => {
  const category = categoryById.get(item.category) || FALLBACK_CATEGORY;
  return {
    ...item,
    no: index + 1,
    category,
    haystack: norm(
      [item.title, item.subtitle, item.desc, item.mark, category.label, category.short, ...(item.tags || [])].join(' ')
    ),
  };
});

const countByCategory = items.reduce((acc, item) => {
  acc[item.category.id] = (acc[item.category.id] || 0) + 1;
  return acc;
}, {});

const byYear = (a, b) => (a.year ?? Infinity) - (b.year ?? Infinity);

const SORTS = {
  no: (a, b) => a.no - b.no,
  new: (a, b) => b.no - a.no,
  old: byYear,
  recent: (a, b) => (b.year ?? -Infinity) - (a.year ?? -Infinity),
  az: (a, b) => a.title.localeCompare(b.title, 'ru'),
};

/* ------------------------------ Состояние -------------------------------- */

const params = new URLSearchParams(window.location.search);

const state = {
  query: params.get('q') || '',
  category: countByCategory[params.get('cat')] ? params.get('cat') : 'all',
  sort: SORTS[params.get('sort')] ? params.get('sort') : 'no',
  view: store.get('ua-view') === 'list' ? 'list' : 'grid',
};

let visible = [];
let lastPicked = null;

/* ------------------------------- Элементы -------------------------------- */

const el = {
  grid: $('#grid'),
  chips: $('#chips'),
  count: $('#count'),
  empty: $('#empty'),
  emptyText: $('#emptyText'),
  search: $('#search'),
  searchClear: $('#searchClear'),
  sort: $('#sort'),
  themeToggle: $('#themeToggle'),
};

/* ------------------------------- Разметка -------------------------------- */

const ARROW = '<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';

function cardHtml(item, index) {
  const no = `№ ${String(item.no).padStart(3, '0')}`;
  const mark = item.mark || '';
  const markClass = mark.length > 6 ? 'cover__mark cover__mark--sm' : 'cover__mark';

  return `
    <li class="card" data-id="${esc(item.id)}" style="--hue:${esc(item.hue || item.category.color)};--i:${index}">
      <a class="card__link" href="${esc(item.url || '#')}">
        <div class="cover" aria-hidden="true">
          <span class="cover__no">${no}</span>
          <span class="cover__cat">${esc(item.category.short)}</span>
          ${item.badge ? `<span class="cover__badge">${esc(item.badge)}</span>` : ''}
          ${glyphSvg(item.glyph)}
          <span class="${markClass}">${esc(mark)}</span>
        </div>
        <div class="card__body">
          <h3 class="card__title">${esc(item.title)}</h3>
          ${item.subtitle ? `<p class="card__sub">${esc(item.subtitle)}</p>` : ''}
          <p class="card__meta">
            <span>${no}</span>
            <span>${esc(item.category.label)}</span>
            ${mark ? `<span>${esc(mark)}</span>` : ''}
          </p>
          ${item.desc ? `<p class="card__desc">${esc(item.desc)}</p>` : ''}
        </div>
        <span class="card__go" aria-hidden="true"><span>Открыть сайт</span>${ARROW}</span>
      </a>
    </li>`;
}

function renderChips() {
  const all = `
    <button class="chip" type="button" data-cat="all" aria-pressed="false">
      Все <span class="chip__n">${items.length}</span>
    </button>`;

  const rest = CATEGORIES.map((category) => {
    const n = countByCategory[category.id] || 0;
    const dot = `<i class="chip__dot" style="--dot:${esc(category.color)}" aria-hidden="true"></i>`;
    if (!n) {
      return `
        <button class="chip" type="button" disabled title="Раздел готовится">
          ${dot}${esc(category.label)} <span class="chip__n">скоро</span>
        </button>`;
    }
    return `
      <button class="chip" type="button" data-cat="${esc(category.id)}" aria-pressed="false">
        ${dot}${esc(category.label)} <span class="chip__n">${n}</span>
      </button>`;
  }).join('');

  el.chips.innerHTML = all + rest;
}

/* ------------------------------- Отрисовка ------------------------------- */

function getVisible() {
  const words = norm(state.query).split(/\s+/).filter(Boolean);
  return items
    .filter((item) => state.category === 'all' || item.category.id === state.category)
    .filter((item) => words.every((word) => item.haystack.includes(word)))
    .sort(SORTS[state.sort]);
}

function syncUrl() {
  const next = new URLSearchParams();
  if (state.query.trim()) next.set('q', state.query.trim());
  if (state.category !== 'all') next.set('cat', state.category);
  if (state.sort !== 'no') next.set('sort', state.sort);
  const qs = next.toString();
  const url = window.location.pathname + (qs ? `?${qs}` : '') + window.location.hash;
  try {
    window.history.replaceState(null, '', url);
  } catch {
    /* например, при открытии файла с диска */
  }
}

function render({ animate = true } = {}) {
  visible = getVisible();
  const total = items.length;
  const n = visible.length;
  const filtered = Boolean(state.query.trim()) || state.category !== 'all';

  el.grid.innerHTML = visible.map(cardHtml).join('');
  el.grid.dataset.view = state.view;
  el.grid.classList.toggle('is-instant', !animate);
  el.grid.hidden = n === 0;
  el.empty.hidden = n !== 0;

  if (n === 0) {
    const category = categoryById.get(state.category);
    const where = category ? ` в разделе «${category.label}»` : '';
    el.emptyText.textContent = state.query.trim()
      ? `По запросу «${state.query.trim()}»${where} ничего не нашлось. Попробуйте другое слово — название, год или место.`
      : 'В этом разделе пока пусто.';
  }

  el.count.textContent = filtered
    ? `Найдено ${n} из ${total}`
    : `${total} ${plural(total, ['материал', 'материала', 'материалов'])}`;

  $$('.chip[data-cat]', el.chips).forEach((chip) => {
    chip.setAttribute('aria-pressed', String(chip.dataset.cat === state.category));
  });
  $$('.segmented [data-view]').forEach((button) => {
    button.setAttribute('aria-pressed', String(button.dataset.view === state.view));
  });

  el.searchClear.hidden = !state.query;
  syncUrl();
}

/* ------------------------------- Действия -------------------------------- */

function resetFilters() {
  state.query = '';
  state.category = 'all';
  el.search.value = '';
  render();
}

/** Подсвечивает случайную карточку из тех, что сейчас на экране. */
function pickRandom() {
  if (!visible.length) resetFilters();
  if (!visible.length) return;

  let pool = visible;
  if (pool.length > 1 && lastPicked) pool = pool.filter((item) => item.id !== lastPicked);
  const item = pool[Math.floor(Math.random() * pool.length)];
  lastPicked = item.id;

  const card = el.grid.querySelector(`.card[data-id="${CSS.escape(item.id)}"]`);
  if (!card) return;

  $$('.card.is-picked', el.grid).forEach((node) => node.classList.remove('is-picked'));
  card.classList.add('is-picked');
  card.scrollIntoView({ block: 'center', behavior: reducedMotion.matches ? 'auto' : 'smooth' });
  card.querySelector('a')?.focus({ preventScroll: true });
  window.setTimeout(() => card.classList.remove('is-picked'), 2600);
}

function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;
  el.themeToggle.setAttribute(
    'aria-label',
    theme === 'dark' ? 'Включить светлую тему' : 'Включить тёмную тему'
  );
  document
    .querySelector('meta[name="theme-color"]')
    ?.setAttribute('content', theme === 'dark' ? '#101113' : '#e8e9e4');
}

/* ------------------------------- События --------------------------------- */

el.search.addEventListener('input', () => {
  state.query = el.search.value;
  render({ animate: false });
});

el.search.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && el.search.value) {
    event.preventDefault();
    state.query = '';
    el.search.value = '';
    render();
  }
});

$('#searchForm').addEventListener('submit', (event) => {
  event.preventDefault();
  el.search.blur();
});

el.searchClear.addEventListener('click', () => {
  state.query = '';
  el.search.value = '';
  render();
  el.search.focus();
});

el.sort.addEventListener('change', () => {
  state.sort = SORTS[el.sort.value] ? el.sort.value : 'no';
  render();
});

el.chips.addEventListener('click', (event) => {
  const chip = event.target.closest('.chip[data-cat]');
  if (!chip) return;
  state.category = chip.dataset.cat;
  render();
});

$$('.segmented [data-view]').forEach((button) => {
  button.addEventListener('click', () => {
    state.view = button.dataset.view === 'list' ? 'list' : 'grid';
    store.set('ua-view', state.view);
    render();
  });
});

$$('[data-random]').forEach((button) => button.addEventListener('click', pickRandom));
$('#resetFilters').addEventListener('click', () => {
  resetFilters();
  el.search.focus();
});

el.themeToggle.addEventListener('click', () => {
  const next = document.documentElement.dataset.theme === 'light' ? 'dark' : 'light';
  applyTheme(next);
  store.set('ua-theme', next);
});

// Клавиша «/» ставит курсор в поиск
document.addEventListener('keydown', (event) => {
  if (event.key !== '/' || event.ctrlKey || event.metaKey || event.altKey) return;
  const target = event.target;
  if (target instanceof HTMLElement && (target.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName))) {
    return;
  }
  event.preventDefault();
  el.search.focus();
  el.search.select();
});

/* -------------------------------- Запуск --------------------------------- */

function fillStats() {
  const sections = Object.keys(countByCategory).length;
  const latest = items[items.length - 1];

  $('#statItems').textContent = String(items.length);
  $('#statItemsLabel').textContent = plural(items.length, ['материал', 'материала', 'материалов']);
  $('#statSections').textContent = String(sections);
  $('#statSectionsLabel').textContent = plural(sections, ['раздел', 'раздела', 'разделов']);
  $('#statLatest').textContent = latest ? latest.title : '—';
  $('#year').textContent = String(new Date().getFullYear());
}

el.search.value = state.query;
el.sort.value = state.sort;
applyTheme(document.documentElement.dataset.theme === 'light' ? 'light' : 'dark');
fillStats();
renderChips();
render();
