const errorMsg = document.getElementById("error-msg");
// handle error messages
const displayError = (message) => {
  errorMsg.style.display = "block";
  errorMsg.textContent = message;
};
const removeError = () => {
  errorMsg.style.display = "none";
  errorMsg.textContent = "";
};

// update html based on data received from openweathermap.org API
const displayWeather = (data) => {
  const tempInfoDiv = document.getElementById("temp-info");
  const weatherInfoDiv = document.getElementById("weather-info");
  const weatherIcon = document.getElementById("weather-icon");
  const hourlyForecastDiv = document.getElementById("hourly-forecast");

  // clear previous content
  weatherInfoDiv.innerHTML = "";
  hourlyForecastDiv.innerHTML = "";
  tempInfoDiv.innerHTML = "";

  // check if received data contains an error code
  if (data.cod === "404") {
    displayError(data.message[0].toUpperCase() + data.message.slice(1));
    // remove weather icon
    weatherIcon.style.display = "none";
  } else {
    // remove error message
    removeError();
    // extract any relevant information from the data
    const cityName = data.name + ", " + data.sys.country;
    const countryFlagURL = `https://openweathermap.org/images/flags/${data.sys.country.toLowerCase()}.png`;
    // convert temperature to Celcius
    const tempCelsius = Math.round(data.main.temp - 273.15);
    // const description = data.weather[0].description[0].toUpperCase() + data.weather[0].description.slice(1);
    const iconCode = data.weather[0].icon;

    const description = iconCode.includes("n")
      ? data.weather[0].description[0].toUpperCase() +
        data.weather[0].description.slice(1) +
        " (night)"
      : data.weather[0].description[0].toUpperCase() +
        data.weather[0].description.slice(1);

    const iconURL = `https://openweathermap.org/img/wn/${iconCode}@4x.png`;

    // create new elements to display the data
    const temperatureHTML = `
      <p>${tempCelsius}°C</p>
    `;

    const weatherHTML = `
      <p>${cityName}</p>
      <img src="${countryFlagURL}" alt="Country Flag">
      <p>${description}</p>
    `;

    tempInfoDiv.innerHTML = temperatureHTML;
    weatherInfoDiv.innerHTML = weatherHTML;
    weatherIcon.src = iconURL;
    weatherIcon.alt = description;

    // make the weather icon visible
    weatherIcon.style.display = "block";
  }
};

const displayHourlyForecast = (hourlyData) => {
  const hourlyForecastDiv = document.getElementById("hourly-forecast");
  // slice the 24 hours data into 3-hour intervals
  const next24Hours = hourlyData.slice(0, 8);

  // iterate over each 3-hour interval and create html to display the data
  next24Hours.forEach((item) => {
    const dateTime = new Date(item.dt * 1000);
    const hour = dateTime.getHours();
    // convert temperature to Celcius
    const temperature = Math.round(item.main.temp - 273.15);
    const iconCode = item.weather[0].icon;
    const iconURL = `https://openweathermap.org/img/wn/${iconCode}.png`;

    const hourlyItemHTML = `
            <div class="hourly-item">
                <span>${hour}:00</span>
                <img src="${iconURL}" alt="Hourly Weather Icon">
                <span>${temperature}°C</span>
            </div>
        `;
    // append each of the new html strings to the hourly forecast div
    hourlyForecastDiv.innerHTML += hourlyItemHTML;
  });
};

// get weather data on button click
const getWeather = () => {
  // remove error message
  removeError();

  // clear console
  console.clear();

  // openweathermap.org API key
  const apiKey = "YOUR API KEY";
  // get city name from input and remove white spaces (start + end)
  const city = document.getElementById("city").value.trim();

  // check if city is empty
  if (!city) {
    displayError("Please enter a city");
    return;
  }

  // construct API URL
  const currentWeatherURL = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}`;
  const forecastURL = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}`;

  // fetch current weather data
  fetch(currentWeatherURL)
    .then((response) => response.json())
    .then((data) => {
      removeError();
      displayWeather(data);
    })
    .catch((error) => {
      displayError("Error fetching current weather data. Please try again.");
      console.error("Error fetching current weather data: ", error);
    });

  // fetch hourly forecast data
  fetch(forecastURL)
    .then((response) => response.json())
    .then((data) => {
      removeError();
      displayHourlyForecast(data.list);
    })
    .catch((error) => {
      displayError("Error fetching hourly forecast data. Please try again.");
      console.error("Error fetching hourly forecast data: ", error);
    });
};

// add event listener to the search button
const searchBtn = document.getElementById("search-btn");
searchBtn.addEventListener("click", getWeather);

// add event listener to the input field to allow pressing enter to search
const cityInput = document.getElementById("city");
cityInput.addEventListener("keypress", (event) => {
  if (event.key === "Enter") {
    getWeather();
  }
});
