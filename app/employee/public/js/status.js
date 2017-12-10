/* eslint-disable */

Chart.defaults.global.defaultFontSize = 8;
Chart.defaults.global.animation.duration = 500;
Chart.defaults.global.legend.display = false;
Chart.defaults.global.elements.line.backgroundColor = 'rgba(0,0,0,0)';
Chart.defaults.global.elements.line.borderColor = 'rgba(0,0,0,0.9)';
Chart.defaults.global.elements.line.borderWidth = 2;

const socket = io(`${location.protocol}//${location.hostname}:${port || location.port}`);
const defaultSpan = 0;
const spans = [];
const statusCodesColors = ['#75D701', '#47b8e0', '#ffc952', '#E53A40'];

const defaultDataset = {
  label: '',
  data: [],
  lineTension: 0.2,
  pointRadius: 0
};

const defaultOptions = {
  scales: {
    yAxes: [{
      ticks: {
        beginAtZero: true
      }
    }],
    xAxes: [{
      type: 'time',
      time: {
        unitStepSize: 30
      },
      gridLines: {
        display: false
      }
    }]
  },
  tooltips: {
    enabled: false
  },
  responsive: true,
  maintainAspectRatio: false,
  animation: false
};

const createChart = function (ctx, dataset) {
  return new Chart(ctx, {
    type: 'line',
    data: {
      labels: [],
      datasets: dataset
    },
    options: defaultOptions
  });
};

const addTimestamp = function (point) {
  return point.timestamp;
};

const cpuDataset = [Object.create(defaultDataset)];
const memDataset = [Object.create(defaultDataset)];
const responseTimeDataset = [Object.create(defaultDataset)];
const rpsDataset = [Object.create(defaultDataset)];

const cpuStat = document.getElementById('cpuStat');
const memStat = document.getElementById('memStat');
const responseTimeStat = document.getElementById('responseTimeStat');
const rpsStat = document.getElementById('rpsStat');

const cpuChartCtx = document.getElementById('cpuChart');
const memChartCtx = document.getElementById('memChart');
const responseTimeChartCtx = document.getElementById('responseTimeChart');
const rpsChartCtx = document.getElementById('rpsChart');
const statusCodesChartCtx = document.getElementById('statusCodesChart');

const cpuChart = createChart(cpuChartCtx, cpuDataset);
const memChart = createChart(memChartCtx, memDataset);
const responseTimeChart = createChart(responseTimeChartCtx, responseTimeDataset);
const rpsChart = createChart(rpsChartCtx, rpsDataset);
const statusCodesChart = new Chart(statusCodesChartCtx, {
  type: 'line',
  data: {
    labels: [],
    datasets: [
      Object.create(defaultDataset),
      Object.create(defaultDataset),
      Object.create(defaultDataset),
      Object.create(defaultDataset)
    ]
  },
  options: defaultOptions
});

statusCodesChart.data.datasets.forEach((dataset, index) => {
  dataset.borderColor = statusCodesColors[index];
});

const charts = [cpuChart, memChart, responseTimeChart, rpsChart, statusCodesChart];

socket.on('esm_start', (data) => {
  // Remove last element of Array because it contains malformed responses data.
  // To keep consistency we also remove os data.
  data.responses.pop();
  data.os.pop();

  const lastOsMetric = data.os[data.os.length - 1];

  cpuStat.textContent = '0.0%';
  if (lastOsMetric) {
    cpuStat.textContent = `${lastOsMetric.cpu.toFixed(1)}%`;
  }

  cpuChart.data.datasets[0].data = data.os.map(point => point.cpu);
  cpuChart.data.labels = data.os.map(addTimestamp);

  memStat.textContent = '0.0MB';
  if (lastOsMetric) {
    memStat.textContent = `${lastOsMetric.memory.toFixed(1)}MB`;
  }

  memChart.data.datasets[0].data = data.os.map(point => point.memory);
  memChart.data.labels = data.os.map(addTimestamp);

  const lastResponseMetric = data.responses[data.responses.length - 1];

  responseTimeStat.textContent = '0.00ms';
  if (lastResponseMetric) {
    responseTimeStat.textContent = `${lastResponseMetric.mean.toFixed(2)}ms`;
  }

  responseTimeChart.data.datasets[0].data = data.responses.map(point => point.mean);
  responseTimeChart.data.labels = data.responses.map(addTimestamp);

  for (var i = 0; i < 4; i += 1) {
    statusCodesChart.data.datasets[i].data = data.responses.map(point => point[i + 2]);
  }
  statusCodesChart.data.labels = data.responses.map(addTimestamp);

  if (data.responses.length >= 2) {
    let deltaTime = lastResponseMetric.timestamp -
      data.responses[data.responses.length - 2].timestamp;

    if (deltaTime < 1) deltaTime = 1000;
    rpsStat.textContent = ((lastResponseMetric.count / deltaTime) * 1000).toFixed(2);
    rpsChart.data.datasets[0].data = data.responses.map(point => (point.count / deltaTime) * 1000);
    rpsChart.data.labels = data.responses.map(addTimestamp);
  }

  charts.forEach((chart) => {
    chart.update();
  });

  if (data.length !== spans.length) {
    spans.push({
      retention: data.retention,
      interval: data.interval
    });
  }
});

socket.on('esm_stats', (data) => {
  if (data.retention === spans[defaultSpan].retention &&
    data.interval === spans[defaultSpan].interval) {
    const os = data.os;
    const responses = data.responses;

    cpuStat.textContent = '0.0%';
    if (os) {
      cpuStat.textContent = `${os.cpu.toFixed(1)}%`;
      cpuChart.data.datasets[0].data.push(os.cpu);
      cpuChart.data.labels.push(os.timestamp);
    }

    memStat.textContent = '0.0MB';
    if (os) {
      memStat.textContent = `${os.memory.toFixed(1)}MB`;
      memChart.data.datasets[0].data.push(os.memory);
      memChart.data.labels.push(os.timestamp);
    }

    responseTimeStat.textContent = '0.00ms';
    if (responses) {
      responseTimeStat.textContent = `${responses.mean.toFixed(2)}ms`;
      responseTimeChart.data.datasets[0].data.push(responses.mean);
      responseTimeChart.data.labels.push(responses.timestamp);
    }

    if (responses) {
      let deltaTime = responses.timestamp - rpsChart.data.labels[rpsChart.data.labels.length - 1];

      if (deltaTime < 1) deltaTime = 1000;
      rpsStat.textContent = ((responses.count / deltaTime) * 1000).toFixed(2);
      rpsChart.data.datasets[0].data.push((responses.count / deltaTime) * 1000);
      rpsChart.data.labels.push(responses.timestamp);
    }

    if (responses) {
      for (let i = 0; i < 4; i += 1) {
        statusCodesChart.data.datasets[i].data.push(data.responses[i + 2]);
      }
      statusCodesChart.data.labels.push(data.responses.timestamp);
    }

    charts.forEach((chart) => {
      if (spans[defaultSpan].retention < chart.data.labels.length) {
        chart.data.datasets.forEach((dataset) => {
          dataset.data.shift();
        });

        chart.data.labels.shift();
      }
      chart.update();
    });
  }
});
