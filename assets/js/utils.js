let numberFormatter = new Intl.NumberFormat("de-DE");
let percentageFormatter = new Intl.NumberFormat("de-DE", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 4
});

const getID = s => document.getElementById(s);
const getAll = s => document.querySelectorAll(s);

function escapeHtml(value) {
    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

function cssVar(s) {
    return getComputedStyle(document.documentElement).getPropertyValue(s);
}

console.log('utils.js loaded and executed');
