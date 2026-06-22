console.log("chart-85d728e.js loaded");

(() => {
  const datasets = {
    2013: "rawData/btw_2013.csv",
    2017: "rawData/btw_2017.csv",
    2021: "rawData/btw_2021.csv",
    2025: "rawData/btw_2025.csv"
  };
  const parties = ["CDU", "SPD", "DIE LINKE", "GRÜNE", "CSU", "FDP", "AfD", "Sonstige"];
  const partyColors = {
    CDU: cssVar("--color-cdu"),
    SPD: cssVar("--color-spd"),
    "DIE LINKE": cssVar("--color-linke"),
    "GRÜNE": cssVar("--color-gruene"),
    CSU: cssVar("--color-csu"),
    FDP: cssVar("--color-fdp"),
    AfD: cssVar("--color-afd"),
    Sonstige: cssVar("--color-partei")
  };
  const ageGroups = [
    { value: "all", label: "Alle", column2013: "Insgesamt_1000" },
    { value: "18-24", label: "18–24", column2013: "Alter_18_25_1000" },
    { value: "25-34", label: "25–34", column2013: "Alter_25_35_1000" },
    { value: "35-44", label: "35–44", column2013: "Alter_35_45_1000" },
    { value: "45-59", label: "45–59", column2013: "Alter_45_60_1000" },
    { value: "60-69", label: "60–69", column2013: "Alter_60_70_1000" },
    { value: "70+", label: "70+", column2013: "Alter_70plus_1000" }
  ];
  const fileCache = new Map();
  const numberFormatter = new Intl.NumberFormat("de-DE");
  const yearFilter = getID("firstVoteYearFilter");
  const genderFilter = getID("genderFilter");
  const ageFilter = getID("ageFilter");
  const subtitle = getID("firstVoteChartSubtitle");
  const chartContainer = d3.select("#firstVoteChart");
  let currentData = [];
  let updateSequence = 0;

  ageFilter.innerHTML = ageGroups
    .map((age) => `<option value="${age.value}">${age.label}</option>`)
    .join("");

  function loadYear(year) {
    if (!fileCache.has(year)) {
      fileCache.set(year, d3.dsv(";", datasets[year], d3.autoType));
    }
    return fileCache.get(year);
  }

  function normalize2013(rows, selectedGender, selectedAge) {
    const gender = { Summe: "Insgesamt", m: "Männer", w: "Frauen" }[selectedGender];
    const column = ageGroups.find((age) => age.value === selectedAge).column2013;
    const relevant = rows.filter((row) => row.Bundesland === "Deutschland" && row.Geschlecht === gender);
    const valueFor = (party) => Number(relevant.find((row) => row.Partei === party)?.[column] || 0) * 1000;
    const afdVotes = valueFor("dar. AfD");

    return parties.map((party) => ({
      party,
      votes: party === "AfD"
        ? afdVotes
        : party === "Sonstige"
          ? Math.max(0, valueFor(party) - afdVotes)
          : valueFor(party)
    }));
  }

  function normalizeLaterYears(rows, year, selectedGender, selectedAge) {
    const voteKey = year === "2017" ? "Erst-/Zweitstimme" : "Stimmentyp";
    const voteValue = year === "2017" ? 1 : "Erststimme";
    const ageIndex = ageGroups.findIndex((age) => age.value === selectedAge);
    const sourceAgeIndex = ageIndex === 0 ? 0 : ageIndex;
    const relevant = rows.filter((row) =>
      row.Land === "Bund" && row[voteKey] === voteValue && row.Geschlecht === selectedGender
    );
    const row = relevant[sourceAgeIndex];
    const sourceColumns = {
      CDU: "CDU",
      SPD: "SPD",
      "DIE LINKE": year === "2017" ? "DIE LINKE" : "DIE_LINKE",
      "GRÜNE": "GRÜNE",
      CSU: "CSU",
      FDP: "FDP",
      AfD: "AfD",
      Sonstige: "Sonstige"
    };

    return parties.map((party) => ({
      party,
      votes: Number(row?.[sourceColumns[party]] || 0)
    }));
  }

  function renderChart(data) {
    currentData = data;
    const node = chartContainer.node();
    const width = Math.max(node.clientWidth, 640);
    const height = 430;
    const margin = { top: 16, right: 24, bottom: 56, left: 86 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    chartContainer.selectAll("*").remove();
    const svg = chartContainer.append("svg")
      .attr("viewBox", `0 0 ${width} ${height}`)
      .attr("width", "100%")
      .attr("height", height);
    const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);
    const x = d3.scaleBand().domain(data.map((d) => d.party)).range([0, innerWidth]).padding(0.24);
    const y = d3.scaleLinear()
      .domain([0, d3.max(data, (d) => d.votes) || 1])
      .nice()
      .range([innerHeight, 0]);

    g.append("g").attr("class", "chart-grid")
      .call(d3.axisLeft(y).ticks(5).tickSize(-innerWidth).tickFormat(""));
    g.append("g").attr("class", "chart-axis")
      .call(d3.axisLeft(y).ticks(5).tickFormat((value) => `${numberFormatter.format(value / 1000000)} Mio.`));
    g.append("g").attr("class", "chart-axis").attr("transform", `translate(0,${innerHeight})`)
      .call(d3.axisBottom(x));
    g.selectAll(".bar").data(data).join("rect")
      .attr("class", "bar")
      .attr("x", (d) => x(d.party))
      .attr("y", (d) => y(d.votes))
      .attr("width", x.bandwidth())
      .attr("height", (d) => innerHeight - y(d.votes))
      .attr("fill", (d) => partyColors[d.party]);
    g.selectAll(".bar-label").data(data).join("text")
      .attr("class", "bar-label")
      .attr("x", (d) => x(d.party) + x.bandwidth() / 2)
      .attr("y", (d) => y(d.votes) - 8)
      .attr("text-anchor", "middle")
      .text((d) => numberFormatter.format(Math.round(d.votes)));
  }

  async function updateChart() {
    const sequence = ++updateSequence;
    const year = yearFilter.value;
    const gender = genderFilter.value;
    const age = ageFilter.value;
    subtitle.textContent = `Erststimmen ${year}, Bundesgebiet gesamt`;
    chartContainer.attr(
      "aria-label",
      `Säulendiagramm der Erststimmen ${year} nach Partei, Geschlecht ${genderFilter.selectedOptions[0].text}, Altersgruppe ${ageFilter.selectedOptions[0].text}`
    );

    try {
      const rows = await loadYear(year);
      if (sequence !== updateSequence) return;
      const data = year === "2013"
        ? normalize2013(rows, gender, age)
        : normalizeLaterYears(rows, year, gender, age);
      renderChart(data);
    } catch (error) {
      if (sequence !== updateSequence) return;
      currentData = [];
      chartContainer.html("<p>Die Wahldaten konnten nicht geladen werden.</p>");
      console.error(error);
    }
  }

  yearFilter.addEventListener("change", updateChart);
  genderFilter.addEventListener("change", updateChart);
  ageFilter.addEventListener("change", updateChart);
  window.addEventListener("resize", () => currentData.length && renderChart(currentData));
  updateChart();
})();
