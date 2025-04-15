import { getHistory } from './storage.js';

let chartInstance = null;
let latestData = null;

function getCSSVar(name) {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

export function renderChart() {
  const history = getHistory();
  const hasData = history.length > 0;

  const labels = hasData ? history.map((r, i) => `Test ${i + 1}`) : ['No Data'];
  const wpms = hasData ? history.map(r => r.wpm) : [null];
  const accs = hasData ? history.map(r => r.accuracy) : [null];

  const ctx = document.getElementById('chart');
  if (!ctx) return;

  latestData = { labels, wpms, accs };

  if (chartInstance) {
    chartInstance.destroy();
  }

  const styles = getComputedStyle(document.documentElement);
  const textColor = styles.getPropertyValue('--chart-text-color').trim();
  const wpmLine = styles.getPropertyValue('--wpm-line').trim();
  const accLine = styles.getPropertyValue('--acc-line').trim();

  chartInstance = new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [
        {
          label: 'WPM',
          data: wpms,
          borderColor: wpmLine,
          backgroundColor: wpmLine + '33',
          yAxisID: 'y1',
          tension: 0.4,
          pointRadius: hasData ? 4 : 0,
          fill: true
        },
        {
          label: 'Accuracy (%)',
          data: accs,
          borderColor: accLine,
          backgroundColor: accLine + '33',
          yAxisID: 'y2',
          tension: 0.4,
          pointRadius: hasData ? 4 : 0,
          fill: true
        }
      ]
    },
    options: {
      responsive: true,
      interaction: {
        mode: 'index',
        intersect: false
      },
      stacked: false,
      scales: {
        y1: {
          type: 'linear',
          position: 'left',
          beginAtZero: true,
          title: {
            display: true,
            text: 'WPM',
            color: textColor
          },
          ticks: { color: textColor }
        },
        y2: {
          type: 'linear',
          position: 'right',
          beginAtZero: true,
          title: {
            display: true,
            text: 'Accuracy (%)',
            color: textColor
          },
          ticks: { color: textColor },
          grid: {
            drawOnChartArea: false
          }
        }
      },
      plugins: {
        legend: {
          labels: {
            color: textColor
          }
        },
        tooltip: {
          enabled: hasData,
          callbacks: {
            label: (context) => `${context.dataset.label}: ${context.parsed.y}`
          }
        }
      }
    }
  });
}

export function refreshChartTheme() {
  if (!latestData || !chartInstance) return;
  renderChart();
}
