const artemisGetter = {
  method: "GET",
  url: "https://api.artemisxyz.com/asset",
  params: { APIKey: "" },
  headers: { Accept: "application/json" },
};

const SETTINGS = {
  method: "GET",
  url: "",
  params: { APIKey: "" },
  headers: { Accept: "application/json" },
};

const CHARTS = {
  method: "GET",
  url: "https://api.artemisxyz.com/data/",
  params: {
    artemisIds: "",
    startDate: "2024-09-09",
    endDate: "2024-10-09",
    summarize: "false",
    APIKey: "",
  },
  headers: { Accept: "application/json" },
};

axios.request(artemisGetter).then((response) => {
  const dataArr = displayArtemis(response);
  if (dataArr) {
    appendData(dataArr);
  } else {
    throw new Error("No valid artemisIds returned from the first request.");
  }
});

const displayArtemis = (response) => {
  let result = [];
  const artemisArr = response.data.assets;
  artemisArr.forEach((data) => {
    result.push(data.artemis_id);
  });
  // console.log(result);
  return result;
};

const appendData = (arr) => {
  const list = document.getElementById("assets");
  list.innerHTML = "";
  arr.forEach((data) => {
    const li = document.createElement("li");
    li.textContent = data;
    li.addEventListener("click", () => {
      const req = `https://api.artemisxyz.com/asset/${data}/metric`;
      SETTINGS.url = req;
      CHARTS.params.artemisIds = data;
      axios
        .request(SETTINGS)
        .then((response) => {
          console.log(response.data); // Handle any errors.
          metricsData(response.data, data);
        })
        .catch((error) => {
          console.error("Error fetching data for asset:", data, error); // Handle any errors.
        });
    });
    list.appendChild(li);
  });
};
const metricsData = (metricsArray, name) => {
  const metricsUL = document.getElementById("metrics");
  metricsUL.innerHTML = "";
  metricsArray.metrics.forEach((data) => {
    const li = document.createElement("li");
    li.textContent = data;
    li.addEventListener("click", () => {
      CHARTS.url = `https://api.artemisxyz.com/data/${data}`;
      axios
        .request(CHARTS)
        .then((response) => {
          const artemisIds = response.data.data.artemis_ids; // Access artemis_ids
          const ethereumPrices = artemisIds[name]?.[data]; // Optional chaining
          const errorTag = document.getElementById("noDataMessage");
          myChart.data.labels = [];
          myChart.data.datasets[0].data = [];
          console.log(artemisIds[name]?.[data]);
          if (ethereumPrices !== "Metric not found.") {
            errorTag.style.display = "none";
            ethereumPrices.forEach((value) => {
              myChart.data.labels.push(value.date);
              myChart.data.datasets[0].data.push(value.val);
            });
            myChart.data.datasets[0].label = name;
            myChart.update();
          } else {
            errorTag.style.display = "block";
            console.error(`No price data found for ${name}`);
          }
          console.log(myChart.data);
        })
        .catch((error) => {
          console.error("Error fetching data:", error);
        });
    });
    metricsUL.appendChild(li);
  });
};
const searchAssets = (inputID, listID) => {
  let input = document.getElementById(inputID).value.toLowerCase();
  const ul = document.getElementById(listID);
  const li = ul.querySelectorAll("li");
  li.forEach((text) => {
    if (text) {
      const asset = text.textContent.toLowerCase();
      text.style.display = asset.includes(input) ? "" : "none";
    }
  });
};

const ctx = document.getElementById("myChart").getContext("2d");
// Create a new Chart instance
const myChart = new Chart(ctx, {
  type: "bar", // Chart type: bar, line, pie, etc.
  data: {
    labels: [], // Labels for the x-axis
    datasets: [
      {
        label: "Sales Data",
        data: [], // Data for the chart (y-axis values)
        backgroundColor: [
          "rgba(255, 99, 132, 0.5)",
          // "rgba(54, 162, 235, 0.2)",
          // "rgba(255, 206, 86, 0.2)",
          // "rgba(75, 192, 192, 0.2)",
          // "rgba(153, 102, 255, 0.2)",
        ],
        borderColor: [
          "rgba(255, 99, 132, 1)",
          // "rgba(54, 162, 235, 1)",
          // "rgba(255, 206, 86, 1)",
          // "rgba(75, 192, 192, 1)",
          // "rgba(153, 102, 255, 1)",
        ],
        borderWidth: 2, // Border width for bars
      },
    ],
  },
  options: {
    responsive: true,
    scales: {
      y: {
        beginAtZero: true, // Ensure y-axis starts at 0
        ticks: {
          color: "rgb(238, 238, 238)", // Change font color for Y-axis labels
          font: {
            size: 16, // Change font size for Y-axis labels
          },
        },
        grid: {
          color: "rgb(238, 238, 238)", // Change color of X-axis grid lines
          lineWidth: 1, // Change grid line width for X-axis
        },
      },
      x: {
        ticks: {
          color: "rgb(238, 238, 238)", // Change font color for Y-axis labels
          font: {
            size: 16, // Change font size for Y-axis labels
          },
        },
        grid: {
          color: "rgb(238, 238, 238)", // Change color of X-axis grid lines
          lineWidth: 1, // Change grid line width for X-axis
        },
      },
    },
    plugins: {
      legend: {
        labels: {
          font: {
            size: 30, // Change font size for the legend
            color: "rgb(238, 238, 238)",
          },
        },
      },
      title: {
        display: true,
        text: "Custom Chart Title",
        color: "rgb(238, 238, 238)", // Change font color for the title
        font: {
          size: 20, // Change font size for the title
          family: "Arial", // You can specify a font family
        },
      },
      tooltip: {
        titleFont: {
          size: 16, // Change font size for tooltip title
          family: "Verdana", // Change font family for tooltip title
        },
        bodyFont: {
          size: 14, // Change font size for tooltip body
          color: "rgb(238, 238, 238)", // Not directly available, but can style tooltip using CSS
        },
      },
    },
  },
});
