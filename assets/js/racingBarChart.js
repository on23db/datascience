console.log('racingBarChart.js loaded');
(function () {
  const container = d3.select("#racingBarChart");
  if (container.empty()) return;

  const partyColorTokens = {
    "CDU/CSU": "--color-cdu",
    CDU: "--color-cdu",
    CSU: "--color-csu",
    SPD: "--color-spd",
    AfD: "--color-afd",
    FDP: "--color-fdp",
    "Gr\u00fcne": "--color-gruene",
    "GR\u00dcNE": "--color-gruene",
    Linke: "--color-linke",
    "DIE LINKE": "--color-linke",
    KPD: "--color-linke",
    USPD: "--color-spd",
    NSDAP: "--color-nsdap",
    Sonstige: "--color-partei",
    BSW: "--color-bsw"
  };

  const fallbackColors = d3.schemeTableau10;
  const formatPercent = new Intl.NumberFormat("de-DE", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1
  });
  const formatTurnout = new Intl.NumberFormat("de-DE", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1
  });
  const eventIcon = {
    Wahl: "bi-check2-square",
    Politik: "bi-bank",
    Wirtschaft: "bi-graph-down-arrow",
    Gesellschaft: "bi-people"
  };

  let activeYear = 1919;
  let isPlaying = false;
  let timer = null;
  let selectedEvent = null;
  let popoverHideTimer = null;
  let width = 960;
  let timelineWidth = 960;
  let electionYears = [];

  const normalizeText = (value) => String(value ?? "")
    .replaceAll("Ã¤", "\u00e4")
    .replaceAll("Ã¶", "\u00f6")
    .replaceAll("Ã¼", "\u00fc")
    .replaceAll("Ã„", "\u00c4")
    .replaceAll("Ã–", "\u00d6")
    .replaceAll("Ãœ", "\u00dc")
    .replaceAll("ÃŸ", "\u00df")
    .replaceAll("â€”", "\u2014")
    .replaceAll("â€“", "\u2013")
    .replaceAll("â†—", "\u2197");

  const parseYear = (value) => {
    const text = String(value ?? "").trim();
    const numeric = Number.parseInt(text, 10);
    if (text.endsWith("a")) return numeric + 0.2;
    if (text.endsWith("b")) return numeric + 0.8;
    return numeric;
  };

  const displayYear = (value) => {
    const text = String(value ?? "").trim();
    if (text.endsWith("a")) return `${Number.parseInt(text, 10)} I`;
    if (text.endsWith("b")) return `${Number.parseInt(text, 10)} II`;
    return text;
  };

  const toPercent = (value) => {
    if (value === null || value === undefined || value === "") return 0;
    return Number(String(value).replace(",", ".")) / 10;
  };

  container.html(
`   
<div class="cell c-12 racing-timeline-cell">
<div class="racing-shell">
  <div class="racing-timeline-wrap">
    <svg class="racing-timeline" role="img" aria-label="Zeitachse mit historischen Ereignissen und Wahljahren"></svg>
    <input id="racingScrubber" type="range" min="1919" max="2025" step="0.1" value="1919" aria-label="Wahljahr auswaehlen">
  </div>
    
  <div class="racing-controls" aria-label="Animation steuern">
    <button type="button" class="racing-icon-button" id="racingPrevious" title="Vorherige Wahl" aria-label="Vorherige Wahl">
    <i class="bi bi-skip-backward-fill"></i><span>Vorherige Wahl</span>
    </button>
    <button type="button" class="racing-icon-button" id="racingNext" title="Nächste Wahl" aria-label="Nächste Wahl">
    <i class="bi bi-skip-forward-fill"></i><span>Nächste Wahl</span>
    </button>
    <button type="button" class="racing-icon-button" id="racingPlay" title="Animation starten" aria-label="Animation starten">
    <i class="bi bi-play-fill"></i><span>Play</span>
    </button>
    <button type="button" class="racing-icon-button" id="racingPause" title="Animation pausieren" aria-label="Animation pausieren">
    <i class="bi bi-pause-fill"></i><span>Pause</span>
    </button>
    <button type="button" class="racing-icon-button" id="racingReset" title="Zum Anfang zuruecksetzen" aria-label="Zum Anfang zuruecksetzen">
    <i class="bi bi-stop-fill"></i><span>Reset</span>
    </button>
  </div>
</div>
</div>
<div id="racingContextInfo" class="cell c-12 racing-event-cell" hidden></div>
    
<div class="cell c-8 racing-chart-cell">
  <div class="racing-main-chart">
    <div class="racing-chart-header">
      <h3><i class="bi bi-bar-chart-line-fill"></i> Stimmenanteile</h3>
      <p>Stärkste Parteien im ausgewählten Wahljahr</p>
    </div>
    <div class="racing-chart" aria-label="Rangliste der Parteien nach Stimmenanteil"></div>
  </div>
</div>
<aside class="cell c-4 spectrum-chart" aria-label="Politisches Spektrum nach Stimmenanteilen">
    <div class="spectrum-header">
      <h3><i class="bi bi-columns-gap"></i> Spektrum</h3>
      <p id="spectrumCaption">Politische Einordnung</p>
    </div>
    <div class="spectrum-stack" id="spectrumStack"></div>
  </aside>`);

  const chart = container.select(".racing-chart");
  const timeline = container.select(".racing-timeline");
  const yearLabel = container.select(".racing-year");
  const electionLabel = container.select("#racingElectionLabel");
  const turnoutLabel = container.select("#racingTurnout");
  const contextInfo = container.select("#racingContextInfo");
  const spectrumStack = container.select("#spectrumStack");
  const spectrumCaption = container.select("#spectrumCaption");
  const scrubber = container.select("#racingScrubber");
  const playButton = container.select("#racingPlay");
  const previousButton = container.select("#racingPrevious");
  const nextButton = container.select("#racingNext");
  const pauseButton = container.select("#racingPause");
  const resetButton = container.select("#racingReset");

  Promise.all([
    d3.dsv(";", "rawData/BTW_1919-2025.csv"),
    d3.dsv(";", "rawData/ereignisse.csv"),
    d3.dsv(";", "rawData/partei_verteilung.csv")
  ]).then(([electionRows, eventRows, distributionRows]) => {
    const rows = electionRows
      .filter((row) => String(row.Geschlecht).toLowerCase() === "insgesamt")
      .map((row) => {
        const parties = Object.keys(row)
          .filter((key) => !["Jahr", "Geschlecht", "Wahlbeteiligung"].includes(key))
          .map((party) => ({
            party: normalizeText(party),
            value: toPercent(row[party])
          }))
          .filter((entry) => Number.isFinite(entry.value));

        return {
          rawYear: row.Jahr,
          year: parseYear(row.Jahr),
          label: displayYear(row.Jahr),
          turnout: toPercent(row.Wahlbeteiligung),
          parties
        };
      })
      .sort((a, b) => a.year - b.year);

    const allParties = [...new Set(rows.flatMap((row) => row.parties.map((entry) => entry.party)))];
    electionYears = rows.map((row) => row.year);
    const partySpectrum = new Map();
    distributionRows.forEach((row) => {
      const party = normalizeText(row.partei);
      const spectrum = normalizeText(row.spektrum);
      const value = Number(String(row.wert ?? "").replace(",", "."));
      if (!partySpectrum.has(party) && spectrum && spectrum !== "\u2014" && Number.isFinite(value)) {
        partySpectrum.set(party, { spectrum, value });
      }
    });
    const spectrumOrder = ["Linksextrem", "Links", "Links-Mitte", "Mitte", "Mitte-Rechts", "Rechts", "Rechtsextrem"];
    const spectrumColors = {
      Linksextrem: cssVar('--color-linksextrem'),
      Links: cssVar('--color-links'),
      "Links-Mitte": cssVar('--color-linksmitte'),
      Mitte: cssVar('--color-mitte'),
      "Mitte-Rechts": cssVar('--color-mitterechts'),
      Rechts: cssVar('--color-rechts'),
      Rechtsextrem: cssVar('--color-rechtsextrem')
    };

    const events = eventRows
      .map((row) => ({
        year: Number(row.jahr),
        jahr: normalizeText(row.jahr),
        ereignis: normalizeText(row.ereignis),
        kategorie: normalizeText(row.kategorie),
        erklaerung: normalizeText(row.erklaerung),
        link: row.link
      }))
      .filter((row) => Number.isFinite(row.year))
      .sort((a, b) => a.year - b.year);

    function getPartyValue(row, party) {
      return row?.parties.find((entry) => entry.party === party)?.value ?? 0;
    }

    function getState(year, limit = null) {
      const before = [...rows].reverse().find((row) => row.year <= year) ?? rows[0];
      const after = rows.find((row) => row.year >= year) ?? rows[rows.length - 1];
      const span = Math.max(after.year - before.year, 0.001);
      const t = before.year === after.year ? 0 : (year - before.year) / span;

      const state = allParties
        .map((party) => ({
          party,
          value: d3.interpolateNumber(getPartyValue(before, party), getPartyValue(after, party))(t)
        }))
        .filter((entry) => entry.value > 0.05)
        .sort((a, b) => d3.descending(a.value, b.value));

      return Number.isFinite(limit) ? state.slice(0, limit) : state;
    }

    function nearestElection(year) {
      return d3.least(rows, (row) => Math.abs(row.year - year));
    }

    function nearestElectionIndex(year) {
      const nearest = nearestElection(year);
      return Math.max(0, electionYears.indexOf(nearest.year));
    }

    function goToElectionOffset(offset) {
      pause();
      const nextIndex = Math.max(0, Math.min(electionYears.length - 1, nearestElectionIndex(activeYear) + offset));
      render(electionYears[nextIndex]);
    }

    function colorForParty(party) {
      const token = partyColorTokens[party];
      const cssColor = token ? cssVar(token).trim() : "";
      if (cssColor) return cssColor;
      return fallbackColors[Math.abs(allParties.indexOf(party)) % fallbackColors.length];
    }

    function renderBars(year) {
      width = Math.max(320, chart.node().clientWidth);
      const data = getState(year, 9);
      const rowHeight = width < 560 ? 42 : 50;
      const margin = { top: 8, right: width < 560 ? 50 : 76, bottom: 42, left: width < 560 ? 84 : 116 };
      const height = margin.top + margin.bottom + data.length * rowHeight;
      const x = d3.scaleLinear().domain([0, 100]).range([0, width - margin.left - margin.right]);
      const plotBottom = height - margin.bottom;
      const y = d3.scaleBand().domain(data.map((d) => d.party)).range([margin.top, plotBottom]).padding(0.28);

      const svg = chart.selectAll("svg").data([null]).join("svg")
        .attr("viewBox", `0 0 ${width} ${height}`)
        .attr("width", "100%")
        .attr("height", height);

      const gridTicks = [0, 25, 50, 75, 100];
      svg.selectAll(".racing-grid-line")
        .data(gridTicks)
        .join("line")
        .attr("class", "racing-grid-line")
        .attr("x1", (d) => margin.left + x(d))
        .attr("x2", (d) => margin.left + x(d))
        .attr("y1", margin.top)
        .attr("y2", plotBottom);

      svg.selectAll(".racing-percent-axis")
        .data([null])
        .join("g")
        .attr("class", "racing-percent-axis chart-axis")
        .attr("transform", `translate(${margin.left},${plotBottom})`)
        .call(
          d3.axisBottom(x)
            .tickValues(gridTicks)
            .tickSize(9)
            .tickFormat((d) => `${d}%`)
        );

      const groups = svg.selectAll(".racing-row")
        .data(data, (d) => d.party)
        .join(
          (enter) => {
            const group = enter.append("g")
              .attr("class", "racing-row")
              .attr("transform", (d) => `translate(${margin.left},${y(d.party)})`)
              .style("opacity", 0);
            group.append("text")
              .attr("class", "racing-party")
              .attr("x", -12)
              .attr("y", y.bandwidth() / 2)
              .attr("text-anchor", "end")
              .attr("dominant-baseline", "middle");
            group.append("rect")
              .attr("class", "racing-bar")
              .attr("height", y.bandwidth())
              .attr("width", 0);
            group.append("text")
              .attr("class", "racing-value")
              .attr("y", y.bandwidth() / 2)
              .attr("dominant-baseline", "middle");
            return group;
          },
          (update) => update,
          (exit) => exit.transition().duration(240).style("opacity", 0).remove()
        );

      groups.transition()
        .duration(isPlaying ? 360 : 260)
        .attr("transform", (d) => `translate(${margin.left},${y(d.party)})`)
        .style("opacity", 1);

      groups.select(".racing-party").text((d) => d.party);
      groups.select(".racing-bar")
        .attr("fill", (d) => colorForParty(d.party))
        .transition()
        .duration(isPlaying ? 360 : 260)
        .attr("width", (d) => x(d.value));
      groups.select(".racing-value")
        .transition()
        .duration(isPlaying ? 360 : 260)
        .attr("x", (d) => x(d.value) + 10)
        .tween("text", function (d) {
          const current = Number(this.dataset.value ?? 0);
          const interpolator = d3.interpolateNumber(current, d.value);
          this.dataset.value = d.value;
          return function (t) {
            this.textContent = `${formatPercent.format(interpolator(t))} %`;
          };
        });
    }

    function renderSpectrumChart(year) {
      const state = getState(year);
      const grouped = d3.rollups(
        state
          .filter((entry) => entry.value > 0 && partySpectrum.has(entry.party))
          .map((entry) => ({
            ...entry,
            spectrum: partySpectrum.get(entry.party).spectrum
          })),
        (entries) => ({
          value: d3.sum(entries, (entry) => entry.value),
          parties: entries
            .sort((a, b) => d3.descending(a.value, b.value))
            .map((entry) => entry.party)
        }),
        (entry) => entry.spectrum
      )
        .map(([spectrum, detail]) => ({ spectrum, ...detail }))
        .filter((entry) => entry.value > 0)
        .sort((a, b) => spectrumOrder.indexOf(a.spectrum) - spectrumOrder.indexOf(b.spectrum));

      const total = d3.sum(grouped, (entry) => entry.value);
      if (!total) {
        spectrumStack.html("<p class=\"spectrum-empty\">Fuer dieses Wahljahr liegen keine Spektrum-Zuordnungen vor.</p>");
        spectrumCaption.text("Politische Einordnung");
        return;
      }

      spectrumCaption.text("Politische Einordnung");
      spectrumStack.html(`
        <div class="spectrum-scale" aria-hidden="true">
          <span>0 %</span>
          <span>50 %</span>
          <span>100 %</span>
        </div>
        <div class="spectrum-track">
          ${grouped.map((entry) => {
            const width = entry.value / total * 100;
            const tooltip = `${entry.spectrum}: ${formatPercent.format(entry.value)} %\nParteien: ${entry.parties.join(", ")}`;
            return `
              <div class="spectrum-segment" style="--segment-width:${width}%; --segment-color:${spectrumColors[entry.spectrum] ?? "var(--base-500)"}" title="${escapeHtml(tooltip)}">
                <span>${escapeHtml(entry.spectrum)}</span>
              </div>
            `;
          }).join("")}
        </div>
        <div class="spectrum-legend" aria-label="Legende politisches Spektrum">
          ${grouped.map((entry) => `
            <span class="spectrum-legend-item">
              <i style="--legend-color:${spectrumColors[entry.spectrum] ?? "var(--base-500)"}"></i>
              ${escapeHtml(entry.spectrum)}
            </span>
          `).join("")}
        </div>
      `);
    }

    function renderTimeline() {
      const timelineWrapNode = container.select(".racing-timeline-wrap").node();
      const visibleTimelineWidth = Math.max(320, timelineWrapNode.clientWidth);
      timelineWidth = visibleTimelineWidth < 560 ? 760 : visibleTimelineWidth;
      const topBand = timelineWidth < 560 ? 84 : 102;
      const height = (timelineWidth < 560 ? 174 : 198) + topBand;
      const margin = { left: timelineWidth < 560 ? 18 : 28, right: timelineWidth < 560 ? 18 : 28 };
      const x = d3.scaleLinear().domain([1919, 2025]).range([margin.left, timelineWidth - margin.right]);
      const baseline = (timelineWidth < 560 ? 76 : 88) + topBand;
      const eventBaseY = baseline + 34;

      container.select(".racing-timeline-wrap")
        .style("--timeline-left", `${margin.left}px`)
        .style("--timeline-right", `${margin.right}px`)
        .style("--timeline-width", `${timelineWidth}px`)
        .style("--scrubber-y", `${baseline}px`);

      timeline
        .attr("viewBox", `0 0 ${timelineWidth} ${height}`)
        .attr("width", timelineWidth)
        .attr("height", height);
      timeline.selectAll("*").remove();

      timeline.append("line")
        .attr("class", "racing-axis-line")
        .attr("x1", x(1919) - 10)
        .attr("x2", x(2025) + (timelineWidth < 560 ? 16 : 28))
        .attr("y1", baseline)
        .attr("y2", baseline);

      const tickYears = timelineWidth < 520
        ? [1919, 1949, 1990, 2025]
        : timelineWidth < 780
          ? [1919, 1933, 1949, 1972, 1990, 2013, 2025]
          : [1919, 1933, 1945, 1949, 1972, 1990, 2013, 2025];

      timeline.selectAll(".racing-tick")
        .data(tickYears)
        .join("g")
        .attr("class", "racing-tick")
        .attr("transform", (d) => `translate(${x(d)},${baseline})`)
        .call((g) => {
          g.append("line").attr("y2", 10);
          g.append("text").attr("y", -50).attr("text-anchor", "middle").text((d) => d);
        });

      timeline.selectAll(".racing-election-marker")
        .data(rows)
        .join("g")
        .attr("class", (d) => `racing-election-marker ${Math.abs(d.year - activeYear) < 0.01 ? "is-active" : ""}`)
        .attr("transform", (d) => `translate(${x(d.year)},${baseline - 29})`)
        .call((g) => {
          g.append("line").attr("y1", 8).attr("y2", 20);
          g.append("circle").attr("r", 4);
        });

      const eventGroup = timeline.selectAll(".racing-event-marker")
        .data(events)
        .join("g")
        .attr("class", (d) => `racing-event-marker ${categoryClass(d.kategorie)} ${selectedEvent === d ? "is-selected" : ""}`)
        .attr("tabindex", 0)
        .attr("role", "button")
        .attr("aria-label", (d) => `${d.jahr}: ${d.ereignis}`)
        .attr("transform", (d, index) => {
          const lane = (index % 3) * (timelineWidth < 560 ? 23 : 26);
          return `translate(${x(d.year)},${eventBaseY + lane})`;
        })
        .on("mouseenter focus", function (event, d) {
          if (!window.matchMedia("(max-width: 700px)").matches) {
            showEventPopover(this, d);
          }
        })
        .on("mouseleave blur", () => {
          schedulePopoverHide();
        })
        .on("click", function (event, d) {
          event.stopPropagation();
          const markerBounds = this.getBoundingClientRect();
          selectEvent(d, { showPanel: false });
          showEventPopover(markerBounds, d, true);
        })
        .on("keydown", (event, d) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            selectEvent(d, { showPanel: true });
          }
        });

      eventGroup.append("line")
        .attr("class", "racing-event-stem")
        .attr("y1", -8)
        .attr("y2", (_, index) => -34 - (index % 3) * (timelineWidth < 560 ? 23 : 26));
      eventGroup.append("rect")
        .attr("class", "racing-event-hitbox")
        .attr("x", timelineWidth < 560 ? -13 : -16)
        .attr("y", timelineWidth < 560 ? -14 : -17)
        .attr("width", timelineWidth < 560 ? 26 : 32)
        .attr("height", timelineWidth < 560 ? 26 : 32);
      eventGroup.append("foreignObject")
        .attr("class", "racing-event-icon-wrap")
        .attr("x", timelineWidth < 560 ? -13 : -16)
        .attr("y", timelineWidth < 560 ? -14 : -17)
        .attr("width", timelineWidth < 560 ? 26 : 32)
        .attr("height", timelineWidth < 560 ? 26 : 32)
        .html((d) => `
          <div xmlns="http://www.w3.org/1999/xhtml" class="racing-event-icon">
            <i class="bi ${eventIcon[d.kategorie] ?? "bi-pin-angle"}"></i>
          </div>
        `);

      timeline.append("path")
        .attr("class", "racing-playhead")
        .attr("d", "M -11 0 L 0 -9 L 11 0 L 0 9 Z")
        .attr("transform", `translate(${x(activeYear)},${baseline})`);

      const scrubberIndicator = timeline.append("g")
        .attr("class", "racing-scrubber-indicator");

      scrubberIndicator.append("line")
        .attr("class", "racing-scrubber-line")
        .attr("x1", 0)
        .attr("x2", 0)
        .attr("y1", 68)
        .attr("y2", baseline);

      scrubberIndicator.append("circle")
        .attr("class", "racing-scrubber-endcap")
        .attr("cx", 0)
        .attr("cy", baseline)
        .attr("r", 4);

      scrubberIndicator.append("text")
        .attr("class", "racing-scrubber-title")
        .attr("text-anchor", "start")
        .attr("x", 0)
        .attr("y", 58);

      scrubberIndicator.append("text")
        .attr("class", "racing-scrubber-subtitle")
        .attr("text-anchor", "start")
        .attr("x", 0)
        .attr("y", 26);

      updateScrubberIndicator(activeYear, x, baseline, margin);
    }

    function updateScrubberIndicator(year, xScale, baseline, margin) {
      const election = nearestElection(year);
      const indicator = timeline.select(".racing-scrubber-indicator");
      if (indicator.empty()) return;

      const timelineWrapNode = container.select(".racing-timeline-wrap").node();
      const scrubberNode = scrubber.node();
      const scrubberRect = scrubberNode.getBoundingClientRect();
      const wrapRect = timelineWrapNode.getBoundingClientRect();
      const scrubberCenterY = scrubberRect.top - wrapRect.top + scrubberRect.height / 2;

      const anchorX = Math.max(
        margin.left,
        Math.min(timelineWidth - margin.right, xScale(year))
      );

      const indicatorY = 0;
      const connectorY = scrubberCenterY;

      indicator
        .attr("transform", `translate(${anchorX},${indicatorY})`)
        .select(".racing-scrubber-line")
        .attr("y1", 68)
        .attr("y2", connectorY);

      indicator.select(".racing-scrubber-endcap")
        .attr("cy", connectorY);

      indicator.select(".racing-scrubber-title")
        .text(`Wahl ${election.label}`);
      indicator.select(".racing-scrubber-subtitle")
        .text(Number.isFinite(election.turnout) && election.turnout > 0
          ? `Wahlbeteiligung: ${formatTurnout.format(election.turnout)} %`
          : "Wahlbeteiligung: keine Angabe");

      const titleWidth = indicator.select(".racing-scrubber-title").node()?.getComputedTextLength() ?? 0;
      const subtitleWidth = indicator.select(".racing-scrubber-subtitle").node()?.getComputedTextLength() ?? 0;
      const labelWidth = Math.max(titleWidth, subtitleWidth);
      const labelPadding = 14;
      const hasRoomRight = anchorX + labelPadding + labelWidth <= timelineWidth - margin.right;
      const labelAnchor = hasRoomRight ? "start" : "end";

      indicator.selectAll(".racing-scrubber-title, .racing-scrubber-subtitle")
        .attr("text-anchor", labelAnchor)
        .attr("x", -3);
    }

    function render(year) {
      const election = nearestElection(year);
      activeYear = election.year;
      scrubber.property("value", activeYear);
      yearLabel.text(election.label);
      electionLabel.text(`Wahl ${election.label}`);
      turnoutLabel.text(Number.isFinite(election.turnout) && election.turnout > 0
        ? `Wahlbeteiligung: ${formatTurnout.format(election.turnout)} %`
        : "Wahlbeteiligung: keine Angabe");
      renderBars(activeYear);
      renderSpectrumChart(activeYear);

      const margin = { left: timelineWidth < 560 ? 18 : 28, right: timelineWidth < 560 ? 18 : 28 };
      const topBand = timelineWidth < 560 ? 84 : 102;
      const baseline = (timelineWidth < 560 ? 76 : 88) + topBand;
      const x = d3.scaleLinear()
        .domain([1919, 2025])
        .range([margin.left, timelineWidth - margin.right]);
      updateScrubberIndicator(activeYear, x, baseline, margin);

      timeline.select(".racing-playhead")
        .attr("transform", `translate(${x(activeYear)},${baseline})`);
      timeline.selectAll(".racing-election-marker")
        .classed("is-active", (d) => Math.abs(d.year - activeYear) < 0.01);
    }

    function selectEvent(event, options = {}) {
      const { showPanel = false } = options;
      selectedEvent = event;
      if (showPanel) {
        contextInfo.property("hidden", false).attr("hidden", null).html(`
          <div class="racing-event-panel">
            <p class="racing-event-kicker">${escapeHtml(event.kategorie)} · ${escapeHtml(event.jahr)}</p>
            <h4>${escapeHtml(event.ereignis)}</h4>
            <p>${escapeHtml(event.erklaerung)}</p>
            <a href="${escapeHtml(event.link)}" target="_blank" rel="noopener">Quelle &oumlffnen <span>&#8599;</span></a>
          </div>
        `);
      } else {
        contextInfo.property("hidden", true).attr("hidden", "").html("");
      }
      renderTimeline();
      render(event.year);
      if (showPanel && window.matchMedia("(max-width: 700px)").matches) {
        contextInfo.node()?.scrollIntoView({ block: "nearest", behavior: "smooth" });
      }
    }

    function categoryClass(category) {
      if (category === "Wahl") return "event-wahl";
      if (category === "Politik") return "event-politik";
      if (category === "Wirtschaft") return "event-wirtschaft";
      if (category === "Gesellschaft") return "event-gesellschaft";
      return "event-sonstige";
    }

    function showEventPopover(anchor, event, pinned = false) {
      const markerBounds = typeof anchor.getBoundingClientRect === "function"
        ? anchor.getBoundingClientRect()
        : anchor;
      const viewportWidth = document.documentElement.clientWidth;
      const viewportHeight = window.innerHeight;
      const popoverWidth = Math.min(260, viewportWidth - 16);
      const centeredX = markerBounds.left + markerBounds.width / 2 - popoverWidth / 2;
      const xPos = Math.max(8, Math.min(viewportWidth - popoverWidth - 8, centeredX));
      const eventLink = String(event.link ?? "").trim();
      const popover = d3.select("body").selectAll(".racing-popover").data([event]).join("div")
        .attr("class", `racing-popover ${pinned ? "is-pinned" : ""}`)
        .style("left", `${xPos}px`)
        .style("top", "0")
        .style("width", `${popoverWidth}px`)
        .style("visibility", "hidden")
        .html(`
          <p>${escapeHtml(event.kategorie)} · ${escapeHtml(event.jahr)}</p>
          <strong>${escapeHtml(event.ereignis)}</strong>
          <span>${escapeHtml(event.erklaerung)}</span>
          ${eventLink ? `<a href="${escapeHtml(eventLink)}" target="_blank" rel="noopener">Wikipedia &#8599;</a>` : ""}
        `);

      popover
        .on("mouseenter", () => cancelPopoverHide())
        .on("mouseleave", () => schedulePopoverHide());

      const popoverHeight = popover.node().offsetHeight;
      const belowY = markerBounds.bottom + 10;
      const aboveY = markerBounds.top - popoverHeight - 10;
      const yPos = belowY + popoverHeight <= viewportHeight - 8
        ? belowY
        : Math.max(8, aboveY);

      popover
        .style("top", `${yPos}px`)
        .style("visibility", "visible");

      if (pinned) {
        popover.append("button")
          .attr("type", "button")
          .attr("class", "racing-popover-close")
          .attr("aria-label", "Hinweis schließen")
          .html("&times;")
          .on("click", (clickEvent) => {
            clickEvent.stopPropagation();
            hidePopover();
          });
      }
    }

    function cancelPopoverHide() {
      if (popoverHideTimer) {
        window.clearTimeout(popoverHideTimer);
        popoverHideTimer = null;
      }
    }

    function schedulePopoverHide() {
      cancelPopoverHide();
      const activePopover = d3.select(".racing-popover");
      if (activePopover.empty() || activePopover.classed("is-pinned")) return;
      popoverHideTimer = window.setTimeout(() => {
        const popover = d3.select(".racing-popover");
        if (!popover.empty() && !popover.node().matches(":hover")) {
          hidePopover();
        }
      }, 80);
    }

    function hidePopover() {
      cancelPopoverHide();
      d3.selectAll(".racing-popover").remove();
    }

    function start() {
      if (timer) timer.stop();
      isPlaying = true;
      playButton.classed("is-active", true);
      timer = d3.interval(() => {
        const nextIndex = nearestElectionIndex(activeYear) + 1;
        if (nextIndex >= electionYears.length) {
          render(electionYears[electionYears.length - 1]);
          pause();
          return;
        }
        render(electionYears[nextIndex]);
      }, 850);
    }

    function pause() {
      isPlaying = false;
      playButton.classed("is-active", false);
      if (timer) timer.stop();
      timer = null;
    }

    playButton.on("click", start);
    previousButton.on("click", () => goToElectionOffset(-1));
    nextButton.on("click", () => goToElectionOffset(1));
    pauseButton.on("click", pause);
    resetButton.on("click", () => {
      pause();
      selectedEvent = null;
      contextInfo.property("hidden", true).attr("hidden", "").html("");
      renderTimeline();
      render(1919);
    });
    scrubber.on("input", (event) => {
      pause();
      render(nearestElection(Number(event.currentTarget.value)).year);
    });
    window.addEventListener("resize", () => {
      hidePopover();
      renderTimeline();
      render(activeYear);
    });
    document.addEventListener("click", hidePopover);

    renderTimeline();
    render(activeYear);
  }).catch((error) => {
    console.error(error);
    container.html("<p class=\"map-error\">Das Racing-Bar-Chart konnte nicht geladen werden.</p>");
  });
})();
