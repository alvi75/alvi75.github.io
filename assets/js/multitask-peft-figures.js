// Figures for projects/multitask_peft. Numbers are from the TOSEM paper (doi:10.1145/3860535).
(function () {
  'use strict';
  const V = window.PaperViz;
  const MT = '#d95926';
  const ST = '#3987e5';
  const FFT = '#199e70';
  const SIZES = ['0.5B', '1.5B', '3B', '7B'];

  // last value in mt/st is CodeLlama-7B; there is no full fine-tuning run for it
  const GEN = { // pass@1, Tables 6, 7, 11, 12
    Python: { mt: [15.79, 18.95, 21.05, 20.53, 21.58], st: [15.79, 16.84, 20.53, 22.63, 21.58], fft: [14.74, 15.79, 17.37, 14.74] },
    Java: { mt: [20.11, 19.02, 32.07, 33.70, 25.00], st: [21.74, 25.54, 29.89, 30.43, 33.15], fft: [19.02, 20.11, 26.63, 18.48] },
  };
  const TRANS = { // CodeBLEU, Tables 8, 9, 13, 14
    'Java → C#': { mt: [68.92, 73.08, 62.88, 55.37, 79.45], st: [75.77, 72.27, 66.83, 77.70, 82.22], fft: [74.91, 78.53, 66.38, 72.10] },
    'C# → Java': { mt: [68.37, 70.72, 71.22, 49.83, 79.98], st: [75.36, 69.35, 72.81, 71.26, 82.48], fft: [73.82, 70.07, 76.98, 70.54] },
  };
  const SUMM = { // BLEU, Tables 10 and 15
    Python: { mt: [19.43, 22.90, 29.90, 30.80, 30.89], st: [14.29, 15.12, 23.31, 16.49, 27.98], fft: [9.53, 12.67, 22.54, 9.76] },
    Java: { mt: [7.18, 8.12, 7.63, 8.37, 10.96], st: [7.10, 8.48, 8.73, 8.19, 8.50], fft: [7.70, 7.43, 7.90, 6.77] },
  };
  const COST = { // Table 16
    sizes: ['1.5B', '3B', '7B'],
    fft: [13.04, 23.28, 39.92],
    mt: [10.48, 15.68, 24.15],
  };
  const ABLATION = { // CodeBLEU at 3B, Tables 8, 9, 19, 20, 24, 25
    'Java → C#': [62.88, 66.12, 73.71, 5.35, 66.83],
    'C# → Java': [71.22, 65.56, 72.48, 7.35, 72.81],
  };

  const pct = (v) => v.toFixed(2) + '%';
  const tickPct = (v) => v + '%';
  const CATS = SIZES.map((s) => ({ label: s, full: 'Qwen2.5-Coder-' + s }))
    .concat([{ label: 'CodeLlama', sub: '7B', full: 'CodeLlama-7B' }]);

  function threeWay(data, key, domainOrMax, isColumns) {
    const d = data[key];
    const series = [
      { name: 'MT-QLoRA', color: MT, values: d.mt },
      { name: 'ST-QLoRA', color: ST, values: d.st },
      { name: 'MT-FFT', color: FFT, values: d.fft.concat([null]) },
    ];
    const spec = {
      categories: CATS,
      series,
      format: pct,
      tick: tickPct,
      splitAt: 4,
      legend: series.map((s) => ({ name: s.name, color: s.color, shape: isColumns ? 'bar' : '' })),
      table: {
        head: ['Model', 'MT-QLoRA', 'ST-QLoRA', 'MT-FFT'],
        rows: CATS.map((c, i) => [c.full].concat(series.map((s) => (s.values[i] == null ? '—' : pct(s.values[i]))))),
      },
      label: key,
    };
    if (isColumns) spec.max = domainOrMax; else spec.domain = domainOrMax;
    return spec;
  }

  function taskCharts() {
    V.mount(document.getElementById('fig-gen'), {
      initial: { lang: 'Python' },
      controls: [{ key: 'lang', options: ['Python', 'Java'], name: 'Language' }],
      spec: (st) => threeWay(GEN, st.lang, [10, 35]),
      draw: V.dots,
      minHeight: 290,
    });
    V.mount(document.getElementById('fig-trans'), {
      initial: { dir: 'Java → C#' },
      controls: [{ key: 'dir', options: ['Java → C#', 'C# → Java'], name: 'Direction' }],
      spec: (st) => threeWay(TRANS, st.dir, [45, 85]),
      draw: V.dots,
      minHeight: 290,
    });
    V.mount(document.getElementById('fig-summ'), {
      initial: { lang: 'Python' },
      controls: [{ key: 'lang', options: ['Python', 'Java'], name: 'Language' }],
      spec: (st) => threeWay(SUMM, st.lang, st.lang === 'Python' ? 35 : 12, true),
      draw: V.columns,
      minHeight: 280,
    });
  }

  function costCharts() {
    V.mount(document.getElementById('fig-memory'), {
      spec: () => ({
        categories: COST.sizes.map((s) => ({ label: s, full: 'Qwen2.5-Coder-' + s })),
        series: [
          { name: 'MT-FFT', color: FFT, values: COST.fft },
          { name: 'MT-QLoRA', color: MT, values: COST.mt },
        ],
        max: 45,
        format: (v) => v.toFixed(2) + ' GB',
        tick: (v) => v + ' GB',
        legend: [{ name: 'MT-FFT', color: FFT, shape: 'bar' }, { name: 'MT-QLoRA', color: MT, shape: 'bar' }],
        table: {
          head: ['Model', 'MT-FFT', 'MT-QLoRA'],
          rows: COST.sizes.map((s, i) => ['Qwen2.5-Coder-' + s, COST.fft[i] + ' GB', COST.mt[i] + ' GB']),
        },
        label: 'Peak GPU memory during training',
      }),
      draw: V.columns,
    });
    V.mount(document.getElementById('fig-ablation'), {
      initial: { dir: 'Java → C#' },
      controls: [{ key: 'dir', options: ['Java → C#', 'C# → Java'], name: 'Direction' }],
      spec: (st) => {
        const v = ABLATION[st.dir];
        const names = ['All three tasks', 'All three, balanced sampling', 'Generation + translation', 'Summarization + translation', 'ST-QLoRA (reference)'];
        return {
          rows: names.map((n, i) => ({ label: n, value: v[i], color: i === 4 ? ST : MT })),
          max: 85,
          labelWidth: 190,
          format: pct,
          unit: 'CodeBLEU',
          legend: [{ name: 'MT-QLoRA variants', color: MT, shape: 'bar' }, { name: 'ST-QLoRA', color: ST, shape: 'bar' }],
          table: { head: ['Training mix (3B)', 'CodeBLEU'], rows: names.map((n, i) => [n, pct(v[i])]) },
          label: 'Ablation, ' + st.dir,
        };
      },
      draw: V.rows,
      minHeight: 140,
    });
  }

  /* the three training set-ups */

  const SETUPS = {
    'MT-QLoRA': {
      color: MT, models: 1, frozen: true,
      note: 'One model for all three tasks. The base model stays frozen and a single small adapter learns all three.',
    },
    'ST-QLoRA': {
      color: ST, models: 3, frozen: true,
      note: 'One model per task: the same frozen 4-bit base and the same adapter settings, trained three times, once on each task.',
    },
    'MT-FFT': {
      color: FFT, models: 1, frozen: false,
      note: 'One model for all three tasks, with every weight updated and no adapter.',
    },
  };
  const TASKS = [
    { name: 'Code generation', io: 'NL → code', y: 45 },
    { name: 'Code summarization', io: 'code → NL', y: 125 },
    { name: 'Code translation', io: 'Java ↔ C#', y: 205 },
  ];

  function drawModel(s, box, mode) {
    const g = V.svg('g', {}, s);
    V.svg('rect', {
      x: 300, y: box.y, width: 200, height: box.h, rx: 6,
      fill: mode.frozen ? '#1f1f1f' : 'rgba(25,158,112,0.12)', stroke: mode.frozen ? '#3a3a3a' : FFT,
    }, g);
    V.label(g, 312, box.y + 16, mode.frozen ? 'base model · 4-bit · frozen' : 'base model · all weights trained', 'pv-cat-sub', 'start');
    const cols = 12;
    const rowsN = Math.max(1, Math.floor((box.h - 30) / 13));
    for (let r = 0; r < rowsN; r++) {
      for (let c = 0; c < cols; c++) {
        const cell = V.svg('rect', { x: 312 + c * 15, y: box.y + 24 + r * 13, width: 10, height: 8, rx: 1.5, fill: mode.frozen ? '#363636' : FFT }, g);
        if (!mode.frozen && !V.REDUCED) {
          cell.style.opacity = 0.15;
          cell.classList.add('pv-fade');
          V.later(() => { cell.style.opacity = 1; }, (r + c) * 30);
        }
      }
    }
    if (!mode.frozen) return;
    const ay = box.y + box.h / 2;
    V.svg('line', { x1: 500, x2: 526, y1: ay, y2: ay, stroke: mode.color, 'stroke-width': 2 }, g);
    const ad = V.svg('rect', { x: 526, y: ay - 16, width: 30, height: 32, rx: 4, fill: mode.color }, g);
    V.svg('rect', { x: 526, y: ay - 16, width: 30, height: 32, rx: 4, fill: 'none', stroke: mode.color, class: 'pv-pulse' }, g);
    V.label(g, 564, ay + 4, 'LoRA r = 8', 'pv-cat-sub', 'start');
    ad.style.transformBox = 'fill-box';
    ad.style.transformOrigin = 'center';
    V.place(ad, 'scale(0.4)', 'scale(1)', true, 120);
  }

  function drawSetup(plot, name) {
    const mode = SETUPS[name];
    plot.textContent = '';
    const s = V.svg('svg', { viewBox: '0 0 640 250', role: 'img', 'aria-label': name + ': ' + mode.note }, plot);
    const boxes = mode.models === 1 ? [{ y: 50, h: 150 }] : [{ y: 12, h: 66 }, { y: 92, h: 66 }, { y: 172, h: 66 }];
    TASKS.forEach((t, i) => {
      const box = boxes[mode.models === 1 ? 0 : i];
      const ty = mode.models === 1 ? box.y + (box.h * (i + 1)) / 4 : box.y + box.h / 2;
      V.svg('path', { d: `M160,${t.y} C230,${t.y} 230,${ty} 300,${ty}`, fill: 'none', stroke: mode.color, 'stroke-width': 2, class: 'pv-flow' }, s);
      V.svg('rect', { x: 10, y: t.y - 22, width: 150, height: 44, rx: 6, fill: '#1d1d1d', stroke: 'rgba(255,255,255,0.14)' }, s);
      V.label(s, 24, t.y - 3, t.name, 'pv-cat', 'start');
      V.label(s, 24, t.y + 13, t.io, 'pv-cat-sub', 'start');
    });
    boxes.forEach((b) => drawModel(s, b, mode));
  }

  function setupFigure(fig) {
    V.cycler(fig, Object.keys(SETUPS), (plot, note, name) => {
      drawSetup(plot, name);
      note.textContent = SETUPS[name].note;
    }, 'Training set-up');
  }

  /* the 28 trained models */

  function modelGroups() {
    const unit = (color, title, note) => ({ color, title, note });
    const qwen = SIZES.map((s) => [
      unit(MT, `Qwen2.5-Coder-${s} · MT-QLoRA`, 'all three tasks'),
      unit(ST, `Qwen2.5-Coder-${s} · ST-QLoRA`, 'code generation'),
      unit(ST, `Qwen2.5-Coder-${s} · ST-QLoRA`, 'code summarization'),
      unit(ST, `Qwen2.5-Coder-${s} · ST-QLoRA`, 'code translation'),
      unit(FFT, `Qwen2.5-Coder-${s} · MT-FFT`, 'all three tasks'),
    ]);
    return [
      { name: 'Qwen2.5-Coder', sub: '0.5B, 1.5B, 3B, 7B', sets: qwen },
      {
        name: 'CodeLlama-7B', sub: 'repeats RQ1',
        sets: [[unit(MT, 'CodeLlama-7B · MT-QLoRA', 'all three tasks'),
          unit(ST, 'CodeLlama-7B · ST-QLoRA', 'code generation'),
          unit(ST, 'CodeLlama-7B · ST-QLoRA', 'code summarization'),
          unit(ST, 'CodeLlama-7B · ST-QLoRA', 'code translation')]],
      },
      {
        name: 'Qwen2.5-Coder-3B', sub: 'task-mix ablations',
        sets: [[unit(MT, 'MT-QLoRA, balanced sampling', 'all three tasks, equal share'),
          unit(MT, 'MT-QLoRA', 'generation + translation'),
          unit(MT, 'MT-QLoRA', 'generation + summarization'),
          unit(MT, 'MT-QLoRA', 'summarization + translation')]],
      },
    ];
  }

  function unitsFigure(fig) {
    const groups = modelGroups();
    const wrap = V.html('div', 'pv-units is-pre');
    const legendNode = V.html('div', 'pv-legend');
    [['MT-QLoRA', MT], ['ST-QLoRA', ST], ['MT-FFT', FFT]].forEach(([n, c]) => {
      const sp = V.html('span', '', legendNode);
      V.html('i', 'pv-key is-bar', sp).style.background = c;
      sp.appendChild(document.createTextNode(n));
    });
    let k = 0;
    groups.forEach((g) => {
      const row = V.html('div', 'pv-unit-group', wrap);
      const name = V.html('div', 'pv-unit-name', row, g.name);
      V.html('small', '', name, g.sub);
      const units = V.html('div', 'pv-unit-row', row);
      g.sets.forEach((set) => {
        const box = V.html('div', 'pv-unit-set', units);
        set.forEach((u) => {
          const sq = V.html('span', 'pv-unit', box);
          sq.style.background = u.color;
          sq.style.transitionDelay = (k++ * 22) + 'ms';
          V.bindTip(sq, () => ({ title: u.title, rows: [{ label: 'trained on', value: u.note, color: u.color }] }));
        });
      });
    });
    const cap = fig.querySelector('figcaption');
    fig.insertBefore(legendNode, cap);
    fig.insertBefore(wrap, cap);
    V.onVisible(fig, () => V.later(() => wrap.classList.remove('is-pre')));
  }

  document.addEventListener('DOMContentLoaded', () => {
    setupFigure(document.getElementById('fig-setup'));
    unitsFigure(document.getElementById('fig-models'));
    taskCharts();
    costCharts();
    V.counters(document);
  });
})();
