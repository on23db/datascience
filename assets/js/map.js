console.log("map.js loaded and executed");
const width = 591.504;
const height = 800.504;

const zoom_manualMin = 0.75;
const zoom_manualMax = 9;
const zoom_autoDurationMS = 750;
const zoom_autoResetDurationMS = 750;

const statesDefault_outline_colorString = "#555";
const statesDefault_outline_strokeWidth = 0.6;
const statesDefault_background_colorString = "#ddd";

const MAP_DATASETS = {
  2009: "rawData/btwErgebnis_2009.csv",
  2013: "rawData/btwErgebnis_2013.csv",
  2017: "rawData/btwErgebnis_2017.csv",
  2021: "rawData/btwErgebnis_2021.csv",
  2025: "rawData/btwErgebnis_2025.csv"
};

const MAP_PARTIES = {
  CDU_CSU: {
    label: "CDU/CSU",
    cssPrefix: "cdu",
    columns: [
      ["CDU_Zweitstimmen_Endgültig", "Christlich Demokratische Union Deutschlands_Zweitstimmen_Endgültig"],
      ["CSU_Zweitstimmen_Endgültig", "Christlich-Soziale Union in Bayern e.V._Zweitstimmen_Endgültig"]
    ]
  },
  SPD: {
    label: "SPD",
    cssPrefix: "spd",
    columns: [["SPD_Zweitstimmen_Endgültig", "Sozialdemokratische Partei Deutschlands_Zweitstimmen_Endgültig"]]
  },
  GRUENE: {
    label: "BÜNDNIS 90/DIE GRÜNEN",
    cssPrefix: "gruene",
    columns: [["GRÜNE_Zweitstimmen_Endgültig", "BÜNDNIS 90/DIE GRÜNEN_Zweitstimmen_Endgültig"]]
  },
  AfD: {
    label: "AfD",
    cssPrefix: "afd",
    columns: [["AfD_Zweitstimmen_Endgültig", "Alternative für Deutschland_Zweitstimmen_Endgültig"]]
  },
  FDP: {
    label: "FDP",
    cssPrefix: "fdp",
    columns: [["FDP_Zweitstimmen_Endgültig", "Freie Demokratische Partei_Zweitstimmen_Endgültig"]]
  },
  DIE_LINKE: {
    label: "DIE LINKE",
    cssPrefix: "linke",
    columns: [[
      "LINKE_Zweitstimmen_Endgültig",
      "DIE LINKE_Zweitstimmen_Endgültig",
      "Die Linke_Zweitstimmen_Endgültig"
    ]]
  },
  Sonstige: {
    label: "Sonstige",
    cssPrefix: "partei"
  }
};

const VALID_SECOND_VOTE_COLUMNS = [
  "Gültige Stimmen_Zweitstimmen_Endgültig",
  "Gültige_Zweitstimmen_Endgültig"
];

const svg = d3.select("#Bundesrepublik_Deutschland");
const g = d3.select("#g1923");
const info = d3.select("#info");
const mapLegend = d3.select("#mapLegend");
const mapYearFilter = document.getElementById("mapYearFilter");
const mapPartyFilter = document.getElementById("mapPartyFilter");
const mapLabelToggle = document.getElementById("mapLabelToggle");

const stateNumberToName = {};
const stateNameToNumber = {};
const customMetadataByNumber = {};
const mapDataCache = new Map();
let globalMaximumPromise;

numberFormatter = new Intl.NumberFormat("de-DE");
percentageFormatter = new Intl.NumberFormat("de-DE", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 4
});

const OUTLINE_PATH_ID = "path3789";
const STATE_NAME_BY_ID = {
  "Baden__x26__Württemberg": "Baden-Württemberg"
};

let states;
let selectedStateNumber = null;
let latestMapRequest = 0;
let mapLabelsVisible = false;
let mapLabelLayer;

const zoom = d3.zoom()
  .scaleExtent([zoom_manualMin, zoom_manualMax])
  .on("zoom", (event) => {
    g.attr("transform", event.transform);
  });

svg.call(zoom);
svg.on("click", () => {
  selectedStateNumber = null;
  resetZoom();
  showMapHint();
});

initMap();

