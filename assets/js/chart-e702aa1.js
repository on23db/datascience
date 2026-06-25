console.log('chart-e702aa1.js loaded');
(() => {
  const datasets = {
    2013: "rawData/btw_2013.csv",
    2017: "rawData/btw_2017.csv",
    2021: "rawData/btw_2021.csv",
    2025: "rawData/btw_2025.csv"
  };
  const previousYears = {
    2017: 2013,
    2021: 2017,
    2025: 2021
  };

  const ageLabels = ["18–24", "25–34", "35–44", "45–59", "60–69", "70+"];
  const partyLabels = {
    CDU_CSU: "CDU/CSU",
    SPD: "SPD",
    GRUENE: "BÜNDNIS 90/DIE GRÜNEN",
    AfD: "AfD",
    FDP: "FDP",
    DIE_LINKE: "DIE LINKE",
    Sonstige: "Sonstige"
  };
  const partyColumns = {
    SPD: ["SPD"],
    GRUENE: ["GRÜNE"],
    AfD: ["AfD"],
    FDP: ["FDP"],
    DIE_LINKE: ["DIE LINKE", "DIE_LINKE"],
    Sonstige: ["Sonstige"],
    CDU_CSU: ["CDU", "CSU"]
  };
  const partyLabels2013 = {
    SPD: "SPD",
    GRUENE: "GRÜNE",
    FDP: "FDP",
    DIE_LINKE: "DIE LINKE",
    Sonstige: "Sonstige"
  };
  const fileCache = new Map();
  const numberFormatter = new Intl.NumberFormat("de-DE");
  const compactFormatter = new Intl.NumberFormat("de-DE", {
    notation: "compact",
    maximumFractionDigits: 1
  });
  const millionFormatter = new Intl.NumberFormat("de-DE", {
    maximumFractionDigits: 0
  });

  const yearFilter = document.getElementById("pyramidYearFilter");
  const partyFilter = document.getElementById("pyramidPartyFilter");
  const subtitle = document.getElementById("voterPyramidSubtitle");
  const container = d3.select("#voterPyramidChart");
  const statElements = {
    share: document.getElementById("demoShareStat"),
    shareDetail: document.getElementById("demoShareDetail"),
    age: document.getElementById("demoAgeStat"),
    ageDetail: document.getElementById("demoAgeDetail"),
    gender: document.getElementById("demoGenderStat"),
    genderDetail: document.getElementById("demoGenderDetail"),
    generation: document.getElementById("demoGenerationStat"),
    generationDetail: document.getElementById("demoGenerationDetail")
  };

  function valueForParty(row, party) {
    return partyColumns[party].reduce((sum, column) => sum + Number(row[column] || 0), 0);
  }

  function formatPercent(value, digits = 1) {
    return `${value.toLocaleString("de-DE", {
      minimumFractionDigits: digits,
      maximumFractionDigits: digits
    })} %`;
  }

  function validVotesLong(row) {
    if (!row) return 0;
    return Object.keys(partyColumns).reduce((sum, party) => sum + valueForParty(row, party), 0);
  }

  function valueFor2013Party(rows, party, gender, column) {
    const genderRows = rows.filter((row) =>
      row.Bundesland === "Deutschland" && row.Geschlecht === gender
    );
    if (party === "AfD") {
      return Number(genderRows.find((row) => row.Partei === "dar. AfD")?.[column] || 0) * 1000;
    }
    const requestedParties = party === "CDU_CSU" ? ["CDU", "CSU"] : [partyLabels2013[party]];
    return d3.sum(
      genderRows.filter((row) => requestedParties.includes(row.Partei)),
      (row) => Number(row[column] || 0) * 1000
    );
  }

  function validVotes2013(rows, gender, column) {
    const validParties = ["CDU", "CSU", "SPD", "FDP", "DIE LINKE", "GRÃœNE", "Sonstige"];
    return d3.sum(
      rows.filter((row) =>
        row.Bundesland === "Deutschland" &&
        row.Geschlecht === gender &&
        validParties.includes(row.Partei)
      ),
      (row) => Number(row[column] || 0) * 1000
    );
  }

  function totalsForYear(rows, year, party) {
    if (year === 2013) {
      const ageColumns = [
        "Alter_18_25_1000", "Alter_25_35_1000", "Alter_35_45_1000",
        "Alter_45_60_1000", "Alter_60_70_1000", "Alter_70plus_1000"
      ];
      const ageRows = ageLabels.map((age, index) => {
        const column = ageColumns[index];
        const male = valueFor2013Party(rows, party, "MÃ¤nner", column);
        const female = valueFor2013Party(rows, party, "Frauen", column);
        const totalValid = validVotes2013(rows, "Insgesamt", column);
        return { age, male, female, partyTotal: male + female, totalValid };
      });
      return {
        ageRows,
        totalVotes: valueFor2013Party(rows, party, "Insgesamt", "Insgesamt_1000"),
        validVotes: validVotes2013(rows, "Insgesamt", "Insgesamt_1000")
      };
    }

    const voteKey = year === 2017 ? "Erst-/Zweitstimme" : "Stimmentyp";
    const voteValue = year === 2017 ? 1 : "Erststimme";
    const relevant = rows.filter((row) => row.Land === "Bund" && row[voteKey] === voteValue);
    const maleRows = relevant.filter((row) => row.Geschlecht === "m" && row.Geburtsjahresgruppe !== "Summe");
    const femaleRows = relevant.filter((row) => row.Geschlecht === "w" && row.Geburtsjahresgruppe !== "Summe");
    const sumRows = relevant.filter((row) => row.Geschlecht === "Summe" && row.Geburtsjahresgruppe !== "Summe");
    const ageRows = ageLabels.map((age, index) => {
      const male = valueForParty(maleRows[index], party);
      const female = valueForParty(femaleRows[index], party);
      return {
        age,
        male,
        female,
        partyTotal: male + female,
        totalValid: validVotesLong(sumRows[index])
      };
    });
    const totalRow = relevant.find((row) => row.Geschlecht === "Summe" && row.Geburtsjahresgruppe === "Summe");
    return {
      ageRows,
      totalVotes: valueForParty(totalRow, party),
      validVotes: validVotesLong(totalRow)
    };
  }

  async function getTrend(year, party, totalVotes) {
    const previousYear = previousYears[year];
    if (!previousYear) return null;
    const previousRows = await loadYear(previousYear);
    const previousTotals = totalsForYear(previousRows, previousYear, party);
    return {
      year: previousYear,
      difference: totalVotes - previousTotals.totalVotes
    };
  }

  function renderStats(data, rows, year, party, trend) {
    if (!statElements.share) return;
    const totals = totalsForYear(rows, year, party);
    const strongestAge = totals.ageRows.reduce((winner, row) =>
      row.partyTotal > winner.partyTotal ? row : winner,
      totals.ageRows[0]
    );
    const maleVotes = d3.sum(data, (row) => row.male);
    const femaleVotes = d3.sum(data, (row) => row.female);
    const partyVotes = maleVotes + femaleVotes;
    const maleShare = partyVotes ? maleVotes / partyVotes * 100 : 0;
    const femaleShare = partyVotes ? femaleVotes / partyVotes * 100 : 0;
    const youngShare = totals.ageRows[0].totalValid
      ? totals.ageRows[0].partyTotal / totals.ageRows[0].totalValid * 100
      : 0;
    const oldestAge = totals.ageRows[totals.ageRows.length - 1];
    const oldShare = oldestAge.totalValid ? oldestAge.partyTotal / oldestAge.totalValid * 100 : 0;
    const generationGap = youngShare - oldShare;
    const share = totals.validVotes ? totals.totalVotes / totals.validVotes * 100 : 0;
    const trendText = trend
      ? `${trend.difference >= 0 ? "+" : ""}${compactFormatter.format(Math.round(trend.difference))} Stimmen seit ${trend.year}`
      : "Erstes Vergleichsjahr im Datensatz";

    statElements.share.textContent = formatPercent(share);
    statElements.shareDetail.textContent = `${partyLabels[party]} erreicht ${numberFormatter.format(Math.round(totals.totalVotes))} Erststimmen. ${trendText}.`;
    statElements.age.textContent = strongestAge.age;
    statElements.ageDetail.textContent = `${numberFormatter.format(Math.round(strongestAge.partyTotal))} Stimmen kommen aus dieser Altersgruppe.`;
    statElements.gender.textContent = maleShare >= femaleShare
      ? `${formatPercent(maleShare, 0)} m`
      : `${formatPercent(femaleShare, 0)} w`;
    statElements.genderDetail.textContent = `${formatPercent(maleShare)} der Stimmen kommen von Männern, ${formatPercent(femaleShare)} von Frauen.`;
    statElements.generation.textContent = `${generationGap >= 0 ? "+" : ""}${formatPercent(generationGap)}`;
    statElements.generationDetail.textContent = `18-24-Jährige liegen bei ${formatPercent(youngShare)}, 70+ bei ${formatPercent(oldShare)}.`;
  }

  function normalize2013(rows, party) {
    const sourceParty = party === "AfD" ? "dar. AfD" : null;
    const ageColumns = [
      "Alter_18_25_1000", "Alter_25_35_1000", "Alter_35_45_1000",
      "Alter_45_60_1000", "Alter_60_70_1000", "Alter_70plus_1000"
    ];
    const relevant = rows.filter((row) =>
      row.Bundesland === "Deutschland" && ["Männer", "Frauen"].includes(row.Geschlecht)
    );

    return ageLabels.map((age, index) => {
      const genderValue = (gender) => {
        const genderRows = relevant.filter((row) => row.Geschlecht === gender);
        if (sourceParty) {
          const row = genderRows.find((entry) => entry.Partei === sourceParty);
          return Number(row?.[ageColumns[index]] || 0) * 1000;
        }
        const requestedParties = party === "CDU_CSU" ? ["CDU", "CSU"] : [partyLabels2013[party]];
        return d3.sum(
          genderRows.filter((row) => requestedParties.includes(row.Partei)),
          (row) => Number(row[ageColumns[index]] || 0) * 1000
        );
      };
      return { age, male: genderValue("Männer"), female: genderValue("Frauen") };
    });
  }

  function normalizeLong(rows, year, party) {
    const voteKey = year === 2017 ? "Erst-/Zweitstimme" : "Stimmentyp";
    const voteValue = year === 2017 ? 1 : "Erststimme";
    const relevant = rows.filter((row) =>
      row.Land === "Bund" && row[voteKey] === voteValue && row.Geburtsjahresgruppe !== "Summe"
    );
    const maleRows = relevant.filter((row) => row.Geschlecht === "m");
    const femaleRows = relevant.filter((row) => row.Geschlecht === "w");

    return ageLabels.map((age, index) => ({
      age,
      male: valueForParty(maleRows[index], party),
      female: valueForParty(femaleRows[index], party)
    }));
  }

  async function loadYear(year) {
    if (!fileCache.has(year)) {
      fileCache.set(year, d3.dsv(";", datasets[year], d3.autoType));
    }
    return fileCache.get(year);
  }

  function render(data, year, party) {
    const node = container.node();
    container.selectAll("*").remove();

    const width = Math.max(node.clientWidth, 300);
    const height = width < 520 ? 360 : width < 760 ? 420 : 470;
    const compact = width < 620;
    const mobile = width < 460;
    const margin = {
      top: mobile ? 54 : 58,
      right: mobile ? 12 : compact ? 28 : 54,
      bottom: mobile ? 54 : 48,
      left: mobile ? 12 : compact ? 28 : 54
    };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;
    const center = innerWidth / 2;
    const centerGap = Math.max(mobile ? 42 : 58, Math.min(mobile ? 58 : 92, innerWidth * 0.16));
    const sideWidth = (innerWidth - centerGap) / 2;
    const maxVotes = d3.max(data, (d) => Math.max(d.male, d.female)) || 1;

    node.setAttribute(
      "aria-label",
      `Erststimmen für ${partyLabels[party]} ${year} nach Altersgruppe: Männer links, Frauen rechts.`
    );

    const svg = container.append("svg")
      .attr("viewBox", `0 0 ${width} ${height}`)
      .attr("width", "100%")
      .attr("height", "100%")
      .attr("preserveAspectRatio", "xMidYMid meet");
    const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);
    const y = d3.scaleBand().domain(ageLabels).range([0, innerHeight]).padding(0.15);
    const x = d3.scaleLinear().domain([0, maxVotes]).nice().range([0, sideWidth]);

    const ticks = x.ticks(4).filter((tick) => tick > 0);
    g.selectAll(".pyramid-grid-left")
      .data(ticks).join("line")
      .attr("class", "chart-grid pyramid-grid-left")
      .attr("x1", (d) => center - centerGap / 2 - x(d))
      .attr("x2", (d) => center - centerGap / 2 - x(d))
      .attr("y1", 0).attr("y2", innerHeight)
      .attr("stroke", "var(--base-700)").attr("stroke-dasharray", "3 6");
    g.selectAll(".pyramid-grid-right")
      .data(ticks).join("line")
      .attr("class", "chart-grid pyramid-grid-right")
      .attr("x1", (d) => center + centerGap / 2 + x(d))
      .attr("x2", (d) => center + centerGap / 2 + x(d))
      .attr("y1", 0).attr("y2", innerHeight)
      .attr("stroke", "var(--base-700)").attr("stroke-dasharray", "3 6");

    const groups = g.selectAll(".pyramid-row").data(data).join("g").attr("class", "pyramid-row");
    groups.append("rect")
      .attr("class", "bar pyramid-bar-male")
      .attr("x", (d) => center - centerGap / 2 - x(d.male))
      .attr("y", (d) => y(d.age))
      .attr("width", (d) => x(d.male))
      .attr("height", y.bandwidth())
      .attr("fill", "var(--color-male)")
      .append("title").text((d) => `Männlich, ${d.age}: ${numberFormatter.format(Math.round(d.male))}`);
    groups.append("rect")
      .attr("class", "bar pyramid-bar-female")
      .attr("x", center + centerGap / 2)
      .attr("y", (d) => y(d.age))
      .attr("width", (d) => x(d.female))
      .attr("height", y.bandwidth())
      .attr("fill", "var(--color-female)")
      .append("title").text((d) => `Weiblich, ${d.age}: ${numberFormatter.format(Math.round(d.female))}`);

    groups.append("text")
      .attr("class", "pyramid-age-label")
      .attr("x", center)
      .attr("y", (d) => y(d.age) + y.bandwidth() / 2)
      .attr("text-anchor", "middle")
      .attr("dominant-baseline", "middle")
      .text((d) => d.age);

    const leftAxisScale = d3.scaleLinear().domain([maxVotes, 0]).nice().range([0, sideWidth]);
    const rightAxisScale = d3.scaleLinear().domain([0, maxVotes]).nice().range([0, sideWidth]);
    const axisTicks = mobile ? 2 : 4;
    const axisFormat = mobile
      ? (value) => value >= 1000000 ? `${millionFormatter.format(value / 1000000)} Mio.` : ""
      : (value) => compactFormatter.format(value);
    g.append("g").attr("class", "chart-axis")
      .attr("transform", `translate(0,${innerHeight})`)
      .call(d3.axisBottom(leftAxisScale).ticks(axisTicks).tickFormat(axisFormat));
    g.append("g").attr("class", "chart-axis")
      .attr("transform", `translate(${center + centerGap / 2},${innerHeight})`)
      .call(d3.axisBottom(rightAxisScale).ticks(axisTicks).tickFormat(axisFormat));
  }

  async function updateChart() {
    const year = Number(yearFilter.value);
    const party = partyFilter.value;
    subtitle.textContent = `Erststimmen ${year}, ${partyLabels[party]}, Bundesgebiet gesamt`;
    try {
      const rows = await loadYear(year);
      const data = year === 2013 ? normalize2013(rows, party) : normalizeLong(rows, year, party);
      render(data, year, party);
      const totals = totalsForYear(rows, year, party);
      const trend = await getTrend(year, party, totals.totalVotes);
      renderStats(data, rows, year, party, trend);
    } catch (error) {
      container.html("<p>Die Wahldaten konnten nicht geladen werden.</p>");
      console.error(error);
    }
  }

  yearFilter.addEventListener("change", updateChart);
  partyFilter.addEventListener("change", updateChart);
  window.addEventListener("resize", updateChart);
  updateChart();
})();
