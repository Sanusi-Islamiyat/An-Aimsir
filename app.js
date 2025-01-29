let startIndex = 0; 

async function fetchWeatherData(latitude, longitude, cityName) {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,weathercode&current_weather=true&timezone=auto`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch weather data: ${response.statusText}`);
    }
    const data = await response.json();
    displayWeather(data, cityName);
  } catch (error) {
    console.error('Error fetching weather data:', error.message);
    showErrorMessage(error.message);
  }
}


function displayWeather(data, cityName) {
  const { daily, current_weather } = data;
  const { time, temperature_2m_max, temperature_2m_min, precipitation_sum } = daily;

  const dayNames = time.map((dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { weekday: 'long' });
  });

  let weatherHTML = ` <div class="current-cont">

    <h2>${cityName}</h2>
    <p class="degree">${current_weather.temperature}°</p>
    <p class="ct">Current Temperature: ${current_weather.temperature}°C</p>
    <p class="ws">Wind Speed: ${current_weather.windspeed} km/h</p>
    </div>
  `;

  weatherHTML += `
    <div class="forecast-container">
      <button id="prev-btn" ${startIndex === 0 ? 'disabled' : ''}>Prev</button>
  `;

  for (let i = startIndex; i < Math.min(startIndex + 4, time.length); i++) {
    weatherHTML += `
      <div class="forecast-day">
        <h4>${dayNames[i]}</h4>
        <p>Max Temp: ${temperature_2m_max[i]}°C</p>
        <p>Min Temp: ${temperature_2m_min[i]}°C</p>
        <p>Precipitation: ${precipitation_sum[i]} mm</p>
      </div>
    `;
  }

  weatherHTML += `
    <button id="next-btn" ${startIndex + 4 >= time.length ? 'disabled' : ''}>Next</button>
    </div>
  `;

  document.getElementById('weather-container').innerHTML = weatherHTML;

  document.getElementById('prev-btn').addEventListener('click', () => navigateForecast(-4, data, cityName));
  document.getElementById('next-btn').addEventListener('click', () => navigateForecast(4, data, cityName));
}

function navigateForecast(step, data, cityName) {
  startIndex += step;
  displayWeather(data, cityName);
}

function showErrorMessage(message) {
  document.getElementById('weather-container').innerHTML = `
    <p class="error">${message}</p>
  `;
}

async function geocodeCity(city) {
  const geocodeUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}`;

  try {
    const response = await fetch(geocodeUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch geolocation data: ${response.statusText}`);
    }
    const data = await response.json();
    if (data.results && data.results.length > 0) {
      const { latitude, longitude, name } = data.results[0];
      fetchWeatherData(latitude, longitude, name);
    } else {
      showErrorMessage('Location not found');
    }
  } catch (error) {
    console.error('Error fetching geolocation data:', error.message);
    showErrorMessage(error.message);
  }
}

document.getElementById('search-btn').addEventListener('click', () => {
  const city = document.getElementById('city-input').value;
  if (city) {
    geocodeCity(city);
  } else {
    showErrorMessage('Please enter a city name');
  }
});


geocodeCity('New York');

const toggleModeButton = document.getElementById('toggle-mode');
const darkIcon = document.getElementById('dark-icon');
const lightIcon = document.getElementById('light-icon');

toggleModeButton.addEventListener('click', () => {
  document.body.classList.toggle('dark-mode');

  // Toggle visibility of icons
  if (document.body.classList.contains('dark-mode')) {
    darkIcon.style.display = 'none';
    lightIcon.style.display = 'inline';
  } else {
    darkIcon.style.display = 'inline';
    lightIcon.style.display = 'none';
  }
});


