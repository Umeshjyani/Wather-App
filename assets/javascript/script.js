const API_KEY = '46b82c1602411bdadd5b9a778954b6b4';
const addButton = document.getElementById('addButton');
const cityInput = document.getElementById('cityInput');
const weatherCards = document.getElementById('weatherCards');

let cities = new Set(getSavedCities());

addButton.addEventListener('click', () => {
    const cityName = cityInput.value.trim();

    if (!cityName) {
        alert('Please enter a city name.');
        return;
    }

    if (cities.has(cityName)) {
        alert('This city is already added.');
        return;
    }

    fetchWeatherData(cityName)
        .then((data) => {
            cities.add(cityName);
            saveCitiesToLocalStorage(Array.from(cities));
            createWeatherCard(data);
        })
        .catch((error) => {
            alert('Failed to fetch weather data. Please try again later.');
        });
});

function getSavedCities() {
    const savedCitiesJSON = localStorage.getItem('cities');
    return savedCitiesJSON ? JSON.parse(savedCitiesJSON) : [];
}

function saveCitiesToLocalStorage(citiesArray) {
    const citiesJSON = JSON.stringify(citiesArray);
    localStorage.setItem('cities', citiesJSON);
}

async function fetchWeatherData(cityName) {
    // const url = `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${API_KEY}&units=metric`;
    // const response = await fetch(url);
    // const data = await response.json();
    // return data;
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${API_KEY}&units=metric`;
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`API request failed with status ${response.status}`);
        }
        const data = await response.json();
        return data;
    } catch (error) {
        throw new Error(`Failed to fetch weather data: ${error.message}`);
    }
}

function loadSavedCitiesWeather() {
    cities.forEach((city) => {
        fetchWeatherData(city)
            .then((data) => createWeatherCard(data))
            .catch((error) => {
                console.log(`Failed to fetch weather data for ${city}.`);
            });
    });
}

function createWeatherCard(data) {
    const weatherCard = document.createElement('div');
    weatherCard.classList.add('weather-card');

    const weatherIcon = document.createElement('img');
    weatherIcon.src = getWeatherIconURL(data.weather[0].icon);
    weatherCard.appendChild(weatherIcon);

    const cityNameElement = document.createElement('div');
    cityNameElement.classList.add('city');
    cityNameElement.textContent = data.name;
    weatherCard.appendChild(cityNameElement);

    const temperatureElement = document.createElement('div');
    temperatureElement.classList.add('temperature');
    temperatureElement.textContent = `Temperature: ${data.main.temp}°C (High: ${data.main.temp_max}°C, Low: ${data.main.temp_min}°C)`;
    weatherCard.appendChild(temperatureElement);

    const conditionElement = document.createElement('div');
    conditionElement.classList.add('condition');
    conditionElement.textContent = `Condition: ${data.weather[0].description}`;
    weatherCard.appendChild(conditionElement);

    const detailsElement = document.createElement('div');
    detailsElement.classList.add('details');
    detailsElement.textContent = `Humidity: ${data.main.humidity}%, Pressure: ${data.main.pressure} hPa, Wind Speed: ${data.wind.speed} m/s, Cloudiness: ${data.clouds.all}%`;
    weatherCard.appendChild(detailsElement);

    weatherCards.appendChild(weatherCard);

    sortWeatherCards();
}

function sortWeatherCards() {
    const sortedCards = Array.from(weatherCards.children).sort((a, b) => {
        const temperatureA = getTemperature(a.querySelector('.temperature').textContent);
        const temperatureB = getTemperature(b.querySelector('.temperature').textContent);
        return temperatureA - temperatureB;
    });

    weatherCards.innerHTML = '';
    sortedCards.forEach((card) => {
        weatherCards.appendChild(card);
    });
}

function getWeatherIconURL(iconCode) {
    return `https://openweathermap.org/img/w/${iconCode}.png`;
}

function getTemperature(temperatureString) {
    return parseFloat(temperatureString.match(/[\d.-]+/)[0]);
}

window.addEventListener('load', () => {
    loadSavedCitiesWeather();
});
