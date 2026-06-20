const partyColumns = ["CDU", "SPD", "DIE LINKE", "GRÜNE", "CSU", "FDP", "AfD", "Sonstige"];
const partyColors = {
  CDU: cssVar('--color-cdu'),
  SPD: cssVar('--color-spd'),
  "DIE LINKE": cssVar('--color-linke'),
  "GRÜNE": cssVar('--color-gruene'),
  CSU: cssVar('--color-csu'),
  FDP: cssVar('--color-fdp'),
  AfD: cssVar('--color-afd'),
  Sonstige: cssVar('--color-partei')
};
const ageLabels = {
  Summe: "Alle",
  "1993 - 1999": `${2026 - 1999} - ${2026 - 1993}`,
  "1983 - 1992": `${2026 - 1992} - ${2026 - 1983}`,
  "1973 - 1982": `${2026 - 1982} - ${2026 - 1973}`,
  "1958 - 1972": `${2026 - 1972} - ${2026 - 1958}`,
  "1948 - 1957": `${2026 - 1957} - ${2026 - 1948}`,
  "1947 und früher": `${2026 - 1947} und älter`
};

numberFormatter = new Intl.NumberFormat("de-DE");
const genderFilter = getID("genderFilter");
const ageFilter = getID("ageFilter");
const chartContainer = d3.select("#firstVoteChart");

d3.dsv(";", "rawData/btw_2017.csv", d3.autoType).then((rows) => {
  const bundFirstVotes = rows.filter((row) =>
    row.Land === "Bund" && row["Erst-/Zweitstimme"] === 1
  );

  const ageGroups = [...new Set(bundFirstVotes.map((row) => row.Geburtsjahresgruppe))];
  ageFilter.innerHTML = ageGroups
    .map((age) => `<option value="${age}">${ageLabels[age] ?? age}</option>`)
    .join("");

  function renderChart() {
    const selectedGender = genderFilter.value;
    const selectedAge = ageFilter.value;
    const row = bundFirstVotes.find((entry) =>
      entry.Geschlecht === selectedGender &&
      entry.Geburtsjahresgruppe === selectedAge
    );

    if (!row) {
      chartContainer.html("<p>Für diese Filterauswahl liegen keine Daten vor.</p>");
      return;
    }

    const data = partyColumns.map((party) => ({
      party,
      votes: Number(row[party] ?? 0)
    }));

    const margin = { top: 16, right: 24, bottom: 56, left: 86 };
    const width = chartContainer.node().clientWidth;
    const height = 430;
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    chartContainer.selectAll("*").remove();

    const svg = chartContainer
      .append("svg")
      .attr("viewBox", `0 0 ${width} ${height}`)
      .attr("width", "100%")
      .attr("height", height);

    const g = svg.append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    const x = d3.scaleBand()
      .domain(data.map((d) => d.party))
      .range([0, innerWidth])
      .padding(0.24);

    const y = d3.scaleLinear()
      .domain([0, d3.max(data, (d) => d.votes)]).nice()
      .range([innerHeight, 0]);

    g.append("g")
      .attr("class", "chart-grid")
      .call(d3.axisLeft(y).ticks(5).tickSize(-innerWidth).tickFormat(""));

    g.append("g")
      .attr("class", "chart-axis")
      .call(d3.axisLeft(y).ticks(5).tickFormat((value) => `${numberFormatter.format(value / 1000000)} Mio.`));

    g.append("g")
      .attr("class", "chart-axis")
      .attr("transform", `translate(0,${innerHeight})`)
      .call(d3.axisBottom(x));

    g.selectAll(".bar")
      .data(data)
      .join("rect")
      .attr("class", "bar")
      .attr("x", (d) => x(d.party))
      .attr("y", (d) => y(d.votes))
      .attr("width", x.bandwidth())
      .attr("height", (d) => innerHeight - y(d.votes))
      .attr("fill", (d) => partyColors[d.party]);

    g.selectAll(".bar-label")
      .data(data)
      .join("text")
      .attr("class", "bar-label")
      .attr("x", (d) => x(d.party) + x.bandwidth() / 2)
      .attr("y", (d) => y(d.votes) - 8)
      .attr("text-anchor", "middle")
      .text((d) => numberFormatter.format(d.votes));
  }

  genderFilter.addEventListener("change", renderChart);
  ageFilter.addEventListener("change", renderChart);
  window.addEventListener("resize", renderChart);
  renderChart();
}).catch((error) => {
  chartContainer.html("<p>Die Wahldaten konnten nicht geladen werden.</p>");
  console.error(error);
});

console.log('chart-85d728e.js loaded and executed');
