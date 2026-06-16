const width = 591.504;
const height = 800.504;

const zoom_manualMin = 0.75;
const zoom_manualMax = 9;
const zoom_autoDurationMS = 750;
const zoom_autoResetDurationMS = 750;

const statesDefault_outline_colorString = '#555';
const statesDefault_outline_strokeWidth = 0.6;
const statesDefault_background_colorString = '#ddd';

const svg = d3.select("#Bundesrepublik_Deutschland");
const g = d3.select("#g1923");
const info = d3.select("#info");

const stateNumberToName = {};
const stateNameToNumber = {};
const customMetadataByNumber = {};

const OUTLINE_PATH_ID = "path3789";
const STATE_NAME_BY_ID = {
  "Baden__x26__Württemberg": "Baden-Württemberg"
};

const zoom = d3.zoom()
  .scaleExtent([zoom_manualMin, zoom_manualMax])
  .on("zoom", event => {
    g.attr("transform", event.transform);
  });

svg.call(zoom);

svg.on("click", () => {
  resetZoom();
  info.html("Klicke auf ein Bundesland.");
});

initMap();

function initMap() {
  svg
    .attr("width", 900)
    .attr("height", 700)
    .attr("viewBox", `0 0 ${width} ${height}`);

  const states = g.selectAll("path")
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
      .attr("id", `state-${index}`);
  });

  /* ---------- EDIT CUSTOM DATA HERE ---------- */
  /* ---------- EDIT CUSTOM DATA HERE ---------- */
  /* ---------- EDIT CUSTOM DATA HERE ---------- */

  let customMetadata = [
    /* [ Bundesland Name,          Hex-Farbe, Kategorie,        Notizen ] */
    ["Berlin",                    "#ffcc66", "Capital",        "Custom metadata for Berlin."],
    ["Hamburg",                   "#99dd99", "City state",     "Custom metadata for Hamburg."],
    ["Bayern",                    "#66ccff", "Large state",    "Custom metadata for Bayern."],
    ["Baden-Württemberg",         "#fed500", "Example state",  "Custom metadata for Baden-Württemberg."]
  ];

  /* ---------- EDIT CUSTOM DATA HERE ---------- */
  /* ---------- EDIT CUSTOM DATA HERE ---------- */
  /* ---------- EDIT CUSTOM DATA HERE ---------- */

  customMetadata.forEach(item => {
    setStateMetadata(item[0], {
      color: item[1],
      category: item[2],
      notes: item[3]
    });
  });

  states
    .style("fill", function() {
      const number = Number(this.dataset.stateNumber);
      return customMetadataByNumber[number]?.color || statesDefault_background_colorString;
    })
    .style("stroke", statesDefault_outline_colorString)
    .style("stroke-width", statesDefault_outline_strokeWidth)
    .style("stroke-linejoin", "round")
    .on("click", function(event) {
      event.stopPropagation();

      const number = Number(this.dataset.stateNumber);
      const originalMetadata = {
        originalSvgId: this.dataset.originalId,
        currentSvgId: this.id,
        name: this.dataset.stateName,
        number
      };

      console.log("Original SVG metadata:", originalMetadata);
      console.log("Custom:", customMetadataByNumber[number]);

      zoomToState(this);
      showStateInfo(number, originalMetadata);
    });

  g.selectAll("path")
    .filter(function() {
      return (this.dataset.originalId || this.id) === OUTLINE_PATH_ID;
    })
    .style("pointer-events", "none");

  console.table(
    Object.entries(stateNumberToName).map(([number, name]) => ({
      number,
      name
    }))
  );

  console.log("stateNumberToName:", stateNumberToName);
  console.log("stateNameToNumber:", stateNameToNumber);
  console.log("customMetadataByNumber:", customMetadataByNumber);
}

function getStateNameFromPath(pathElement) {
  const originalId = pathElement.id;
  pathElement.dataset.originalId = originalId;

  return STATE_NAME_BY_ID[originalId] || originalId;
}

function setStateMetadata(name, metadata) {
  const number = stateNameToNumber[name];

  if (number === undefined) {
    console.warn(
      `Federal state not found: "${name}". Check spelling. Available names are:`,
      Object.keys(stateNameToNumber)
    );

    return;
  }

  customMetadataByNumber[number] = {
    name,
    number,
    ...metadata
  };
}

function zoomToState(pathElement) {
  const bbox = pathElement.getBBox();
  const scale = Math.min(
    zoom_manualMax,
    zoom_manualMin / Math.max(
      bbox.width / width,
      bbox.height / height
    )
  );

  svg.transition()
    .duration(zoom_autoDurationMS)
    .call(
      zoom.transform,
      d3.zoomIdentity
        .translate(width / 2, height / 2)
        .scale(scale)
        .translate(
          -(bbox.x + bbox.width / 2),
          -(bbox.y + bbox.height / 2)
        )
    );
}

function resetZoom() {
  svg.transition()
    .duration(zoom_autoResetDurationMS)
    .call(zoom.transform, d3.zoomIdentity);
}

function showStateInfo(number, originalMetadata) {
  const custom = customMetadataByNumber[number] || {};

  info.html(`
    <h3>${escapeHtml(stateNumberToName[number])}</h3>

    <h4>Custom Metadata</h4>
    <pre>${escapeHtml(JSON.stringify(custom, null, 2))}</pre>

    <h3>Original SVG Metadata</h3>
    <pre>${escapeHtml(JSON.stringify(originalMetadata, null, 2))}</pre>
  `);
}
