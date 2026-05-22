#!/usr/bin/env node
// Genera un HTML autocontenido con el menú del evento (Barra, Comida, Merch)
// usando el look & feel de La Crypta / LaPOS. Las fuentes y el logo se embeben
// en base64 para que el archivo sea totalmente portátil.
//
// Cada menú es una "hoja": en pantalla fluye y se adapta a mobile; al imprimir,
// cada menú ocupa exactamente UNA hoja A4 con el fondo oscuro forzado.
//
// Uso:  node scripts/generate-menu.mjs   ->  escribe menu-evento.html en la raíz

import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const read = (p) => readFileSync(join(root, p), 'utf8')
const readJSON = (p) => JSON.parse(read(p))
const fontB64 = (p) => readFileSync(join(root, p)).toString('base64')

// --- Datos ---------------------------------------------------------------
const categories = readJSON('src/constants/categories.json')
const catName = (id) => categories.find((c) => c.id === id)?.name ?? `Cat ${id}`

const barra = readJSON('src/constants/menus/barra.json')
const comida = readJSON('src/constants/menus/comida.json')
const merch = readJSON('src/constants/menus/merch.json')

// Orden explícito de categorías y nº de columnas por menú.
// Merch usa 2 columnas para que sus 24 items entren en una sola hoja A4.
const menus = [
  { key: 'barra', label: 'Barra', icon: '🍸', items: barra, order: [9, 10], columns: 1 },
  { key: 'comida', label: 'Comida', icon: '🍕', items: comida, order: [8], columns: 1 },
  { key: 'merch', label: 'Merch', icon: '🛍️', items: merch, order: [16, 17, 19, 15], columns: 2 }
]

// --- Helpers -------------------------------------------------------------
const arsFmt = new Intl.NumberFormat('es-AR', { maximumFractionDigits: 0 })

const formatPrice = ({ value, currency }) => {
  if (currency === 'USD') return `US$${arsFmt.format(value)}`
  if (currency === 'SAT') return `${arsFmt.format(value)} sat`
  return `$${arsFmt.format(value)}`
}

// "Fuck KYC (Cuba Libre)" -> { name: "Fuck KYC", sub: "Cuba Libre" }
const splitName = (raw) => {
  const m = raw.match(/^(.*?)\s*\((.*)\)\s*$/)
  if (m) return { name: m[1].trim(), sub: m[2].trim() }
  return { name: raw.trim(), sub: '' }
}

const esc = (s) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

const groupByCategory = (items, order) => {
  const groups = new Map()
  for (const it of items) {
    if (!groups.has(it.category_id)) groups.set(it.category_id, [])
    groups.get(it.category_id).push(it)
  }
  const ordered = []
  for (const id of order) if (groups.has(id)) ordered.push([id, groups.get(id)])
  for (const [id, list] of groups) if (!order.includes(id)) ordered.push([id, list])
  return ordered
}

const itemRow = (it) => {
  const { name, sub } = splitName(it.name)
  return `            <li class="item">
              <span class="item-info">
                <span class="item-name">${esc(name)}</span>${
    sub ? `<span class="item-sub">${esc(sub)}</span>` : ''
  }
              </span>
              <span class="leader" aria-hidden="true"></span>
              <span class="item-price">${formatPrice(it.price)}</span>
            </li>`
}

const categoryBlock = ([catId, items]) => `          <div class="category">
            <h3 class="category-title">${esc(catName(catId))}</h3>
            <ul class="items">
${items.map(itemRow).join('\n')}
            </ul>
          </div>`

// --- Fuentes + logo embebidos -------------------------------------------
const iaab3 = fontB64('src/styles/fonts/IAAB3.woff2')
const sfReg = fontB64('src/styles/fonts/SF-Regular.woff2')
const sfBold = fontB64('src/styles/fonts/SF-Bold.woff2')
const logo = readFileSync(join(root, 'public/icons/icon-512x512.png')).toString('base64')

const today = new Date().toLocaleDateString('es-AR', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric'
})

