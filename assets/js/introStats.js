(function () {
  const statEls = Array.from(document.querySelectorAll('.intro-stat'));
  const reasonEls = Array.from(document.querySelectorAll('.reason-fact'));
  if ((!statEls.length && !reasonEls.length) || typeof d3 === 'undefined') return;

  const valueFormatters = {
    'afd-growth': (value) => Math.round(value).toLocaleString('de-DE'),
    'age-gap': (value) => value.toLocaleString('de-DE', { minimumFractionDigits: 1, maximumFractionDigits: 1 }),
    projection: (value) => value.toLocaleString('de-DE', { minimumFractionDigits: 1, maximumFractionDigits: 1 }),
  };

  function parseHistoricPercent(value) {
    if (value === undefined || value === null || value === '') return null;
    return Number(String(value).replace(',', '.')) / 10;
  }

  function parsePercent(value) {
    if (value === undefined || value === null || value === '') return null;
    return Number(String(value).replace(',', '.'));
  }

  function projectAfD2033(rows) {
    const historicalYears = [2013, 2017, 2021, 2025];
    const values = historicalYears
      .map((year) => {
        const row = rows.find((entry) => Number(entry.Jahr) === year);
        return { year, value: row ? parseHistoricPercent(row.AfD) : null };
      })
      .filter((entry) => Number.isFinite(entry.value));

    const meanYear = d3.mean(values, (entry) => entry.year);
    const meanValue = d3.mean(values, (entry) => entry.value);
    const numerator = d3.sum(values, (entry) => (entry.year - meanYear) * (entry.value - meanValue));
    const denominator = d3.sum(values, (entry) => Math.pow(entry.year - meanYear, 2)) || 1;
    const slope = numerator / denominator;
    const latest = values.find((entry) => entry.year === 2025);

    return Math.min(45, Math.max(0, latest.value + slope * (2033 - 2025)));
  }

  function calculateStats(historicalRows, ageRows) {
    const afd2013 = parseHistoricPercent(historicalRows.find((row) => Number(row.Jahr) === 2013)?.AfD);
    const afd2025 = parseHistoricPercent(historicalRows.find((row) => Number(row.Jahr) === 2025)?.AfD);
    const young2025 = ageRows.find((row) => row.Jahr === '2025' && row.Alter === '18 bis 24');
    const old2025 = ageRows.find((row) => row.Jahr === '2025' && row.Alter === '70 und mehr');
    const youngLinke = parsePercent(young2025?.DIELINKE_Zweitstimmen_Pct);
    const oldLinke = parsePercent(old2025?.DIELINKE_Zweitstimmen_Pct);

    return {
      'afd-growth': ((afd2025 - afd2013) / afd2013) * 100,
      'age-gap': youngLinke - oldLinke,
      projection: projectAfD2033(historicalRows),
    };
  }

  function animateStat(el, target) {
    const valueEl = el.querySelector('.stat-value');
    const formatter = valueFormatters[el.dataset.stat] || valueFormatters.projection;
    const duration = 1200;
    const start = performance.now();

    function frame(now) {
      const progress = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      valueEl.textContent = formatter(target * eased);

      if (progress < 1) {
        requestAnimationFrame(frame);
      } else {
        valueEl.textContent = formatter(target);
      }
    }

    requestAnimationFrame(frame);
  }

  function animateReasonStat(el) {
    const valueEl = el.querySelector('.reason-value');
    if (!valueEl) return;

    const target = Number(el.dataset.targetValue);
    if (!Number.isFinite(target)) return;

    const formatter = (value) => value.toLocaleString('de-DE', {
      minimumFractionDigits: 1,
      maximumFractionDigits: 1
    });
    const duration = 1200;
    const start = performance.now();

    function frame(now) {
      const progress = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      valueEl.textContent = formatter(target * eased);

      if (progress < 1) {
        requestAnimationFrame(frame);
      } else {
        valueEl.textContent = formatter(target);
      }
    }

    valueEl.textContent = formatter(0);
    requestAnimationFrame(frame);
  }

  function revealReasonStats() {
    if (!reasonEls.length) return;

    reasonEls.forEach((el) => {
      const valueEl = el.querySelector('.reason-value');
      const target = Number(valueEl?.textContent.trim().replace(',', '.'));
      if (Number.isFinite(target)) {
        el.dataset.targetValue = String(target);
      }
    });

    const startAnimations = (entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;

        const el = entry.target;
        if (el.dataset.animated === 'true') return;

        el.dataset.animated = 'true';
        animateReasonStat(el);
        observer.unobserve(el);
      });
    };

    const observer = new IntersectionObserver(startAnimations, {
      rootMargin: '0px 0px 180px 0px',
      threshold: 0.15
    });
    reasonEls.forEach((el) => observer.observe(el));
  }

  function revealStats(stats) {
    const startAnimations = (entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        if (el.dataset.animated === 'true') return;

        el.dataset.animated = 'true';
        el.classList.add('is-visible');
        animateStat(el, stats[el.dataset.stat] || 0);
        observer.unobserve(el);
      });
    };

    const observer = new IntersectionObserver(startAnimations, { threshold: 0.35 });
    statEls.forEach((el) => observer.observe(el));
  }

  Promise.all([
    d3.dsv(';', 'rawData/BTW_1919-2025.csv'),
    d3.csv('rawData/btw_alter.csv'),
  ])
    .then(([historicalRows, ageRows]) => revealStats(calculateStats(historicalRows, ageRows)))
    .catch(() => {
      statEls.forEach((el) => {
        const valueEl = el.querySelector('.stat-value');
        valueEl.textContent = '0';
      });
    });

  revealReasonStats();
})();
