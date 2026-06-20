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
const mapYearFilter = document.getElementById("mapYearFilter");
const mapPartyFilter = document.getElementById("mapPartyFilter");

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
    })
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

  mapYearFilter.addEventListener("change", updateMap);
  mapPartyFilter.addEventListener("change", updateMap);
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
  showStateInfo(selectedStateNumber);
}

async function updateMap() {
  const requestId = ++latestMapRequest;
  const year = mapYearFilter.value;
  const partyKey = mapPartyFilter.value;

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

    if (rowByState.size !== 16) {
      throw new Error(`Erwartet wurden 16 Bundesländer, gefunden wurden ${rowByState.size}.`);
    }

    clearCustomMetadata();
    Object.values(stateNumberToName).forEach((stateName) => {
      const row = rowByState.get(stateName);
      if (!row) throw new Error(`Keine Daten für ${stateName} gefunden.`);

      const validVotes = getFirstNumericValue(row, VALID_SECOND_VOTE_COLUMNS);
      const partyVotes = getPartyVotes(row, partyKey, validVotes);
      const percentage = validVotes > 0 ? (partyVotes / validVotes) * 100 : 0;
      const colorScalePercentage = globalMaximumPercentage > 0
        ? (percentage / globalMaximumPercentage) * 100
        : 0;
      const colorVariable = getColorVariable(
        MAP_PARTIES[partyKey].cssPrefix,
        colorScalePercentage
      );

      setStateMetadata(stateName, {
        year: Number(year),
        party: MAP_PARTIES[partyKey].label,
        partyKey,
        votes: partyVotes,
        validSecondVotes: validVotes,
        percentage,
        percentageFormatted: `${percentageFormatter.format(percentage)} %`,
        colorScalePercentage,
        globalMaximumPercentage,
        colorVariable,
        color: cssVar(colorVariable).trim() || statesDefault_background_colorString
      });
    });

    states.each(function() {
      const number = Number(this.dataset.stateNumber);
      const metadata = customMetadataByNumber[number];
      this.customMetadata = metadata;
      this.dataset.percentage = String(metadata.percentage);
      this.setAttribute(
        "aria-label",
        `${metadata.name}: ${metadata.party}, ${metadata.percentageFormatted} im Jahr ${metadata.year}`
      );

      let title = this.querySelector("title");
      if (!title) {
        title = document.createElementNS("http://www.w3.org/2000/svg", "title");
        this.prepend(title);
      }
      title.textContent = `${metadata.name}: ${metadata.percentageFormatted}`;
    });

    states.transition()
      .duration(250)
      .style("fill", function() {
        return customMetadataByNumber[Number(this.dataset.stateNumber)].color;
      });

    if (selectedStateNumber === null) showMapHint();
    else showStateInfo(selectedStateNumber);
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

function showMapHint() {
  const party = MAP_PARTIES[mapPartyFilter.value].label;
  info.html(`
    <p class="map-hint"><i class="bi bi-geo-alt-fill"></i>
    Die Karte zeigt den Anteil der gültigen Zweitstimmen für
    <strong>${escapeHtml(party)}</strong> im Jahr
    <strong>${escapeHtml(mapYearFilter.value)}</strong>.</p>
    <p class="map-hint">Die Farbskala ist relativ zum höchsten Wert aller Jahre und Parteien.</p>
    <p class="map-hint">Klicke auf ein Bundesland, um den exakten Wert zu sehen.</p>
  `);
}

function showStateInfo(number) {
  const custom = customMetadataByNumber[number];
  if (!custom) return;

  info.html(`
    <article class="map-result" style="--map-result-color: ${escapeHtml(custom.color)}">
      <h3>${escapeHtml(custom.name)}</h3>
      <p class="map-percentage">${escapeHtml(custom.percentageFormatted)}</p>
      <p><strong>${escapeHtml(custom.party)}</strong> · Zweitstimmen ${custom.year}</p>
      <p class="map-result-detail">
        ${numberFormatter.format(custom.votes)} von
        ${numberFormatter.format(custom.validSecondVotes)} gültigen Zweitstimmen
      </p>
    </article>
  `);
}

function setFiltersDisabled(disabled) {
  mapYearFilter.disabled = disabled;
  mapPartyFilter.disabled = disabled;
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

console.log("map.js loaded and executed");