function initMap() {
  svg
    .attr("width", 900)
    .attr("height", 700)
    .attr("viewBox", `0 0 ${width} ${height}`);

  states = g.selectAll("path")
    .filter(function() {
      return this.id && this.id !== OUTLINE_PATH_ID;
    })
    .classed("state", true);

  states.each(function(_, index) {
    const name = getStateNameFromPath(this);

    stateNumberToName[index] = name;
    stateNameToNumber[name] = index;

    d3.select(this)
      .attr("data-state-number", index)
      .attr("data-state-name", name)
      .attr("id", `state-${index}`)
      .attr("role", "button")
      .attr("tabindex", 0);
  });

  states
    /*.style("fill", statesDefault_background_colorString)
    .style("stroke", statesDefault_outline_colorString)
    .style("stroke-width", statesDefault_outline_strokeWidth)
    .style("stroke-linejoin", "round")*/
    .on("click", function(event) {
      event.stopPropagation();
      selectState(this);
      showMapPopover(this, event);
    })
    .on("mouseenter focus", function(event) {
      showMapPopover(this, event);
    })
    .on("mousemove", function(event) {
      moveMapPopover(this, event);
    })
    .on("mouseleave blur", hideMapPopover)
    .on("keydown", function(event) {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        event.stopPropagation();
        selectState(this);
      }
    });

  g.selectAll("path")
    .filter(function() {
      return (this.dataset.originalId || this.id) === OUTLINE_PATH_ID;
    })
    .style("pointer-events", "none");
  mapLabelLayer = g.append("g").attr("class", "map-label-layer");

  mapYearFilter.addEventListener("change", updateMap);
  mapPartyFilter.addEventListener("change", updateMap);
  mapLabelToggle.addEventListener("click", () => {
    mapLabelsVisible = !mapLabelsVisible;
    mapLabelToggle.setAttribute("aria-pressed", String(mapLabelsVisible));
    mapLabelToggle.setAttribute("aria-label", mapLabelsVisible ? "Labels ausblenden" : "Labels anzeigen");
    mapLabelToggle.innerHTML = `<i class="bi ${mapLabelsVisible ? "bi-eye" : "bi-eye-slash"}"></i>`;
    renderMapLabels();
  });
  updateMap();
}

function getStateNameFromPath(pathElement) {
  const originalId = pathElement.id;
  pathElement.dataset.originalId = originalId;
  return STATE_NAME_BY_ID[originalId] || originalId;
}

function selectState(pathElement) {
  selectedStateNumber = Number(pathElement.dataset.stateNumber);
  zoomToState(pathElement);
}

function getMapMode() {
  return mapPartyFilter.value === "ALL" ? "winner" : "party";
}

