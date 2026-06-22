console.log('utils.js loaded');
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


document.querySelectorAll('.sources .entries .descr').forEach(el => {
    el.setAttribute('title', el.textContent);
    el.textContent = `${el.textContent.slice(0, 40)}${el.textContent.length > 40?'…':''}`;
});
