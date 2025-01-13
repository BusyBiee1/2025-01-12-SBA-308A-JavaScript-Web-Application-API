// aplhavantage api 
axios.defaults.baseURL = "https://www.alphavantage.co/query";
axios.defaults.params = {
  apikey: "TDV0MJ56NM5WABXH" // Replace with your actual API key
};

console.log(`axios is: ${axios}`);

const REFRESH_INTERVAL = 20 * 60 * 1000; // so that we can refresh every 20 minutes or change as needed

// DOM Elements
const stocksTableBody = document.getElementById("stocksTableBody");
const errorMessage = document.getElementById("errorMessage");
const fetchOnceBtn = document.getElementById("fetchOnceBtn");
const fetchEvery20Btn = document.getElementById("fetchEvery20Btn");
const statusDiv = document.createElement("div"); 
statusDiv.id = "statusDiv";
document.body.appendChild(statusDiv);




let intervalId = null; 

// show and hide Error Message
function showError(message) {
  errorMessage.textContent = message;
  errorMessage.classList.remove("hidden");
}
function hideError() {
  errorMessage.classList.add("hidden");
}

// POSTing - Buy Information to Placeholder API
async function postBuy(stock) {
  try {
    const response = await axios.post("https://jsonplaceholder.typicode.com/posts", {
      symbol: stock.symbol,
      price: stock.price,
      qty: 1,
      totalCost: stock.price,
      dateTime: new Date().toISOString(),
      action: "buy"
    });
    updateStatus(`Success: Bought 1 share of ${stock.symbol} at $${stock.price.toFixed(2)}. Response ID: ${response.data.id}`, "success");
  } catch (error) {
    updateStatus(`Error: Failed to buy 1 share of ${stock.symbol}.`, "error");
  }
}

// POSTing - Sell Information to Placeholder API
async function postSell(stock) {
  try {
    const response = await axios.post("https://jsonplaceholder.typicode.com/posts", {
      symbol: stock.symbol,
      price: stock.price,
      qty: 1,
      totalEarned: stock.price,
      dateTime: new Date().toISOString(),
      action: "sell"
    });
    updateStatus(`Success: Sold 1 share of ${stock.symbol} at $${stock.price.toFixed(2)}. Response ID: ${response.data.id}`, "success");
  } catch (error) {
    updateStatus(`Error: Failed to sell 1 share of ${stock.symbol}.`, "error");
  }
}

// Update Status Message of buy ad sell to placehodler api
function updateStatus(message, type) {
  statusDiv.textContent = message;
  statusDiv.className = type; // Assign a class for styling (e.g., "success" or "error")
}

// Do Stock Data (only some data is from API Response) 
// The API does not provide tha other important data i need so i mock or similate the data
function processStockData(data) {
  const stockDataArray = [];
  const timeSeries = data["Time Series (1min)"];

  for (const timestamp in timeSeries) {
    const stockInfo = timeSeries[timestamp];
    const stockData = {
      symbol: data["Meta Data"]["2. Symbol"],
      price: parseFloat(stockInfo["1. open"]), // data from API
      gapPercent: Math.random() * 10 - 5, 
      float: Math.random() * 500, // 
      relativeVolume: Math.random() * 1000, 
      volume: parseInt(stockInfo["5. volume"]), // data from API
      newsAlert: Math.random() > 0.5 ? "Positive" : "Negative", 
      spread: Math.random() * 5, 
      easyToBorrow: Math.random() > 0.5, 
      shortInterest: Math.random() * 50, 
      shortBorrowInterestRate: Math.random() * 10, 
      haltLevels: Math.random() * 5 
    };
    stockDataArray.push(stockData);

    if (stockDataArray.length >= 10) break; // only the 10 stocks
  }

  return stockDataArray;
}

// Populate Table with Stocks Data
function populateStocksTable(stocks) {
  stocksTableBody.innerHTML = ""; 

  stocks.forEach((stock) => {
    const row = document.createElement("tr");

    row.innerHTML = `
      <td>${stock.symbol}</td>
      <td>${stock.gapPercent.toFixed(2)}%</td>
      <td>$${stock.price.toFixed(2)}</td>
      <td>${stock.float.toFixed(2)}M</td>
      <td>${stock.relativeVolume.toFixed(2)}%</td>
      <td>${stock.volume}</td>
      <td>${stock.newsAlert}</td>
      <td>${stock.spread.toFixed(2)}</td>
      <td>${stock.easyToBorrow ? "Yes" : "No"}</td>
      <td>${stock.shortInterest.toFixed(2)}%</td>
      <td>${stock.shortBorrowInterestRate.toFixed(2)}%</td>
      <td>${stock.haltLevels.toFixed(2)}</td>
      <td><button class="buy-btn">Buy 1</button></td>
      <td><button class="sell-btn">Sell 1</button></td>
    `;

    // customize some stocks as per their data
    if (stock.price < 1) {
      row.style.backgroundColor = "lightgray";
    } else if (stock.float < 20 && stock.price >= 2 && stock.price <= 20 && stock.relativeVolume > 500) {
      row.style.fontWeight = "bold";
    }

    // Event Listeners for Buy/Sell Buttons
    const buyBtn = row.querySelector(".buy-btn");
    buyBtn.addEventListener("click", () => postBuy(stock));

    const sellBtn = row.querySelector(".sell-btn");
    sellBtn.addEventListener("click", () => postSell(stock));

    stocksTableBody.appendChild(row);
  });
}

// Fetch Stock Data
async function fetchStocksData(symbol) {
  hideError();
  try {
    const response = await axios.get("", {
      params: {
        function: "TIME_SERIES_INTRADAY",
        interval: "1min",
        symbol: symbol
      }
    });

    const data = response.data;
    if (!data || !data["Time Series (1min)"]) {
      throw new Error("Invalid or empty data.");
    }

    const processedData = processStockData(data);
    populateStocksTable(processedData);
  } catch (error) {
    console.error("Error fetching stocks data:", error);
    showError("Failed to fetch stock data. Please try again later.");
  }
}

// Event Listeners for the onetime click button or get repeatedly
fetchOnceBtn.addEventListener("click", () => {
  if (intervalId) clearInterval(intervalId); 
  fetchStocksData("MSFT"); 
});
fetchEvery20Btn.addEventListener("click", () => {
  if (intervalId) clearInterval(intervalId); 
  fetchStocksData("MSFT"); 
  intervalId = setInterval(() => fetchStocksData("MSFT"), REFRESH_INTERVAL); 
});