async function updateMap() {
  const requestId = ++latestMapRequest;
  const year = mapYearFilter.value;
  const partyKey = mapPartyFilter.value;
  const mapMode = getMapMode();

  setFiltersDisabled(true);
  info.html('<i class="bi bi-hourglass-split"></i> Kartendaten werden geladen …');

  try {
    const [rows, globalMaximumPercentage] = await Promise.all([
      loadMapData(year),
      getGlobalMaximumPercentage()
    ]);
    if (requestId !== latestMapRequest) return;

    const stateRows = rows.filter((row) => (row.Zeilentyp || row.Gebietstyp) === "Bundesland");
    const rowByState = new Map(stateRows.map((row) => [row.Gebiet, row]));
    const stateMetadataList = [];

    if (rowByState.size !== 16) {
      throw new Error(`Erwartet wurden 16 Bundesländer, gefunden wurden ${rowByState.size}.`);
    }

    clearCustomMetadata();
    Object.values(stateNumberToName).forEach((stateName) => {
      const row = rowByState.get(stateName);
      if (!row) throw new Error(`Keine Daten für ${stateName} gefunden.`);

      const validVotes = getFirstNumericValue(row, VALID_SECOND_VOTE_COLUMNS);
      const winner = getStrongestParty(row, validVotes);
      const activePartyKey = mapMode === "winner" ? winner.partyKey : partyKey;
      const partyVotes = mapMode === "winner" ? winner.votes : getPartyVotes(row, partyKey, validVotes);
      const percentage = validVotes > 0 ? (partyVotes / validVotes) * 100 : 0;
      const colorScalePercentage = mapMode === "winner"
        ? 100
        : globalMaximumPercentage > 0
        ? (percentage / globalMaximumPercentage) * 100
        : 0;
      const colorVariable = mapMode === "winner"
        ? `--color-${MAP_PARTIES[activePartyKey].cssPrefix}`
        : getColorVariable(
          MAP_PARTIES[partyKey].cssPrefix,
          colorScalePercentage
        );

      setStateMetadata(stateName, {
        year: Number(year),
        mode: mapMode,
        party: MAP_PARTIES[activePartyKey].label,
        partyKey: activePartyKey,
        selectedParty: mapMode === "winner" ? "Alle" : MAP_PARTIES[partyKey].label,
        votes: partyVotes,
        validSecondVotes: validVotes,
        percentage,
        percentageFormatted: `${percentageFormatter.format(percentage)} %`,
        colorScalePercentage,
        globalMaximumPercentage,
        colorVariable,
        color: cssVar(colorVariable).trim() || statesDefault_background_colorString
      });
      stateMetadataList.push(customMetadataByNumber[stateNameToNumber[stateName]]);
    });
    renderMapLegend(stateMetadataList);

    states.each(function() {
      const number = Number(this.dataset.stateNumber);
      const metadata = customMetadataByNumber[number];
      this.customMetadata = metadata;
      this.dataset.percentage = String(metadata.percentage);
      this.setAttribute(
        "aria-label",
        metadata.mode === "winner"
          ? `${metadata.name}: stärkste Partei ${metadata.party}, ${metadata.percentageFormatted} im Jahr ${metadata.year}`
          : `${metadata.name}: ${metadata.party}, ${metadata.percentageFormatted} im Jahr ${metadata.year}`
      );
      this.querySelector("title")?.remove();
    });

    states.transition()
      .duration(250)
      .style("fill", function() {
        return customMetadataByNumber[Number(this.dataset.stateNumber)].color;
      });
    renderMapLabels();

    showMapHint();
  } catch (error) {
    console.error("Kartendaten konnten nicht geladen werden:", error);
    info.html(`
      <p class="map-error"><i class="bi bi-exclamation-triangle-fill"></i>
      Die Kartendaten konnten nicht geladen werden.</p>
    `);
  } finally {
    if (requestId === latestMapRequest) setFiltersDisabled(false);
  }
}

function loadMapData(year) {
  if (!mapDataCache.has(year)) {
    mapDataCache.set(year, d3.dsv(";", MAP_DATASETS[year]));
  }
  return mapDataCache.get(year);
}

function getGlobalMaximumPercentage() {
  if (!globalMaximumPromise) {
    globalMaximumPromise = Promise.all(
      Object.keys(MAP_DATASETS).map(async (year) => {
        const rows = await loadMapData(year);
        return rows.filter((row) => (row.Zeilentyp || row.Gebietstyp) === "Bundesland");
      })
    ).then((stateRowsByYear) => {
      const percentages = stateRowsByYear.flatMap((stateRows) =>
        stateRows.flatMap((row) => {
          const validVotes = getFirstNumericValue(row, VALID_SECOND_VOTE_COLUMNS);
          return Object.keys(MAP_PARTIES).map((partyKey) => {
            const partyVotes = getPartyVotes(row, partyKey, validVotes);
            return validVotes > 0 ? (partyVotes / validVotes) * 100 : 0;
          });
        })
      );

      return Math.max(...percentages);
    });
  }

  return globalMaximumPromise;
}

function getPartyVotes(row, partyKey, validVotes) {
  if (partyKey === "Sonstige") {
    const majorPartyVotes = ["CDU_CSU", "SPD", "GRUENE", "AfD", "FDP", "DIE_LINKE"]
      .reduce((sum, key) => sum + getPartyVotes(row, key, validVotes), 0);
    return Math.max(0, validVotes - majorPartyVotes);
  }

  return MAP_PARTIES[partyKey].columns.reduce(
    (sum, candidateColumns) => sum + getFirstNumericValue(row, candidateColumns),
    0
  );
}

function getStrongestParty(row, validVotes) {
  return Object.keys(MAP_PARTIES)
    .filter((partyKey) => partyKey !== "Sonstige")
    .map((partyKey) => ({
      partyKey,
      votes: getPartyVotes(row, partyKey, validVotes)
    }))
    .sort((a, b) => d3.descending(a.votes, b.votes))[0];
}