// Una "hoja" A4 por menú, con cabecera de marca propia y pie.
const menuPage = (menu) => {
  const groups = groupByCategory(menu.items, menu.order)
  return `    <section class="page" id="${menu.key}">
      <header class="page-head">
        <div class="brand">
          <img class="brand-logo" src="data:image/png;base64,${logo}" alt="" />
          <span class="brand-name">La Crypta</span>
        </div>
        <div class="title-row">
          <h2 class="page-title"><span class="page-icon">${menu.icon}</span>${menu.label}</h2>
          <span class="page-count">${menu.items.length} items</span>
        </div>
        <div class="page-rule"></div>
      </header>
      <div class="page-body">
        <div class="categories cols-${menu.columns}">
${groups.map(categoryBlock).join('\n')}
        </div>
      </div>
      <footer class="page-foot">
        <span class="bolt">&#9889;</span> Pagá con Bitcoin · Lightning <span class="bolt">&#9889;</span>
        <span class="sep">·</span> lacrypta.ar <span class="sep">·</span> ${today}
      </footer>
    </section>`
}

const navButtons = menus
  .map((m) => `      <a class="nav-btn" href="#${m.key}">${m.label}</a>`)
  .join('\n')

const pages = menus.map(menuPage).join('\n')

// --- HTML ----------------------------------------------------------------
const html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>La Crypta · Menú del evento</title>
  <meta name="theme-color" content="#1C1C1C" />
  <style>
    @font-face {
      font-family: 'IAAB3';
      src: url(data:font/woff2;base64,${iaab3}) format('woff2');
      font-weight: 400; font-style: normal; font-display: swap;
    }
    @font-face {
      font-family: 'SF';
      src: url(data:font/woff2;base64,${sfReg}) format('woff2');
      font-weight: 400; font-style: normal; font-display: swap;
    }
    @font-face {
      font-family: 'SF';
      src: url(data:font/woff2;base64,${sfBold}) format('woff2');
      font-weight: 700; font-style: normal; font-display: swap;
    }

    /* Hoja A4 sin márgenes de impresora: el fondo oscuro llega al borde */
    @page { size: A4; margin: 0; }

    :root {
      --black: #1C1C1C;
      --white: #f1f1f1;
      --primary: #56B68C;
      --secondary: #FDC800;
      --gray15: #262626;
      --gray20: #333333;
      --gray40: #404040;
      --gray45: #737373;
      --gray50: #808080;
    }

    * { box-sizing: border-box; margin: 0; padding: 0; }

    html { font-size: 18px; }

    body {
      background:
        radial-gradient(900px 500px at 50% -5%, #232323 0%, var(--black) 60%),
        var(--black);
      color: var(--white);
      font-family: 'SF', system-ui, -apple-system, sans-serif;
      min-height: 100vh;
      padding-bottom: 2rem;
      -webkit-font-smoothing: antialiased;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }

    ul { list-style: none; }

    /* ---- Nav (sólo pantalla) ---- */
    nav {
      position: sticky; top: 0; z-index: 10;
      background: #1c1c1ccc;
      backdrop-filter: blur(12px);
      border-bottom: 1px solid var(--gray15);
      padding: 0.7rem 1rem;
      margin-bottom: 1.75rem;
      display: flex; gap: 0.55rem; justify-content: center; flex-wrap: wrap;
    }
    .nav-btn {
      font-family: 'IAAB3', sans-serif;
      text-decoration: none;
      color: var(--white);
      background: var(--gray15);
      border: 1px solid var(--gray20);
      padding: 0.5rem 1.3rem;
      border-radius: 999px;
      font-size: 0.9rem;
      text-transform: uppercase;
      letter-spacing: 0.04em;
      transition: all 0.15s ease;
    }
    .nav-btn:hover { background: var(--primary); border-color: var(--primary); color: var(--black); }

    /* ---- Hoja = un menú = una A4 ---- */
    .page {
      background: var(--black);
      color: var(--white);
      width: 210mm;
      max-width: 100%;
      margin: 0 auto 1.5rem;
      padding: 14mm 15mm;
      border: 1px solid var(--gray15);
      display: flex;
      flex-direction: column;
      scroll-margin-top: 4.5rem;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }

    .brand { display: flex; align-items: center; gap: 0.5rem; margin-bottom: 1rem; }
    .brand-logo {
      width: 32px; height: 32px; border-radius: 8px;
      box-shadow: 0 0 0 1px var(--gray20);
    }
    .brand-name {
      font-family: 'IAAB3', sans-serif;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      font-size: 0.95rem;
    }

    .title-row { display: flex; align-items: baseline; gap: 0.75rem; }
    .page-title {
      font-family: 'IAAB3', sans-serif;
      font-size: 3rem;
      line-height: 1;
      text-transform: uppercase;
      letter-spacing: -0.01em;
      flex: 1;
    }
    .page-icon { font-size: 0.62em; margin-right: 0.35rem; }
    .page-count {
      color: var(--gray50);
      font-size: 0.78rem;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      white-space: nowrap;
    }
    .page-rule {
      height: 2px;
      background: linear-gradient(90deg, var(--primary) 0%, var(--primary) 72%, transparent 100%);
      margin-top: 0.8rem;
    }

    /* Cuerpo: los items se alinean ARRIBA; el pie queda fijado abajo. */
    .page-body { flex: 1; display: flex; flex-direction: column; justify-content: flex-start; padding: 1.7rem 0 0; }

    .categories { display: grid; }
    .categories.cols-1 { grid-template-columns: 1fr; gap: 2.1rem; }
    .categories.cols-2 { grid-template-columns: 1fr 1fr; gap: 1.5rem 2.8rem; }

    .category-title {
      font-family: 'SF', sans-serif;
      font-weight: 700;
      color: var(--secondary);
      text-transform: uppercase;
      letter-spacing: 0.14em;
      font-size: 0.8rem;
      margin-bottom: 0.7rem;
      padding-bottom: 0.45rem;
      border-bottom: 1px solid var(--gray20);
    }

    .item { display: flex; align-items: baseline; gap: 0.5rem; }
    /* Menús cortos (Barra/Comida) respiran; Merch (24 items) va más compacto */
    .cols-1 .item { padding: 0.58rem 0; }
    .cols-2 .item { padding: 0.4rem 0; }
    .item-info { display: flex; flex-direction: column; }
    .item-name { font-weight: 700; font-size: 1rem; line-height: 1.2; }
    .cols-1 .item-name { font-size: 1.08rem; }
    .item-sub { color: var(--gray50); font-size: 0.8rem; margin-top: 0.1rem; }
    .leader {
      flex: 1;
      border-bottom: 1px dotted var(--gray40);
      transform: translateY(-3px);
      min-width: 0.75rem;
    }
    .item-price { font-family: 'IAAB3', sans-serif; color: var(--primary); font-size: 1.02rem; white-space: nowrap; }
    .cols-1 .item-price { font-size: 1.12rem; }

    .page-foot {
      margin-top: 1.2rem;
      padding-top: 0.9rem;
      border-top: 1px solid var(--gray15);
      text-align: center;
      color: var(--gray45);
      font-size: 0.76rem;
    }
    .page-foot .bolt { color: var(--secondary); }
    .page-foot .sep { color: var(--gray20); margin: 0 0.2rem; }

    /* ---- Responsive (pantalla mobile) ---- */
    @media screen and (max-width: 800px) {
      html { font-size: 16px; }
      .page {
        width: 100%;
        border: none;
        padding: 1.75rem 1.15rem;
        margin-bottom: 0.5rem;
      }
      .page-title { font-size: 2.3rem; }
      .categories.cols-2 { grid-template-columns: 1fr; gap: 2.1rem; }
      .page-body { padding: 1.35rem 0 0; }
    }

    /* ---- Impresión: cada hoja = una A4, fondo oscuro forzado ---- */
    @media print {
      nav { display: none; }
      body { background: var(--black); padding: 0; min-height: 0; }
      .page {
        width: 210mm;
        min-height: 296mm; /* 1mm de holgura para evitar una hoja en blanco */
        margin: 0;
        border: none;
        break-after: page;
        break-inside: avoid;
      }
      .page:last-child { break-after: auto; }
    }
  </style>
</head>
<body>
  <nav>
${navButtons}
  </nav>

  <main>
${pages}
  </main>
</body>
</html>
`

const outPath = join(root, 'menu-evento.html')
writeFileSync(outPath, html, 'utf8')

const total = menus.reduce((n, m) => n + m.items.length, 0)
console.log(`OK  menu-evento.html generado (${total} items · ${menus.length} hojas A4)`)
for (const m of menus) console.log(`    ${m.label}: ${m.items.length} items (${m.columns} col)`)
