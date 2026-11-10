/* ==========================================================================
   UNTOLD ARCHIVE — значки для обложек
   Каждый значок — набор линий в поле 64 × 64. Новый значок можно добавить
   в объект GLYPHS и указать его имя в поле glyph материала.
   ========================================================================== */

const spokes = (count, draw) =>
  Array.from({ length: count }, (_, i) => draw(i)).join('');

const GLYPHS = {
  // Перевал: два пика, палатка, луна
  mountain:
    '<path d="M4 52 22 20l9 14 7-10 22 28Z"/>' +
    '<path d="m27 52 5-8 5 8"/><path d="M32 44v8"/>' +
    '<circle cx="49" cy="13" r="4"/>',

  // Двухмоторный самолёт, вид сверху
  plane:
    '<path d="M32 6c2 3 3 7 3 12v28c0 4-1 8-3 12-2-4-3-8-3-12V18c0-5 1-9 3-12Z"/>' +
    '<path d="M29 24 6 34v4l23-4"/><path d="m35 24 23 10v4l-23-4"/>' +
    '<path d="m29 48-9 5v3l9-2"/><path d="m35 48 9 5v3l-9-2"/>' +
    '<path d="M17 25v5"/><path d="M47 25v5"/>',

  // Парусник
  ship:
    '<path d="M8 44h48l-6 10H14Z"/>' +
    '<path d="M22 44V10"/><path d="M42 44V16"/>' +
    '<path d="M19 14 8 40h11Z"/>' +
    '<path d="M25 12h11v10H25Z"/><path d="M25 26h13v12H25Z"/>' +
    '<path d="M45 18c5 5 8 12 8 20h-8Z"/>' +
    '<path d="M4 60c4-3 8-3 12 0s8 3 12 0 8-3 12 0 8 3 12 0 4-2 8-1"/>',

  // Папка с делом
  dossier:
    '<path d="M8 18h16l5 6h27v28H8Z"/>' +
    '<path d="M16 34h16"/><path d="M16 42h12"/>' +
    '<circle cx="44" cy="39" r="7"/><path d="m40 39 3 3 5-6"/>',

  // Компас
  compass:
    '<circle cx="32" cy="32" r="25"/>' +
    '<path d="m32 12 6 20-6 20-6-20Z"/>' +
    '<path d="M11 32h7"/><path d="M46 32h7"/>' +
    '<circle cx="32" cy="32" r="2"/>',

  // Античная колонна
  column:
    '<path d="M16 10h32v6H16Z"/>' +
    '<path d="M20 16v32"/><path d="M28 16v32"/><path d="M36 16v32"/><path d="M44 16v32"/>' +
    '<path d="M16 48h32v4H16Z"/><path d="M12 52h40v4H12Z"/>',

  // Георгин
  dahlia:
    spokes(
      8,
      (i) =>
        `<ellipse cx="32" cy="18" rx="6" ry="12" transform="rotate(${i * 45} 32 32)"/>`
    ) + '<circle cx="32" cy="32" r="4"/>',

  // Планета с кольцом
  planet:
    '<circle cx="32" cy="32" r="13"/>' +
    '<ellipse cx="32" cy="32" rx="29" ry="9" transform="rotate(-20 32 32)"/>' +
    '<path d="M52 8v6"/><path d="M49 11h6"/>' +
    '<path d="M10 49v4"/><path d="M8 51h4"/>',

  // Чёрная дыра с диском
  blackhole:
    '<circle cx="32" cy="32" r="10"/>' +
    '<ellipse cx="32" cy="33" rx="29" ry="6"/>' +
    '<path d="M13 29a19 19 0 0 1 38 0"/>' +
    '<path d="M18 38a14 12 0 0 0 28 0"/>',

  // Семя священного дерева
  sprite:
    spokes(11, (i) => {
      const angle = ((-100 + i * 20) * Math.PI) / 180;
      const len = i % 2 ? 22 : 27;
      const x = (32 + Math.sin(angle) * len).toFixed(1);
      const y = (40 - Math.cos(angle) * len).toFixed(1);
      return `<path d="M32 40 ${x} ${y}"/><circle cx="${x}" cy="${y}" r="1.6"/>`;
    }) + '<path d="M32 40v18"/>',

  // Волна
  wave:
    '<path d="M4 40c8 0 12-6 16-12s9-10 16-8c-6 2-8 8-4 13s12 7 28 7"/>' +
    '<path d="M4 50c5-3 9-3 14 0s9 3 14 0 9-3 14 0 9 3 14 0"/>' +
    '<path d="M10 58c4-2 7-2 11 0s7 2 11 0 7-2 11 0 7 2 11 0"/>',

  // Пламя
  flame:
    '<path d="M32 6c2 10 14 16 14 30a14 14 0 0 1-28 0c0-6 3-10 6-13 0 5 2 8 5 9-2-9 0-18 3-26Z"/>' +
    '<path d="M32 50a6 6 0 0 1-6-6c0-3 3-5 6-9 3 4 6 6 6 9a6 6 0 0 1-6 6Z"/>',

  // Кольца Атлантиды
  rings:
    '<circle cx="32" cy="30" r="5"/><circle cx="32" cy="30" r="12"/>' +
    '<circle cx="32" cy="30" r="19"/><circle cx="32" cy="30" r="26"/>' +
    '<path d="M32 35v27"/>',

  // Портрет — для раздела «Актёры и актрисы»
  person:
    '<circle cx="32" cy="22" r="10"/>' +
    '<path d="M10 56c2-12 10-18 22-18s20 6 22 18"/>',

  // Катушка плёнки
  reel:
    '<circle cx="32" cy="32" r="25"/><circle cx="32" cy="32" r="3"/>' +
    spokes(
      5,
      (i) => `<circle cx="32" cy="17" r="5" transform="rotate(${i * 72} 32 32)"/>`
    ),

  // Замочная скважина — значок по умолчанию
  key:
    '<circle cx="32" cy="32" r="26"/>' +
    '<circle cx="32" cy="26" r="6"/><path d="m29 31-3 15h12l-3-15"/>',
};

/** Возвращает SVG-разметку значка. pathLength="1" нужен для анимации «прорисовки». */
export function glyphSvg(name) {
  const body = (GLYPHS[name] || GLYPHS.key).replace(
    /<(path|circle|ellipse)\b/g,
    '<$1 pathLength="1"'
  );
  return (
    '<svg class="glyph" viewBox="0 0 64 64" fill="none" stroke="currentColor" ' +
    'stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" ' +
    `aria-hidden="true" focusable="false">${body}</svg>`
  );
}