function getFirstNumericValue(row, candidateColumns) {
  const column = candidateColumns.find((candidate) => row[candidate] !== undefined);
  if (!column || row[column] === "") return 0;
  const value = Number(row[column]);
  return Number.isFinite(value) ? value : 0;
}

function getColorVariable(cssPrefix, colorScalePercentage) {
  const roundedToTen = Math.round(colorScalePercentage / 10) * 10;
  const shade = roundedToTen <= 0 ? 50 : roundedToTen >= 100 ? 950 : roundedToTen * 10;
  return `--${cssPrefix}-${shade}`;
}

function clearCustomMetadata() {
  Object.keys(customMetadataByNumber).forEach((number) => {
    delete customMetadataByNumber[number];
  });
}

function setStateMetadata(name, metadata) {
  const number = stateNameToNumber[name];
  if (number === undefined) throw new Error(`Bundesland in SVG nicht gefunden: ${name}`);

  customMetadataByNumber[number] = {
    name,
    number,
    ...metadata
  };
}

function getStateHoverText(metadata) {
  const voteDetail = `${numberFormatter.format(metadata.votes)} von ${numberFormatter.format(metadata.validSecondVotes)} gültigen Zweitstimmen`;
  if (metadata.mode === "winner") {
    return `${metadata.name}
Stärkste Partei: ${metadata.party}
${metadata.percentageFormatted}
${voteDetail}`;
  }

  return `${metadata.name}
${metadata.party}: ${metadata.percentageFormatted}
${voteDetail}`;
}

function showMapPopover(pathElement, event) {
  const metadata = pathElement.customMetadata;
  if (!metadata) return;

  const popover = d3.select("body").selectAll(".map-popover").data([metadata]).join("div")
    .attr("class", "map-popover")
    .style("--map-popover-color", metadata.color)
    .html(`
      <p>${escapeHtml(metadata.mode === "winner" ? "Stärkste Partei" : metadata.selectedParty)}</p>
      <strong>${escapeHtml(metadata.name)}</strong>
      <span>${escapeHtml(metadata.party)} · ${escapeHtml(metadata.percentageFormatted)}</span>
      <span>${escapeHtml(numberFormatter.format(metadata.votes))} von ${escapeHtml(numberFormatter.format(metadata.validSecondVotes))} gültigen Zweitstimmen</span>
    `);

  moveMapPopover(pathElement, event);
}

function moveMapPopover(pathElement, event) {
  const popover = d3.select(".map-popover");
  if (popover.empty()) return;

  const viewportWidth = document.documentElement.clientWidth;
  const viewportHeight = window.innerHeight;
  const popoverNode = popover.node();
  const popoverWidth = popoverNode.offsetWidth;
  const popoverHeight = popoverNode.offsetHeight;
  const pointerX = event?.clientX ?? pathElement.getBoundingClientRect().left;
  const pointerY = event?.clientY ?? pathElement.getBoundingClientRect().top;
  const xPos = Math.max(8, Math.min(viewportWidth - popoverWidth - 8, pointerX + 14));
  const yPos = Math.max(8, Math.min(viewportHeight - popoverHeight - 8, pointerY + 14));

  popover
    .style("left", `${xPos}px`)
    .style("top", `${yPos}px`);
}

function hideMapPopover() {
  d3.selectAll(".map-popover").remove();
}

function showMapHint() {
  const mapMode = getMapMode();
  const party = mapMode === "winner" ? "" : MAP_PARTIES[mapPartyFilter.value].label;
  if (mapMode === "winner") {
    info.html(`
      <p class="map-hint"><i class="bi bi-trophy-fill"></i>
      Die Karte zeigt die jeweils stärkste Partei pro Bundesland im Jahr
      <strong>${escapeHtml(mapYearFilter.value)}</strong>.</p>
      <p class="map-hint">Die Farbe entspricht der Partei, die dort den höchsten Zweitstimmenanteil erreicht.</p>
      <p class="map-hint">Klicke auf ein Bundesland, um Partei und Anteil zu sehen.</p>
    `);
    return;
  }

  info.html(`
    <p class="map-hint"><i class="bi bi-geo-alt-fill"></i>
    Die Karte zeigt den Anteil der gültigen Zweitstimmen für
    <strong>${escapeHtml(party)}</strong> im Jahr
    <strong>${escapeHtml(mapYearFilter.value)}</strong>.</p>
    <p class="map-hint">Die Farbskala ist relativ zum höchsten Wert aller Jahre und Parteien.</p>
    <p class="map-hint">Klicke auf ein Bundesland, um den exakten Wert zu sehen.</p>
  `);
}

