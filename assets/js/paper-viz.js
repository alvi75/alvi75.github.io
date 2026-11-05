// Small chart helpers for the paper pages. No dependencies.
(function () {
  'use strict';

  const NS = 'http://www.w3.org/2000/svg';
  const REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const SURFACE = '#161616';

  function svg(tag, attrs, parent) {
    const node = document.createElementNS(NS, tag);
    Object.keys(attrs || {}).forEach((k) => node.setAttribute(k, attrs[k]));
    if (parent) parent.appendChild(node);
    return node;
  }

  function html(tag, cls, parent, text) {
    const node = document.createElement(tag);
    if (cls) node.className = cls;
    if (text != null) node.textContent = text;
    if (parent) parent.appendChild(node);
    return node;
  }

  function label(parent, x, y, str, cls, anchor) {
    const t = svg('text', { x, y, class: cls, 'text-anchor': anchor || 'middle' }, parent);
    t.textContent = str;
    return t;
  }

  function linear(d0, d1, r0, r1) {
    return (v) => r0 + ((v - d0) * (r1 - r0)) / (d1 - d0);
  }

  function ticks(min, max, count) {
    const raw = (max - min) / count;
    const mag = Math.pow(10, Math.floor(Math.log10(raw)));
    const step = [1, 2, 2.5, 5, 10].map((m) => m * mag).find((s) => s >= raw);
    const out = [];
    for (let v = Math.ceil(min / step) * step; v <= max + 1e-9; v += step) out.push(+v.toFixed(6));
    return out;
  }

  function later(fn, delay) {
    if (REDUCED) { fn(); return; }
    requestAnimationFrame(() => requestAnimationFrame(() => setTimeout(fn, delay || 0)));
  }

  // set a CSS transform, optionally animating from a start value
  function place(node, from, to, animate, delay) {
    node.classList.add('pv-move');
    if (!animate) { node.style.transform = to; return; }
    node.style.transform = from;
    later(() => { node.style.transform = to; }, delay);
  }

  function onVisible(node, fn) {
    if (!('IntersectionObserver' in window)) { fn(); return; }
    const io = new IntersectionObserver((entries) => {
      if (entries.some((e) => e.isIntersecting)) { io.disconnect(); fn(); }
    }, { threshold: 0.3 });
    io.observe(node);
  }

  /* tooltip */

  const tip = (() => {
    let node = null;
    function show(anchor, content) {
      if (!node) node = html('div', 'pv-tip', document.body);
      node.textContent = '';
      if (content.title) html('div', 'pv-tip-title', node, content.title);
      (content.rows || []).forEach((r) => {
        const row = html('div', 'pv-tip-row', node);
        const key = html('span', 'pv-tip-key', row);
        key.style.background = r.color || 'transparent';
        html('strong', '', row, r.value);
        html('span', '', row, r.label);
      });
      if (content.note) html('div', 'pv-tip-note', node, content.note);
      node.classList.add('is-on');
      const box = anchor.getBoundingClientRect();
      const vw = document.documentElement.clientWidth;
      let left = box.left + box.width / 2 - node.offsetWidth / 2;
      left = Math.max(8, Math.min(left, vw - node.offsetWidth - 8));
      let top = box.top - node.offsetHeight - 10;
      if (top < 60) top = box.bottom + 10;
      node.style.left = left + window.scrollX + 'px';
      node.style.top = top + window.scrollY + 'px';
    }
    function hide() { if (node) node.classList.remove('is-on'); }
    return { show, hide };
  })();

  function bindTip(hit, getContent, hotNode) {
    const hot = hotNode || hit;
    const content = getContent();
    const parts = [content.title].concat((content.rows || []).map((r) => r.label + ' ' + r.value));
    hit.setAttribute('tabindex', '0');
    if (!hit.getAttribute('role')) hit.setAttribute('role', 'img');
    hit.setAttribute('aria-label', parts.filter(Boolean).join(', '));
    const on = () => { tip.show(hit, getContent()); hot.classList.add('is-hot'); };
    const off = () => { tip.hide(); hot.classList.remove('is-hot'); };
    hit.addEventListener('pointerenter', on);
    hit.addEventListener('pointerleave', (e) => { if (e.pointerType !== 'touch') off(); });
    hit.addEventListener('click', on);
    hit.addEventListener('focus', on);
    hit.addEventListener('blur', off);
  }

  function clearTip() {
    tip.hide();
    document.querySelectorAll('.is-hot').forEach((n) => n.classList.remove('is-hot'));
  }
  document.addEventListener('pointerdown', (e) => {
    if (!e.target.closest || !e.target.closest('[tabindex]')) clearTip();
  });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') clearTip(); });

  /* controls, legend, table */

  function segmented(parent, options, current, onChange, name) {
    const group = html('div', 'pv-seg', parent);
    group.setAttribute('role', 'group');
    group.setAttribute('aria-label', name);
    const buttons = options.map((opt) => {
      const b = html('button', '', group, opt);
      b.type = 'button';
      b.setAttribute('aria-pressed', String(opt === current));
      b.addEventListener('click', () => {
        if (b.getAttribute('aria-pressed') === 'true') return;
        buttons.forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
        onChange(opt);
      });
      return b;
    });
    return { group, buttons };
  }

  function legend(node, items) {
    node.textContent = '';
    node.hidden = !items || items.length < 2;
    (items || []).forEach((it) => {
      const span = html('span', '', node);
      const key = html('i', 'pv-key' + (it.shape ? ' is-' + it.shape : ''), span);
      key.style.background = it.color;
      span.appendChild(document.createTextNode(it.name));
    });
  }

  function table(node, data) {
    node.textContent = '';
    if (!data) return;
    const t = html('table', '', node);
    const tr = html('tr', '', html('thead', '', t));
    data.head.forEach((h) => html('th', '', tr, h));
    const body = html('tbody', '', t);
    data.rows.forEach((r) => {
      const row = html('tr', '', body);
      r.forEach((c) => html('td', '', row, c));
    });
  }

  // Builds the chart/table figure inside <figure>, above its <figcaption>.
  function mount(fig, opts) {
    const state = Object.assign({}, opts.initial);
    const bar = html('div', 'pv-bar');
    const left = html('div', 'pv-controls', bar);
    (opts.controls || []).forEach((c) => {
      segmented(left, c.options, state[c.key], (v) => { state[c.key] = v; render(true); }, c.name);
    });
    const legendNode = html('div', 'pv-legend');
    const plot = html('div', 'pv-plot' + (opts.wide ? ' is-wide' : ''));
    const tableNode = html('div', 'pv-table-wrap');
    tableNode.hidden = true;
    segmented(bar, ['Chart', 'Table'], 'Chart', (v) => {
      const isChart = v === 'Chart';
      plot.hidden = !isChart;
      legendNode.style.visibility = isChart ? '' : 'hidden';
      tableNode.hidden = isChart;
    }, 'View');
    const cap = fig.querySelector('figcaption');
    [bar, legendNode, plot, tableNode].forEach((n) => fig.insertBefore(n, cap));
    plot.style.minHeight = (opts.minHeight || 260) + 'px';

    let shown = false;
    let lastWidth = 0;
    function render(animate) {
      const spec = opts.spec(state);
      legend(legendNode, spec.legend);
      table(tableNode, spec.table);
      const width = plot.clientWidth || lastWidth;
      if (!width) return;
      lastWidth = width;
      plot.textContent = '';
      const s = svg('svg', { role: 'group', 'aria-label': spec.label || '' }, plot);
      const w = Math.max(width, opts.wide ? 640 : 280);
      const h = opts.draw(s, w, spec, animate && shown);
      s.setAttribute('viewBox', `0 0 ${w} ${h}`);
      plot.style.minHeight = '';
    }
    onVisible(fig, () => { shown = true; render(true); });
    if ('ResizeObserver' in window) {
      new ResizeObserver(() => {
        if (shown && plot.clientWidth && Math.abs(plot.clientWidth - lastWidth) > 4) render(false);
      }).observe(plot);
    }
  }

  /* chart parts */

  function grid(s, w, m, y, values, fmt) {
    const g = svg('g', { class: 'pv-grid' }, s);
    values.forEach((v) => {
      svg('line', { x1: m.l, x2: w - m.r, y1: y(v), y2: y(v) }, g);
      label(s, m.l - 8, y(v) + 4, fmt ? fmt(v) : String(v), 'pv-tick', 'end');
    });
  }

  function catLabels(s, x, y, cat) {
    label(s, x, y, cat.label, 'pv-cat');
    if (cat.sub) label(s, x, y + 14, cat.sub, 'pv-cat-sub');
  }

  function split(s, x, top, bottom) {
    svg('line', { x1: x, x2: x, y1: top, y2: bottom, class: 'pv-axis-line' }, s);
  }

  function seriesRows(spec, i) {
    return spec.series
      .filter((sr) => sr.values[i] != null)
      .map((sr) => ({ label: sr.name, value: spec.format(sr.values[i]), color: sr.color }));
  }

  // dots per category, joined from lowest to highest value
  function dots(s, w, spec, animate) {
    const h = 290;
    const m = { t: 12, r: 12, b: 50, l: 44 };
    const y = linear(spec.domain[0], spec.domain[1], h - m.b, m.t);
    grid(s, w, m, y, ticks(spec.domain[0], spec.domain[1], 5), spec.tick);
    const band = (w - m.l - m.r) / spec.categories.length;
    if (spec.splitAt) split(s, m.l + band * spec.splitAt, m.t, h - m.b + 34);
    spec.categories.forEach((cat, i) => {
      const cx = m.l + band * (i + 0.5);
      const col = svg('g', { class: 'pv-col' }, s);
      const vals = spec.series.map((sr) => sr.values[i]).filter((v) => v != null);
      const lo = y(Math.min(...vals));
      const hi = y(Math.max(...vals));
      const mid = (lo + hi) / 2;
      const linkWrap = svg('g', { transform: `translate(${cx},${mid})` }, col);
      const link = svg('line', { x1: 0, x2: 0, y1: hi - mid, y2: lo - mid, stroke: '#55534f', 'stroke-width': 2 }, linkWrap);
      place(link, 'scaleY(0)', 'scaleY(1)', animate, i * 60);
      const n = spec.series.length;
      spec.series.forEach((sr, k) => {
        const v = sr.values[i];
        if (v == null) return;
        // small sideways offset so equal values stay visible
        const x = cx + (k - (n - 1) / 2) * 9;
        const g = svg('g', {}, col);
        svg('circle', { r: 5.5, fill: sr.color, stroke: SURFACE, 'stroke-width': 2 }, g);
        place(g, `translate(${x}px,${mid}px)`, `translate(${x}px,${y(v)}px)`, animate, i * 60);
      });
      catLabels(s, cx, h - m.b + 20, cat);
      const hit = svg('rect', { x: cx - band / 2, y: m.t, width: band, height: h - m.t, class: 'pv-hit' }, col);
      bindTip(hit, () => ({ title: cat.full || cat.label, rows: seriesRows(spec, i), note: cat.note }), col);
    });
    return h;
  }

  function barPath(x, bw, bh) {
    const r = Math.min(4, bh, bw / 2);
    return `M${x},0V${-(bh - r)}Q${x},${-bh} ${x + r},${-bh}H${x + bw - r}Q${x + bw},${-bh} ${x + bw},${-(bh - r)}V0Z`;
  }

  // grouped columns from a zero baseline
  function columns(s, w, spec, animate) {
    const h = 280;
    const m = { t: 12, r: 12, b: 50, l: 44 };
    const y = linear(0, spec.max, h - m.b, m.t);
    grid(s, w, m, y, ticks(0, spec.max, 5), spec.tick);
    const band = (w - m.l - m.r) / spec.categories.length;
    const n = spec.series.length;
    const bw = Math.min(24, (band - 16) / n - 2);
    if (spec.splitAt) split(s, m.l + band * spec.splitAt, m.t, h - m.b + 34);
    spec.categories.forEach((cat, i) => {
      const cx = m.l + band * (i + 0.5);
      const col = svg('g', { class: 'pv-col' }, s);
      const base = svg('g', { transform: `translate(0,${h - m.b})` }, col);
      const x0 = cx - (n * (bw + 2) - 2) / 2;
      spec.series.forEach((sr, k) => {
        const v = sr.values[i];
        if (v == null) return;
        const p = svg('path', { d: barPath(x0 + k * (bw + 2), bw, (h - m.b) - y(v)), fill: sr.color }, base);
        place(p, 'scaleY(0)', 'scaleY(1)', animate, i * 50 + k * 30);
      });
      svg('line', { x1: cx - band / 2 + 6, x2: cx + band / 2 - 6, y1: h - m.b, y2: h - m.b, class: 'pv-axis-line' }, col);
      catLabels(s, cx, h - m.b + 20, cat);
      const hit = svg('rect', { x: cx - band / 2, y: m.t, width: band, height: h - m.t, class: 'pv-hit' }, col);
      bindTip(hit, () => ({ title: cat.full || cat.label, rows: seriesRows(spec, i), note: cat.note }), col);
    });
    return h;
  }

  // horizontal bars, one row per item, value at the tip
  function rows(s, w, spec, animate) {
    const rowH = spec.rowHeight || 24;
    const lw = spec.labelWidth || 150;
    const m = { t: 6, r: 44, b: 8, l: lw + 10 };
    const h = m.t + m.b + rowH * spec.rows.length;
    const x = linear(0, spec.max, m.l, w - m.r);
    svg('line', { x1: m.l, x2: m.l, y1: m.t, y2: h - m.b, class: 'pv-axis-line' }, s);
    spec.rows.forEach((r, i) => {
      const cy = m.t + rowH * (i + 0.5);
      const g = svg('g', {}, s);
      label(g, m.l - 8, cy + 4, r.label, 'pv-cat', 'end');
      const bh = Math.min(12, rowH - 8);
      const len = Math.max(0, x(r.value) - m.l);
      const wrap = svg('g', { transform: `translate(${m.l},${cy - bh / 2})` }, g);
      const rr = Math.min(4, len / 2);
      const p = svg('path', {
        d: `M0,0H${len - rr}Q${len},0 ${len},${rr}V${bh - rr}Q${len},${bh} ${len - rr},${bh}H0Z`,
        fill: r.color || spec.color,
      }, wrap);
      place(p, 'scaleX(0)', 'scaleX(1)', animate, i * 35);
      const v = label(g, x(r.value) + 6, cy + 4, spec.format(r.value), 'pv-val', 'start');
      if (animate && !REDUCED) { v.style.opacity = 0; v.classList.add('pv-fade'); later(() => { v.style.opacity = 1; }, 500 + i * 35); }
      const hit = svg('rect', { x: 0, y: cy - rowH / 2, width: w, height: rowH, class: 'pv-hit' }, g);
      bindTip(hit, () => ({
        title: r.full || r.label,
        rows: [{ label: spec.unit || '', value: spec.format(r.value), color: r.color || spec.color }],
        note: r.note,
      }));
    });
    return h;
  }

  // stacked columns; each segment lists what it is made of
  function stacks(s, w, spec, animate) {
    const h = 280;
    const m = { t: 22, r: 12, b: 50, l: 44 };
    const y = linear(0, spec.max, h - m.b, m.t);
    grid(s, w, m, y, ticks(0, spec.max, 5), spec.tick);
    const band = (w - m.l - m.r) / spec.categories.length;
    const bw = Math.min(44, band * 0.5);
    spec.categories.forEach((cat, i) => {
      const cx = m.l + band * (i + 0.5);
      const col = svg('g', {}, s);
      const base = svg('g', { transform: `translate(${cx - bw / 2},${h - m.b})` }, col);
      const grow = svg('g', {}, base);
      let acc = 0;
      cat.segments.forEach((seg, k) => {
        const top = (h - m.b) - y(acc + seg.value);
        const bottom = (h - m.b) - y(acc);
        const isTop = k === cat.segments.length - 1;
        const segH = top - bottom - (isTop ? 0 : 2);
        const node = isTop
          ? svg('path', { d: barPath(0, bw, segH), fill: seg.color, transform: `translate(0,${-bottom})` }, grow)
          : svg('rect', { x: 0, y: -bottom - segH, width: bw, height: segH, fill: seg.color }, grow);
        const hit = svg('rect', { x: 0, y: -top, width: bw, height: top - bottom, class: 'pv-hit' }, base);
        bindTip(hit, () => ({ title: `${cat.label} · ${seg.name}`, rows: [{ label: spec.unit, value: String(seg.value), color: seg.color }], note: seg.note }), node);
        acc += seg.value;
      });
      place(grow, 'scaleY(0)', 'scaleY(1)', animate, i * 90);
      label(col, cx, y(acc) - 6, String(acc), 'pv-val');
      catLabels(s, cx, h - m.b + 20, cat);
    });
    return h;
  }

  const RAMP = ['#184f95', '#1c5cab', '#2a78d6', '#5598e7', '#86b6ef', '#9ec5f4', '#cde2fb'];

  function heat(v, max) {
    return RAMP[Math.round(((v - 1) / Math.max(1, max - 1)) * (RAMP.length - 1))];
  }

  // count matrix: rows x columns, zero cells left empty
  function heatmap(s, w, spec, animate) {
    const lw = spec.labelWidth || 190;
    const top = spec.headHeight || 118;
    const cell = Math.min(30, (w - lw - 80) / spec.cols.length);
    const h = top + cell * spec.rows.length + 6;
    const max = Math.max(...spec.values.flat());
    const colText = spec.cols.map((c, j) => {
      const cx = lw + cell * (j + 0.5);
      const t = label(s, 0, 0, (spec.colLabels || spec.cols)[j], 'pv-cat-sub', 'start');
      t.setAttribute('transform', `translate(${cx + 3},${top - 6}) rotate(-55)`);
      return t;
    });
    spec.rows.forEach((r, i) => {
      const rowText = label(s, lw - 8, top + cell * (i + 0.5) + 4, r, 'pv-cat', 'end');
      spec.values[i].forEach((v, j) => {
        const g = svg('g', {}, s);
        const x = lw + cell * j;
        const yy = top + cell * i;
        svg('rect', {
          x: x + 1, y: yy + 1, width: cell - 2, height: cell - 2, rx: 2,
          fill: v ? heat(v, max) : 'rgba(255,255,255,0.035)',
        }, g);
        if (v) label(g, x + cell / 2, yy + cell / 2 + 4, String(v), 'pv-val').style.fill = v >= 4 ? '#0b0b0b' : '#ffffff';
        if (animate && !REDUCED) { g.style.opacity = 0; g.classList.add('pv-fade'); later(() => { g.style.opacity = 1; }, (i + j) * 18); }
        if (!v) return;
        const hit = svg('rect', { x, y: yy, width: cell, height: cell, class: 'pv-hit' }, g);
        bindTip(hit, () => ({ title: `${spec.cols[j]} × ${r}`, rows: [{ label: spec.unit, value: String(v), color: heat(v, max) }] }));
        const mark = (on) => {
          rowText.style.fill = on ? '#f0efec' : '';
          colText[j].style.fill = on ? '#f0efec' : '';
        };
        hit.addEventListener('pointerenter', () => mark(true));
        hit.addEventListener('pointerleave', () => mark(false));
        hit.addEventListener('focus', () => mark(true));
        hit.addEventListener('blur', () => mark(false));
      });
    });
    return h;
  }

  // diagram with tabs that cycles through its states until the reader takes over
  function cycler(fig, names, show, name, legendItems) {
    const bar = html('div', 'pv-bar');
    const legendNode = html('div', 'pv-legend');
    const plot = html('div', 'pv-plot pv-diagram');
    const note = html('p', 'pv-note');
    const cap = fig.querySelector('figcaption');
    [bar, legendNode, plot, note].forEach((n) => fig.insertBefore(n, cap));
    legend(legendNode, legendItems);
    let timer = null;
    let touched = false;
    const stop = () => { touched = true; clearInterval(timer); };
    fig.addEventListener('pointerdown', stop);
    fig.addEventListener('keydown', stop);
    const go = (n) => show(plot, note, n);
    const seg = segmented(bar, names, names[0], (n) => { stop(); go(n); }, name);
    go(names[0]);
    if (REDUCED) return;
    onVisible(fig, () => {
      if (touched) return;
      let i = 0;
      timer = setInterval(() => {
        i = (i + 1) % names.length;
        seg.buttons.forEach((b, k) => b.setAttribute('aria-pressed', String(k === i)));
        go(names[i]);
      }, 4500);
    });
  }

  /* numbers that count up once visible */

  function countUp(node, to, decimals, suffix) {
    const fmt = (v) => v.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals }) + (suffix || '');
    if (REDUCED) { node.textContent = fmt(to); return; }
    const t0 = performance.now();
    const step = (t) => {
      const k = Math.min(1, (t - t0) / 1400);
      node.textContent = fmt(to * (1 - Math.pow(1 - k, 3)));
      if (k < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }

  function counters(root) {
    root.querySelectorAll('[data-count]').forEach((n) => {
      const to = parseFloat(n.dataset.count);
      const dec = parseInt(n.dataset.decimals || '0', 10);
      const suffix = n.dataset.suffix || '';
      n.textContent = (0).toFixed(dec) + suffix;
      onVisible(n, () => countUp(n, to, dec, suffix));
    });
  }

  window.PaperViz = {
    svg, html, label, linear, later, place, onVisible, bindTip, segmented,
    mount, cycler, legend, dots, columns, rows, stacks, heatmap, counters, REDUCED,
  };
})();
