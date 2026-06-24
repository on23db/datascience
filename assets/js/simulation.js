console.log('simulation.js loaded');
(function () {
  const root = document.getElementById('simulationChart');
  if (!root || typeof d3 === 'undefined') return;

  const partyConfig = [
    { key: 'CDU/CSU', label: 'CDU/CSU', color: 'var(--color-cdu)' },
    { key: 'SPD', label: 'SPD', color: 'var(--color-spd)' },
    { key: 'Gr\u00fcne', fallbackKey: 'Gr\u00c3\u00bcne', label: 'Gr\u00fcne', color: 'var(--color-gruene)' },
    { key: 'FDP', label: 'FDP', color: 'var(--color-fdp)' },
    { key: 'Linke', label: 'Linke', color: 'var(--color-linke)' },
    { key: 'AfD', label: 'AfD', color: 'var(--color-afd)' },
    { key: 'BSW', label: 'BSW', color: 'var(--color-bsw)' },
    { key: 'Sonstige', label: 'Sonstige', color: 'var(--color-partei)' },
  ];
  const historicalYears = [2009, 2013, 2017, 2021, 2025];
  const projectionYears = [2029, 2033];
  const allYears = [...historicalYears, ...projectionYears];

  const controls = {
    age: document.getElementById('simAge'),
    gender: document.getElementById('simGender'),
    older: document.getElementById('simOlder'),
    youth: document.getElementById('simYouth'),
  };
  const outputs = {
    age: document.getElementById('simAgeValue'),
    gender: document.getElementById('simGenderValue'),
    older: document.getElementById('simOlderValue'),
    youth: document.getElementById('simYouthValue'),
  };
  const resultEls = {
    strongest: document.getElementById('simStrongest'),
    strongestDetail: document.getElementById('simStrongestDetail'),
    winner: document.getElementById('simWinner'),
    winnerDetail: document.getElementById('simWinnerDetail'),
    rightMajority: document.getElementById('simRightMajority'),
    rightMajorityDetail: document.getElementById('simRightMajorityDetail'),
    lead: document.getElementById('simLead'),
    leadDetail: document.getElementById('simLeadDetail'),
    topThree: document.getElementById('simTopThree'),
    topThreeDetail: document.getElementById('simTopThreeDetail'),
    effect: document.getElementById('simEffect'),
    effectDetail: document.getElementById('simEffectDetail'),
  };

  let historical = {};
  let baseProjection = {};
  let resizeTimer = null;

  function parseValue(value) {
    if (value === undefined || value === null || value === '') return 0;
    return Number(String(value).replace(',', '.')) / 10;
  }

  function normalizeValues(values) {
    const total = values.reduce((sum, value) => sum + Math.max(0, value), 0);
    if (!total) return values;
    return values.map(value => Math.round((Math.max(0, value) / total) * 1000) / 10);
  }

  function getPartyValue(row, party) {
    return parseValue(row[party.key] ?? row[party.fallbackKey]);
  }

  function buildHistorical(rows) {
    const byYear = new Map(rows.map(row => [Number(row.Jahr), row]));
    return Object.fromEntries(historicalYears.map(year => {
      const row = byYear.get(year);
      return [year, partyConfig.map(party => row ? getPartyValue(row, party) : 0)];
    }));
  }

  function projectParty(values, partyIndex, targetYear) {
    const usable = historicalYears
      .map(year => ({ year, value: values[year][partyIndex] }))
      .filter(point => Number.isFinite(point.value));
    const recent = usable.slice(-4);
    const meanYear = d3.mean(recent, point => point.year);
    const meanValue = d3.mean(recent, point => point.value);
    const numerator = d3.sum(recent, point => (point.year - meanYear) * (point.value - meanValue));
    const denominator = d3.sum(recent, point => Math.pow(point.year - meanYear, 2)) || 1;
    const slope = numerator / denominator;
    const projected = values[2025][partyIndex] + slope * (targetYear - 2025);
    return Math.min(45, Math.max(0, projected));
  }

  function buildProjection(values) {
    return Object.fromEntries(projectionYears.map(year => {
      const projected = partyConfig.map((_, index) => projectParty(values, index, year));
      return [year, normalizeValues(projected)];
    }));
  }

  function applyGender(values, percent) {
    const v = [...values];
    const shift = (percent / 100) * 3.6;
    v[5] -= shift;
    v[2] += shift * 0.45;
    v[1] += shift * 0.28;
    v[4] += shift * 0.12;
    return normalizeValues(v);
  }

  function applyOlder(values, percent) {
    const v = [...values];
    const shift = (percent / 100) * 4.8;
    v[0] -= shift * 0.28;
    v[5] -= shift * 0.62;
    v[2] += shift * 0.46;
    v[1] += shift * 0.26;
    v[4] += shift * 0.14;
    return normalizeValues(v);
  }

  function applyAge(values, age) {
    const v = [...values];
    if (age < 18) {
      const shift = (18 - age) * 0.75;
      v[0] -= shift * 0.5;
      v[2] += shift * 0.4;
      v[4] += shift * 0.22;
      v[5] += shift * 0.18;
    }
    if (age > 18) {
      const shift = (age - 18) * 0.55;
      v[0] += shift * 0.36;
      v[2] -= shift * 0.28;
      v[4] -= shift * 0.16;
      v[5] -= shift * 0.12;
    }
    return normalizeValues(v);
  }

  function applyYouth(values, delta) {
    const v = [...values];
    const shift = (delta / 100) * 3.2;
    v[0] -= shift * 0.5;
    v[1] += shift * 0.2;
    v[2] += shift * 0.42;
    v[4] += shift * 0.18;
    v[5] -= shift * 0.22;
    return normalizeValues(v);
  }

  function getScenario() {
    const state = {
      age: Number(controls.age.value),
      gender: Number(controls.gender.value),
      older: Number(controls.older.value),
      youth: Number(controls.youth.value),
    };
    const simulated = {};
    projectionYears.forEach(year => {
      let values = [...baseProjection[year]];
      values = applyAge(values, state.age);
      values = applyGender(values, state.gender);
      values = applyOlder(values, state.older);
      values = applyYouth(values, state.youth);
      simulated[year] = values;
    });
    return simulated;
  }

  function pathDataFor(partyIndex, scenario) {
    return allYears.map(year => ({
      year,
      value: year <= 2025 ? historical[year][partyIndex] : scenario[year][partyIndex],
    }));
  }

  function updateOutputs() {
    outputs.age.textContent = controls.age.value;
    outputs.gender.textContent = `${controls.gender.value}%`;
    outputs.older.textContent = `${controls.older.value}%`;
    const youth = Number(controls.youth.value);
    outputs.youth.textContent = `${youth >= 0 ? '+' : ''}${youth}%`;
  }

  function updateResults(scenario) {
    const values2033 = scenario[2033];
    const ranked = values2033
      .map((value, index) => ({ value, index, label: partyConfig[index].label }))
      .sort((a, b) => d3.descending(a.value, b.value));
    const maxValue = ranked[0].value;
    const strongestIndex = ranked[0].index;
    const strongestDiff = maxValue - historical[2025][strongestIndex];
    resultEls.strongest.textContent = partyConfig[strongestIndex].label;
    resultEls.strongestDetail.textContent = `${maxValue.toFixed(1)}%, ${strongestDiff >= 0 ? '+' : ''}${strongestDiff.toFixed(1)} Pkt. zu 2025`;

    const gains = values2033.map((value, index) => value - historical[2025][index]);
    const maxGain = d3.max(gains);
    const winnerIndex = gains.indexOf(maxGain);
    resultEls.winner.textContent = partyConfig[winnerIndex].label;
    resultEls.winnerDetail.textContent = `${maxGain >= 0 ? '+' : ''}${maxGain.toFixed(1)} Punkte`;

    const partyIndexByKey = Object.fromEntries(partyConfig.map((party, index) => [party.key, index]));
    const rightMajorityKeys = ['CDU/CSU', 'FDP', 'AfD'];
    const rightMajorityValue = rightMajorityKeys.reduce((sum, key) => sum + (values2033[partyIndexByKey[key]] ?? 0), 0);
    if (resultEls.rightMajority && resultEls.rightMajorityDetail) {
      resultEls.rightMajority.textContent = `${rightMajorityValue.toFixed(1)}%`;
      resultEls.rightMajorityDetail.textContent = 'CDU/CSU + FDP + AfD';
    }

    const lead = ranked[0].value - ranked[1].value;
    if (resultEls.lead && resultEls.leadDetail) {
      resultEls.lead.textContent = `${lead.toFixed(1)} Pkt.`;
      resultEls.leadDetail.textContent = `${ranked[0].label} vor ${ranked[1].label}`;
    }

    const topThreeValue = ranked.slice(0, 3).reduce((sum, entry) => sum + entry.value, 0);
    resultEls.topThree.textContent = `${topThreeValue.toFixed(1)}%`;
    resultEls.topThreeDetail.textContent = ranked.slice(0, 3).map(entry => entry.label).join(' + ');

    const base2033 = baseProjection[2033] ?? values2033;
    const scenarioEffect = values2033.reduce((sum, value, index) => sum + Math.abs(value - base2033[index]), 0) / 2;
    resultEls.effect.textContent = `${scenarioEffect.toFixed(1)} Pkt.`;
    resultEls.effectDetail.textContent = 'Abweichung vom Basisszenario';
  }

  function drawLegend() {
    const legend = d3.select('#simulationLegend');
    legend.selectAll('*').remove();
    partyConfig.forEach(party => {
      const item = legend.append('span').attr('class', 'simulation-legend-item');
      item.append('i')
        .attr('class', 'simulation-legend-dot')
        .style('background', party.color);
      item.append('span').text(party.label);
    });
  }

  function drawChart() {
    const scenario = getScenario();
    updateOutputs();
    updateResults(scenario);

    const bounds = root.getBoundingClientRect();
    const width = Math.max(680, bounds.width);
    const height = 430;
    const margin = { top: 22, right: 24, bottom: 42, left: 52 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;
    const maxY = Math.max(35, d3.max(partyConfig.flatMap((_, index) => pathDataFor(index, scenario).map(d => d.value))) + 4);

    const x = d3.scaleLinear().domain([2009, 2033]).range([0, innerWidth]);
    const y = d3.scaleLinear().domain([0, Math.ceil(maxY / 5) * 5]).nice().range([innerHeight, 0]);
    const line = d3.line()
      .x(d => x(d.year))
      .y(d => y(d.value))
      .curve(d3.curveMonotoneX);

    d3.select(root).selectAll('*').remove();
    const svg = d3.select(root)
      .append('svg')
      .attr('viewBox', `0 0 ${width} ${height}`)
      .attr('height', height);
    const plot = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

    plot.append('g')
      .attr('class', 'simulation-grid')
      .call(d3.axisLeft(y).ticks(6).tickSize(-innerWidth).tickFormat(''));
    plot.append('g')
      .attr('class', 'simulation-axis')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(d3.axisBottom(x).tickValues(allYears).tickFormat(d3.format('d')));
    plot.append('g')
      .attr('class', 'simulation-axis')
      .call(d3.axisLeft(y).ticks(6).tickFormat(d => `${d}%`));

    plot.append('line')
      .attr('class', 'simulation-cutoff')
      .attr('x1', x(2025))
      .attr('x2', x(2025))
      .attr('y1', 0)
      .attr('y2', innerHeight);
    plot.append('text')
      .attr('class', 'simulation-cutoff-label')
      .attr('x', x(2025) + 6)
      .attr('y', 12)
      .text('2025');

    const tooltip = d3.select('body').selectAll('.simulation-tooltip')
      .data([null])
      .join('div')
      .attr('class', 'simulation-tooltip')
      .style('opacity', 0);

    partyConfig.forEach((party, index) => {
      const data = pathDataFor(index, scenario);
      const historicalPart = data.filter(d => d.year <= 2025);
      const projectionPart = data.filter(d => d.year >= 2025);

      plot.append('path')
        .datum(historicalPart)
        .attr('class', 'simulation-line')
        .attr('d', line)
        .attr('stroke', party.color)
        .attr('stroke-width', 2.3);

      plot.append('path')
        .datum(projectionPart)
        .attr('class', 'simulation-line')
        .attr('d', line)
        .attr('stroke', party.color)
        .attr('stroke-width', 2.1)
        .attr('stroke-dasharray', '6 6');

      plot.selectAll(`.simulation-point-${index}`)
        .data(data)
        .join('circle')
        .attr('class', `simulation-point simulation-point-${index}`)
        .attr('cx', d => x(d.year))
        .attr('cy', d => y(d.value))
        .attr('r', d => d.year >= 2029 ? 4.5 : 3.5)
        .attr('fill', party.color)
        .on('mousemove', (event, d) => {
          tooltip
            .style('opacity', 1)
            .style('--tooltip-color', party.color)
            .style('left', `${event.clientX + 14}px`)
            .style('top', `${event.clientY + 14}px`)
            .html(`<strong>${party.label}</strong><span>${d.year}: ${d.value.toFixed(1)}%</span>`);
        })
        .on('mouseleave', () => tooltip.style('opacity', 0));
    });
  }

  function attachControls() {
    Object.values(controls).forEach(control => {
      control.addEventListener('input', drawChart);
    });
    document.getElementById('simulationReset').addEventListener('click', () => {
      controls.age.value = 18;
      controls.gender.value = 0;
      controls.older.value = 0;
      controls.youth.value = 0;
      drawChart();
    });
    window.addEventListener('resize', () => {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(drawChart, 120);
    });
  }

  d3.dsv(';', 'rawData/BTW_1919-2025.csv').then(rows => {
    historical = buildHistorical(rows);
    baseProjection = buildProjection(historical);
    drawLegend();
    attachControls();
    drawChart();
  }).catch(() => {
    root.innerHTML = '<p class="simulation-error">Die Simulationsdaten konnten nicht geladen werden.</p>';
  });
}());