function setFiltersDisabled(disabled) {
  mapYearFilter.disabled = disabled;
  mapPartyFilter.disabled = disabled;
  mapLabelToggle.disabled = disabled;
}

function renderMapLegend(metadataList) {
  const mapMode = getMapMode();
  if (mapMode === "winner") {
    const winners = Array.from(
      new Map(metadataList.map((metadata) => [metadata.partyKey, metadata])).values()
    ).sort((a, b) => a.party.localeCompare(b.party, "de"));

    mapLegend.html(`
      <div class="map-legend-title">Stärkste Partei</div>
      <div class="map-party-legend">
        ${winners.map((winner) => `
          <span><i style="background:${escapeHtml(winner.color)}"></i>${escapeHtml(winner.party)}</span>
        `).join("")}
      </div>
    `);
    return;
  }

  const percentages = metadataList.map((metadata) => metadata.percentage);
  const min = Math.min(...percentages);
  const max = Math.max(...percentages);
  const party = metadataList[0]?.party ?? "";
  const cssPrefix = MAP_PARTIES[mapPartyFilter.value].cssPrefix;
  const gradientStops = [50, 200, 400, 600, 800, 950]
    .map((shade) => cssVar(`--${cssPrefix}-${shade}`).trim())
    .filter(Boolean)
    .join(", ");

  mapLegend.html(`
    <div class="map-legend-title">${escapeHtml(party)}</div>
    <div class="map-gradient-legend">
      <span>${percentageFormatter.format(min)} %</span>
      <i style="background: linear-gradient(90deg, ${escapeHtml(gradientStops)})"></i>
      <span>${percentageFormatter.format(max)} %</span>
    </div>
  `);
}

function renderMapLabels() {
  if (!mapLabelLayer) return;
  if (!mapLabelsVisible) {
    mapLabelLayer.selectAll("*").remove();
    return;
  }

  const labelData = states.nodes()
    .map((node) => {
      const metadata = customMetadataByNumber[Number(node.dataset.stateNumber)];
      if (!metadata) return null;
      const bbox = node.getBBox();
      return {
        key: metadata.name,
        x: bbox.x + bbox.width / 2,
        y: bbox.y + bbox.height / 2,
        party: metadata.party,
        percentage: metadata.percentageFormatted
      };
    })
    .filter(Boolean);

  const labels = mapLabelLayer.selectAll("g.map-state-label")
    .data(labelData, (d) => d.key);

  labels.exit().remove();

  const entered = labels.enter()
    .append("g")
    .attr("class", "map-state-label");

  entered.append("text")
    .attr("class", "map-state-label-party")
    .attr("text-anchor", "middle")
    .attr("dy", "-0.15em");

  entered.append("text")
    .attr("class", "map-state-label-value")
    .attr("text-anchor", "middle")
    .attr("dy", "1.05em");

  const merged = entered.merge(labels)
    .attr("transform", (d) => `translate(${d.x},${d.y})`);

  merged.select(".map-state-label-party").text((d) => d.party);
  merged.select(".map-state-label-value").text((d) => d.percentage);
}

function zoomToState(pathElement) {
  const bbox = pathElement.getBBox();
  const scale = Math.min(
    zoom_manualMax,
    zoom_manualMin / Math.max(bbox.width / width, bbox.height / height)
  );

  svg.transition()
    .duration(zoom_autoDurationMS)
    .call(
      zoom.transform,
      d3.zoomIdentity
        .translate(width / 2, height / 2)
        .scale(scale)
        .translate(-(bbox.x + bbox.width / 2), -(bbox.y + bbox.height / 2))
    );
}

function resetZoom() {
  svg.transition()
    .duration(zoom_autoResetDurationMS)
    .call(zoom.transform, d3.zoomIdentity);
}

function zoomInMap() {
  svg.transition()
    .duration(zoom_autoDurationMS)
    .call(zoom.scaleBy, 1.45);
}

function zoomOutMap() {
  svg.transition()
    .duration(zoom_autoDurationMS)
    .call(zoom.scaleBy, 1 / 1.45);
}
