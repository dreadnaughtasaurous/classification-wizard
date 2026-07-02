/**
 * Classification Wizard — radar chart helper
 * Thin wrapper around Chart.js (loaded via CDN in index.html) so app.js
 * doesn't need to know Chart.js's API directly. Colours are read from
 * the page's CSS custom properties so the chart matches the active theme.
 */

const ChartHelper = (function () {
  let chartInstance = null;

  function cssVar(name) {
    return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  }

  /**
   * domainScores: { KSE, PSJ, AA, LTM, CII, OIS } each 0-100
   * domainLabels: { KSE: 'Knowledge, Skills & Experience', ... }
   */
  function renderRadar(canvasEl, domainScores, domainOrder, domainLabels) {
    if (!canvasEl || typeof Chart === 'undefined') return null;

    if (chartInstance) {
      chartInstance.destroy();
      chartInstance = null;
    }

    const brand = cssVar('--color-brand') || '#3451b2';
    const text = cssVar('--color-text') || '#3c3c43';
    const divider = cssVar('--color-divider') || '#e2e2e3';

    const labels = domainOrder.map((d) => domainLabels[d].code);
    const data = domainOrder.map((d) => domainScores[d]);

    chartInstance = new Chart(canvasEl, {
      type: 'radar',
      data: {
        labels,
        datasets: [
          {
            label: 'Domain score',
            data,
            backgroundColor: hexToRgba(brand, 0.18),
            borderColor: brand,
            borderWidth: 2,
            pointBackgroundColor: brand,
            pointBorderColor: '#fff',
            pointHoverRadius: 5,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        animation: { duration: 400 },
        scales: {
          r: {
            min: 0,
            max: 100,
            ticks: { stepSize: 25, color: text, backdropColor: 'transparent', font: { size: 10 } },
            grid: { color: divider },
            angleLines: { color: divider },
            pointLabels: { color: text, font: { size: 12, weight: '600' } },
          },
        },
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (ctx) => `${domainLabels[domainOrder[ctx.dataIndex]].name}: ${ctx.formattedValue}/100`,
            },
          },
        },
      },
    });

    return chartInstance;
  }

  function destroy() {
    if (chartInstance) {
      chartInstance.destroy();
      chartInstance = null;
    }
  }

  function hexToRgba(hex, alpha) {
    const clean = hex.replace('#', '');
    const bigint = parseInt(clean.length === 3 ? clean.split('').map((c) => c + c).join('') : clean, 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }

  return { renderRadar, destroy };
})();
