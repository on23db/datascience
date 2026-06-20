(() => {
  const datasets = {
    2013: "rawData/btw_2013.csv",
    2017: "rawData/btw_2017.csv",
    2021: "rawData/btw_2021.csv",
    2025: "rawData/btw_2025.csv"
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

  const yearFilter = document.getElementById("pyramidYearFilter");
  const partyFilter = document.getElementById("pyramidPartyFilter");
  const subtitle = document.getElementById("voterPyramidSubtitle");
  const container = d3.select("#voterPyramidChart");

  function valueForParty(row, party) {
    return partyColumns[party].reduce((sum, column) => sum + Number(row[column] || 0), 0);
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
    const width = Math.max(node.clientWidth, 720);
    const height = 470;
    const margin = { top: 12, right: 54, bottom: 48, left: 54 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;
    const center = innerWidth / 2;
    const centerGap = 92;
    const sideWidth = (innerWidth - centerGap) / 2;
    const maxVotes = d3.max(data, (d) => Math.max(d.male, d.female)) || 1;

    container.selectAll("*").remove();
    node.setAttribute(
      "aria-label",
      `Erststimmen für ${partyLabels[party]} ${year} nach Altersgruppe: Männer links, Frauen rechts.`
    );

    const svg = container.append("svg")
      .attr("viewBox", `0 0 ${width} ${height}`)
      .attr("width", "100%")
      .attr("height", height);
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
      .attr("fill", "var(--afd-50)")
      .append("title").text((d) => `Männlich, ${d.age}: ${numberFormatter.format(Math.round(d.male))}`);
    groups.append("rect")
      .attr("class", "bar pyramid-bar-female")
      .attr("x", center + centerGap / 2)
      .attr("y", (d) => y(d.age))
      .attr("width", (d) => x(d.female))
      .attr("height", y.bandwidth())
      .attr("fill", "var(--accent-300)")
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
    g.append("g").attr("class", "chart-axis")
      .attr("transform", `translate(0,${innerHeight})`)
      .call(d3.axisBottom(leftAxisScale).ticks(4).tickFormat((value) => compactFormatter.format(value)));
    g.append("g").attr("class", "chart-axis")
      .attr("transform", `translate(${center + centerGap / 2},${innerHeight})`)
      .call(d3.axisBottom(rightAxisScale).ticks(4).tickFormat((value) => compactFormatter.format(value)));
  }

  async function updateChart() {
    const year = Number(yearFilter.value);
    const party = partyFilter.value;
    subtitle.textContent = `Erststimmen ${year}, ${partyLabels[party]}, Bundesgebiet gesamt`;
    container.html("<p>Diagramm wird geladen …</p>");
    try {
      const rows = await loadYear(year);
      const data = year === 2013 ? normalize2013(rows, party) : normalizeLong(rows, year, party);
      render(data, year, party);
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
