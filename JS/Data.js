//Artemis API
const artemisGetter = {
  method: "GET",
  url: "https://api.artemisxyz.com/asset",
  params: { APIKey: "" },
  headers: { Accept: "application/json" },
};
let index = 1;
const settings = {
  method: "GET",
  url: "https://api.artemisxyz.com/data/7D_PRICE_CHG_PCT",
  params: {
    artemisIds: "",
    summarize: "",
    APIKey: "",
  },
  headers: { Accept: "application/json" },
};
axios
  .request(artemisGetter)
  .then((response) => {
    const artemisIDs = displayArtemis(response);
    if (artemisIDs) {
      settings.params.artemisIds = artemisIDs;
      return axios.request(settings);
    } else {
      throw new Error("No valid artemisIds returned from the first request.");
    }
  })
  .then((response) => {
    console.log(response.data);
    displayArtemisData(response.data);
  })
  .catch((error) => {
    console.log(error);
  });

const options = {
  method: "GET",
  url: "https://api.coingecko.com/api/v3/asset_platforms",
  headers: {
    accept: "application/json",
    "x-cg-demo-api-key": "CG-9iksxDgFSEe3FmXAqhoBb8R3",
  },
};
let coingecko = [];
axios
  .request(options)
  .then(function (response) {
    coingecko = response.data;
    console.log(coingecko);
  })
  .catch(function (error) {
    console.error(error);
  });
const displayArtemis = (response) => {
  let result = "";
  const artemisArr = response.data.assets;
  artemisArr.forEach((data) => {
    result += data.artemis_id + ",";
  });
  return result.slice(0, -1);
};

const displayArtemisData = (response) => {
  const filteredSortedData = Object.entries(response.data.artemis_ids)
    .filter(([key, value]) => typeof value["7D_PRICE_CHG_PCT"] === "number")
    .sort((a, b) => b[1]["7D_PRICE_CHG_PCT"] - a[1]["7D_PRICE_CHG_PCT"]);
  const tableBody = document.getElementById("crypto-table");
  let tablRows = "";
  filteredSortedData
    .slice(0, 10)
    .forEach(([name, { "7D_PRICE_CHG_PCT": changePct }], index) => {
      let thumbURL = "";
      coingecko.forEach((data) => {
        if (data.id.includes(name)) {
          thumbURL = data.image.small;
          return;
        }
      });
      let period = thumbURL
        ? `<img src="https://cors-anywhere.herokuapp.com/${thumbURL}" crossorigin="anonymous"  style="border-radius:50%; ">`
        : name;

      const changeClass = changePct >= 0 ? "text-success" : "text-danger";
      tablRows += `<tr class="text-center align-middle fw-bold fs-3">
                    <td >${index + 1}</td>
                    <td class="text-start  ps-5">
                    ${period}
                    </td>
                    <td class="${changeClass}">
                    ${
                      changePct.toFixed(4) * 100 > 0
                        ? `+` + changePct.toFixed(4) * 100
                        : changePct.toFixed(4) * 100
                    }%
                    </td>
                    </tr>`;
      tableBody.innerHTML = tablRows;
    });
};
const btnDownload = document.getElementById("download-btn");
btnDownload.addEventListener("click", function () {
  btnDownload.style.visibility = "hidden";
  const table = document.querySelector(".body-picture");

  html2canvas(table, {
    useCORS: true,
  })
    .then(function (canvas) {
      let link = document.createElement("a");
      link.href = canvas.toDataURL("image/png");
      link.download = "table.png";
      link.click();
    })
    .finally(() => {
      btnDownload.style.visibility = "visible";
    });
});
