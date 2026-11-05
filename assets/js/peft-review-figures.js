// Figures for projects/peft_review. Data is from the TOSEM paper (doi:10.1145/3796522).
(function () {
  'use strict';
  const V = window.PaperViz;
  const GEN = '#3987e5';
  const NON = '#d95926';
  const TRAINED = '#d95926';

  // Table 1: abbreviation, name, generative?, description, number of studies
  const TASKS = [
    ['APR', 'Automated Program Repair', 1, 'Automatically generates patches to fix buggy code without human intervention.', 3],
    ['CG', 'Code Generation', 1, 'Generates source code from natural language descriptions or formal specifications.', 10],
    ['CRF', 'Code Refinement', 1, 'Improves or restructures existing code while preserving its original functionality.', 4],
    ['CRG', 'Code Review Generation', 1, 'Generates natural language review comments from code changes to provide immediate feedback during commits.', 1],
    ['CSum', 'Code Summarization', 1, 'Generates concise natural language summaries describing code behavior or intent.', 13],
    ['CTrans', 'Code Translation', 1, 'Converts code from one programming language to another while preserving functionality.', 8],
    ['CMG', 'Commit Message Generation', 1, 'Generates commit messages automatically from code changes to summarize their intent and content.', 2],
    ['CComp', 'Code Completion', 1, 'Predicts and completes the next code token or line based on the surrounding context.', 3],
    ['JITCU', 'Just-in-time Comment Update', 1, 'Automatically updates code comments in response to changes in the associated code.', 1],
    ['MNR', 'Method Name Recommendation', 1, 'Suggests meaningful method names based on code content and contextual information.', 1],
    ['PBT', 'Protocol Buffer Transformation', 1, 'Generates code functions that transform data structures between different format specifications.', 1],
    ['UTG', 'Unit Test Generation', 1, 'Automatically generates unit test cases from source code to verify its correctness.', 2],
    ['CT', 'Cloze Test', 0, "A probing task used to assess a model's understanding of code syntax without updating its parameters.", 2],
    ['CCD', 'Code Clone Detection', 0, 'Identifies syntactically or functionally similar code fragments to reduce redundancy and improve maintainability.', 6],
    ['CR', 'Code Review', 0, 'Assists the review process by recommending reviewers or identifying issues in code changes.', 1],
    ['CS', 'Code Search', 0, 'Retrieves semantically relevant code snippets given a natural language query.', 3],
    ['DD', 'Defect Detection', 0, 'Predicts whether a code snippet contains bugs or security vulnerabilities.', 5],
    ['HFP', 'Header File Prediction', 0, 'Predicts the correct file paths for header dependencies given source file information.', 1],
    ['MNCC', 'Method Name Consistency Check', 0, 'Determines whether a method name aligns with its implementation to detect naming inconsistencies.', 1],
  ];
  const TASK = Object.fromEntries(TASKS.map((t) => [t[0], t[1]]));

  // Fig. 2
  const VENUES = [['ASE', 4], ['TOSEM', 3], ['ICSE', 3], ['FSE', 3], ['TSE', 2], ['arXiv', 2], ['SANER', 1], ['NeurIPS', 1],
    ['NAACL', 1], ['MSR', 1], ['KDD', 1], ['ISSTA', 1], ['ICPC', 1], ['FORGE', 1], ['EMSE', 1], ['EMNLP', 1], ['ACL', 1]];

  // Fig. 4: task instances per year
  const YEARS = [
    ['2022', { CG: 1, CSum: 3, CTrans: 2, UTG: 1 }, { CT: 1, CCD: 2, DD: 1 }],
    ['2023', { CComp: 1, CG: 3, CRF: 2, CSum: 7, CTrans: 4, MNR: 1 }, { CCD: 3, CS: 3, DD: 3, MNCC: 1 }],
    ['2024', { APR: 2, CComp: 1, CG: 4, CRF: 2, CRG: 1, CSum: 2, CTrans: 1, CMG: 2, JITCU: 1, UTG: 1 }, { CT: 1, CCD: 1, CR: 1, DD: 1 }],
    ['2025', { APR: 1, CComp: 1, CG: 2, CSum: 1, CTrans: 1, PBT: 1 }, { HFP: 1 }],
  ];

  // Fig. 5: studies per task (rows, Table 1 order) and method (columns)
  const METHODS = ['Base LoRA', 'QLoRA', 'AdaLoRA', 'FF-LoRA', 'FF-LoRA + AT', 'Base Adapter', 'L-Adapter', 'T-Adapter',
    'L-Adapter + T-Adapter', 'L-Adapter + NER-Adapter + AdapterFusion', 'Prompt Tuning', 'Prefix Tuning', 'P-Tuning',
    'BitFit', 'Telly-K', 'MAM', '(IA)³', 'Pass-Tuning'];
  const HEAT_ROWS = ['APR', 'CG', 'CR', 'CRF', 'CRG', 'CSum', 'CTrans', 'CMG', 'CComp', 'HFP', 'JITCU', 'MNR', 'PBT', 'UTG', 'CT', 'CCD', 'CS', 'DD', 'MNCC'];
  const HEAT = [
    [3, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 2, 0],
    [7, 1, 0, 1, 1, 2, 0, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [1, 0, 0, 0, 0, 1, 0, 0, 0, 1, 1, 0, 1, 1, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0],
    [2, 2, 0, 1, 1, 4, 0, 1, 0, 1, 3, 3, 1, 1, 1, 1, 0, 1],
    [3, 1, 0, 1, 1, 3, 0, 0, 0, 0, 3, 2, 1, 1, 0, 1, 0, 1],
    [2, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0],
    [2, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [2, 0, 0, 1, 1, 3, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 0, 1],
    [0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0],
    [2, 0, 0, 0, 0, 3, 0, 0, 0, 0, 3, 1, 1, 1, 0, 1, 0, 1],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0],
  ];

  // Table 6: [task, study ref, performance, efficiency] vs full fine-tuning; + better, = similar, - worse
  const T6 = [
    ['Base LoRA', [['APR', 51, '+', '+'], ['CG', 147, '+', '+'], ['CG', 30, '+', '-'], ['CG', 42, '+'], ['CG', 166, '+'], ['CG', 144, '='],
      ['CComp', 144, '-'], ['CRF', 42, '+'], ['CSum', 14, '+'], ['CTrans', 144, '='], ['PBT', 144, '-']],
      [['CCD', 14, '-'], ['CR', 168, '+'], ['DD', 85, '+'], ['HFP', 144, '-']]],
    ['QLoRA', [['CComp', 79, '+', '+'], ['CG', 79, '+', '+'], ['CSum', 3, '+', '+']], []],
    ['AdaLoRA', [], []],
    ['FF-LoRA', [], []],
    ['Base Adapter', [['CMG', 85, '=', '+'], ['CSum', 148, '+'], ['CTrans', 19, '-']], [['CCD', 19, '-'], ['CCD', 83, '+'], ['CS', 148, '+']]],
    ['L-Adapter', [], [['CT', 119, '+', '+']]],
    ['T-Adapter', [['CSum', 119, '+', '+']], []],
    ['Prompt Tuning', [['CSum', 146, '+'], ['CSum', 145, '+'], ['CTrans', 146, '+'], ['CTrans', 145, '+']], [['CS', 146, '+'], ['DD', 146, '+'], ['DD', 145, '+']]],
    ['Prefix Tuning', [], []],
    ['P-Tuning', [], []],
    ['Pass-Tuning', [['CG', 19, '-'], ['CRF', 19, '+'], ['CSum', 19, '+']], []],
    ['(IA)³', [['APR', 67, '+', '+']], []],
    ['BitFit', [], []],
    ['FF-LoRA + AT', [['CTrans', 14, '-']], [['CCD', 14, '-']]],
    ['L-Adapter + T-Adapter', [], [['CCD', 119, '+', '+']]],
    ['L-Adapter + NER-Adapter + AdapterFusion', [['CSum', 120, '+', '+'], ['CRF', 120, '+', '+']], []],
    ['Telly-K', [['CComp', 123, '+', '+'], ['CG', 123, '+', '+'], ['CSum', 123, '+', '+']], [['CCD', 123, '=', '+'], ['CS', 123, '+', '+']]],
    ['MAM', [['CSum', 83, '-'], ['CTrans', 83, '-']], [['DD', 83, '=']]],
  ];

  function taskChart() {
    const order = TASKS.slice().sort((a, b) => b[2] - a[2] || b[4] - a[4]);
    V.mount(document.getElementById('fig-tasks'), {
      spec: () => ({
        rows: order.map((t) => ({ label: t[1], value: t[4], color: t[2] ? GEN : NON, note: t[3], full: `${t[1]} (${t[0]})` })),
        max: 14,
        labelWidth: 200,
        rowHeight: 22,
        format: (v) => String(v),
        unit: 'studies',
        legend: [{ name: 'Generative', color: GEN, shape: 'bar' }, { name: 'Non-generative', color: NON, shape: 'bar' }],
        table: {
          head: ['Task', 'Type', 'Description', 'Studies'],
          rows: order.map((t) => [`${t[1]} (${t[0]})`, t[2] ? 'Generative' : 'Non-generative', t[3], String(t[4])]),
        },
        label: 'Number of studies per software engineering task',
      }),
      draw: V.rows,
      minHeight: 420,
    });
  }

  function venueChart() {
    V.mount(document.getElementById('fig-venues'), {
      spec: () => ({
        rows: VENUES.map(([n, c]) => ({ label: n, value: c })),
        color: GEN,
        max: 4.5,
        labelWidth: 70,
        rowHeight: 20,
        format: (v) => String(v),
        unit: 'papers',
        table: { head: ['Venue', 'Papers'], rows: VENUES.map(([n, c]) => [n, String(c)]) },
        label: 'Papers per venue',
      }),
      draw: V.rows,
      minHeight: 350,
    });
  }

  function trendChart() {
    const list = (obj) => Object.entries(obj).map(([k, v]) => `${TASK[k]} ${v}`).join(' · ');
    const sum = (obj) => Object.values(obj).reduce((a, b) => a + b, 0);
    V.mount(document.getElementById('fig-years'), {
      spec: () => ({
        categories: YEARS.map(([y, g, n]) => ({
          label: y,
          sub: y === '2025' ? 'to February' : '',
          segments: [
            { name: 'Generative', value: sum(g), color: GEN, note: list(g) },
            { name: 'Non-generative', value: sum(n), color: NON, note: list(n) },
          ],
        })),
        max: 30,
        unit: 'task instances',
        legend: [{ name: 'Generative', color: GEN, shape: 'bar' }, { name: 'Non-generative', color: NON, shape: 'bar' }],
        table: {
          head: ['Year', 'Generative', 'Non-generative', 'Tasks'],
          rows: YEARS.map(([y, g, n]) => [y, String(sum(g)), String(sum(n)), list(Object.assign({}, g, n))]),
        },
        label: 'Task instances per year',
      }),
      draw: V.stacks,
      minHeight: 280,
    });
  }

  function heatChart() {
    V.mount(document.getElementById('fig-heatmap'), {
      wide: true,
      spec: () => ({
        rows: HEAT_ROWS.map((k) => TASK[k]),
        cols: METHODS,
        colLabels: METHODS.map((m) => m.replace('NER-Adapter + AdapterFusion', 'NER + Fusion')),
        values: HEAT,
        unit: 'studies',
        labelWidth: 200,
        headHeight: 150,
        table: {
          head: ['Task'].concat(METHODS),
          rows: HEAT_ROWS.map((k, i) => [TASK[k]].concat(HEAT[i].map(String))),
        },
        label: 'Number of studies using each PEFT method for each task',
      }),
      draw: V.heatmap,
      minHeight: 700,
    });
  }

  /* Table 6 as a grid of results */

  const PERF = { '+': ['better', 'fa-arrow-up', '#0ca30c'], '=': ['similar', 'fa-equals', '#898781'], '-': ['worse', 'fa-arrow-down', '#d03b3b'] };

  function chip(cell, e) {
    const [task, ref, perf, eff] = e;
    const [word, icon, color] = PERF[perf];
    const c = V.html('span', 'pv-chip', cell);
    c.dataset.perf = perf;
    const i = V.html('i', 'fas ' + icon, c);
    i.style.color = color;
    i.setAttribute('aria-hidden', 'true');
    c.appendChild(document.createTextNode(task));
    if (eff) {
      const ef = V.html('span', 'pv-eff', c, eff === '+' ? 'E↑' : 'E↓');
      ef.style.color = PERF[eff][2];
    }
    V.bindTip(c, () => ({
      title: `${TASK[task]} · study [${ref}]`,
      rows: [
        { label: 'performance vs full fine-tuning', value: word, color },
        { label: 'efficiency', value: eff ? PERF[eff][0] : 'not reported', color: eff ? PERF[eff][2] : '' },
      ],
    }));
  }

  function resultsFigure(fig) {
    const count = (col, p) => T6.reduce((n, r) => n + r[col].filter((e) => e[2] === p).length, 0);
    const total = (col) => T6.reduce((n, r) => n + r[col].length, 0);
    const bar = V.html('div', 'pv-bar');
    const wrap = V.html('div', 'pv-table-wrap');
    const t = V.html('table', 'pv-matrix', wrap);
    const head = V.html('tr', '', V.html('thead', '', t));
    V.html('th', '', head, 'Method');
    [[1, 'Generative'], [2, 'Non-generative']].forEach(([col, name]) => {
      V.html('th', '', head, `${name}: ${total(col)} entries (${count(col, '+')} better, ${count(col, '=')} similar, ${count(col, '-')} worse)`);
    });
    const body = V.html('tbody', '', t);
    const empty = [];
    T6.forEach(([method, gen, non]) => {
      if (!gen.length && !non.length) { empty.push(method); return; }
      const tr = V.html('tr', '', body);
      V.html('td', '', tr, method);
      [gen, non].forEach((list) => {
        const td = V.html('td', '', tr);
        if (!list.length) { V.html('span', 'pv-none', td, '—'); return; }
        const box = V.html('div', 'pv-chips', td);
        list.forEach((e) => chip(box, e));
      });
    });
    const tr = V.html('tr', '', body);
    V.html('td', '', tr, 'No head-to-head result');
    const td = V.html('td', 'pv-none', tr, empty.join(', '));
    td.colSpan = 2;
    V.segmented(bar, ['All', 'Better', 'Similar', 'Worse'], 'All', (v) => {
      const want = { Better: '+', Similar: '=', Worse: '-' }[v];
      fig.querySelectorAll('.pv-chip').forEach((c) => c.classList.toggle('is-dim', !!want && c.dataset.perf !== want));
    }, 'Show results');
    const cap = fig.querySelector('figcaption');
    fig.insertBefore(bar, cap);
    fig.insertBefore(wrap, cap);
    if (V.REDUCED) return;
    const chips = Array.from(fig.querySelectorAll('.pv-chip'));
    chips.forEach((c) => { c.style.opacity = 0; c.style.transform = 'translateY(6px)'; });
    V.onVisible(fig, () => chips.forEach((c, i) => V.later(() => { c.style.opacity = ''; c.style.transform = ''; }, i * 25)));
  }

  /* the four PEFT families */

  const FAMILIES = {
    Additive: {
      note: 'New trainable parts are added and the original weights stay frozen: adapter layers inside each block, or soft-prompt vectors in front of the input. Methods in the review: Base Adapter, L-Adapter, T-Adapter, Prompt Tuning, Prefix Tuning, P-Tuning, Pass-Tuning, (IA)³.',
      adapters: true, prompts: true,
    },
    Selective: {
      note: 'No new parts: a subset of the existing weights is trained and the rest stay frozen, for example only the bias terms (BitFit) or only the top layers (Telly-K).',
      select: true,
    },
    Reparameterized: {
      note: 'The weight update is learned as two small low-rank matrices next to a frozen weight: h = W₀x + α·W_up·W_down·x. Methods in the review: Base LoRA, QLoRA, AdaLoRA, FF-LoRA.',
      lora: true,
    },
    Hybrid: {
      note: 'Several techniques combined in one set-up. Methods in the review: MAM, L-Adapter + T-Adapter, FF-LoRA + AT (adapter tuning), and L-Adapter + NER-Adapter + AdapterFusion.',
      adapters: true, prompts: true, lora: true,
    },
  };

  function block(s, x, y, w, name, lit) {
    V.svg('rect', { x, y, width: w, height: 40, rx: 4, fill: '#1f1f1f', stroke: '#3a3a3a' }, s);
    V.label(s, x + 8, y + 13, name, 'pv-cat-sub', 'start');
    for (let c = 0; c < 8; c++) {
      const on = lit && lit(c);
      const cell = V.svg('rect', { x: x + 8 + c * 13, y: y + 20, width: 9, height: 12, rx: 1.5, fill: on ? TRAINED : '#363636' }, s);
      if (on && !V.REDUCED) { cell.style.opacity = 0.2; cell.classList.add('pv-fade'); V.later(() => { cell.style.opacity = 1; }, c * 40); }
    }
  }

  function grow(node, delay) {
    node.style.transformBox = 'fill-box';
    node.style.transformOrigin = 'center';
    V.place(node, 'scale(0.3)', 'scale(1)', true, delay);
  }

  function drawFamily(plot, name) {
    const f = FAMILIES[name];
    plot.textContent = '';
    const s = V.svg('svg', { viewBox: '0 0 640 270', role: 'img', 'aria-label': name + ' PEFT: ' + f.note }, plot);
    [0, 1, 2].forEach((layer) => {
      const y = 20 + layer * 62;
      V.label(s, 92, y + 25, layer === 0 ? 'layer N' : layer === 1 ? '…' : 'layer 1', 'pv-cat-sub', 'end');
      const top = layer === 0;
      block(s, 110, y, 120, 'attention', f.select ? (c) => c === 7 || top : null);
      block(s, 300, y, 120, 'feed-forward', f.select ? (c) => c === 7 || top : null);
      V.svg('line', { x1: 230, x2: 300, y1: y + 20, y2: y + 20, stroke: '#3a3a3a', 'stroke-width': 2 }, s);
      if (f.lora) {
        const a = V.svg('rect', { x: 150, y: y - 12, width: 40, height: 7, rx: 2, fill: TRAINED }, s);
        const b = V.svg('rect', { x: 196, y: y - 12, width: 7, height: 7, rx: 2, fill: TRAINED }, s);
        grow(a, layer * 90);
        grow(b, layer * 90 + 60);
      }
      if (f.adapters) {
        V.svg('line', { x1: 420, x2: 446, y1: y + 20, y2: y + 20, stroke: TRAINED, 'stroke-width': 2 }, s);
        const ad = V.svg('rect', { x: 446, y: y + 6, width: 52, height: 28, rx: 4, fill: TRAINED }, s);
        V.label(s, 472, y + 24, 'adapter', 'pv-cat-sub').style.fill = '#ffffff';
        grow(ad, layer * 90);
      }
    });
    if (f.lora) V.label(s, 210, 12, 'low-rank update', 'pv-cat-sub', 'start');
    const ty = 222;
    V.label(s, 92, ty + 13, 'input', 'pv-cat-sub', 'end');
    let x = 110;
    if (f.prompts) {
      for (let i = 0; i < 3; i++, x += 26) grow(V.svg('rect', { x, y: ty, width: 20, height: 20, rx: 3, fill: TRAINED }, s), i * 70);
      V.label(s, 110, ty + 38, 'soft prompt', 'pv-cat-sub', 'start');
    }
    for (let i = 0; i < 7; i++, x += 26) V.svg('rect', { x, y: ty, width: 20, height: 20, rx: 3, fill: '#363636' }, s);
  }

  function familyFigure(fig) {
    V.cycler(fig, Object.keys(FAMILIES), (plot, note, name) => {
      drawFamily(plot, name);
      note.textContent = FAMILIES[name].note;
    }, 'PEFT family', [{ name: 'frozen', color: '#363636', shape: 'bar' }, { name: 'trained', color: TRAINED, shape: 'bar' }]);
  }

  document.addEventListener('DOMContentLoaded', () => {
    familyFigure(document.getElementById('fig-families'));
    venueChart();
    taskChart();
    trendChart();
    heatChart();
    resultsFigure(document.getElementById('fig-results'));
    V.counters(document);
  });
})();
