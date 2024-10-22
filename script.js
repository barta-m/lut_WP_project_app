const apiKey = 'c628454f253845373b801351d7ea7498'; // OpenWeatherAPI
const apiKeyWA = 'e2268370278a4caba5b62924242110'; // WeatherAPI
let lat = 0;
let lon = 0;
let currentLocation = "";
let currentHour = 0;

// Submit  listener
document.getElementById('weather-form').addEventListener('submit', function (e) {
    e.preventDefault();
    const location = document.getElementById('location-input').value.trim();
    if (location === "") {
        alert('Please enter a valid location');
        return;
    }
    getWeather(location);
});

// Current location listener
document.getElementById('get-location').addEventListener('click', function () {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            position => {
                const latitude = position.coords.latitude;
                const longitude = position.coords.longitude;
                getLocationFromCoordinates(latitude, longitude);
            },
            error => {
                console.error('Error getting current location: ', error);
                alert("Can't currently get your current location :(");
            }
        );
    } else {
        alert("Can't currently get your current location :(. Not supported.");
    }
});

// Unit change listener
document.querySelectorAll('input[name="unit"]').forEach((input) => {
    input.addEventListener('change', function () {
        const location = document.getElementById('location-input').value.trim();
        if (document.getElementById("hidden").style.display == "flex") {
            if (location) {
                getWeather(location);
                if (lat !== 0 && lon !== 0) {
                    getForecasts(lat, lon);
                } else {
                    alert("Error - latitude and longitude not processed and can't show forecasts");
                }
            } else {
                getWeather(currentLocation);
            }
        }
    });
});

// Find location from coordinates and call getWeather
function getLocationFromCoordinates(latitude, longitude) {
    const locationApiCall = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${apiKey}`;
    fetch(locationApiCall)
        .then(response => {
            if (!response.ok) {
                throw new Error("Error - can't find location from coordinates");
            }
            return response.json();
        })
        .then(data => {
            currentLocation = data.name;
            document.getElementById('location-input').value = currentLocation;
            getWeather(data.name);
        })
        .catch(error => {
            alert('Error getting location from coordinates: ', error.message);
        });
}

// Fetch current weather and call other functions
async function getWeather(location) {
    const unit = document.querySelector('input[name="unit"]:checked').value;
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${location}&appid=${apiKey}&units=metric`;
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error("Can't find given location :(");
        }
        const data = await response.json();
        const arrayTime = await getTime(location);
        displayWeather(data, unit, arrayTime);
        updateTheme(data);
        lat = data.coord.lat;
        lon = data.coord.lon;
        getForecasts(lat, lon);
    } catch (error) {
        alert('Error when fetching weather... ', error.message);
    }
    document.getElementById("hidden").style.display = "flex";

}

// Display current weather
function displayWeather(data, unit, arrayTime) {
    const weatherResultDiv = document.getElementById('current-weather');
    let temp = data.main.temp;
    let feelsLike = data.main.feels_like;
    let windSpeed = data.wind.speed;
    let unitSymbol = '';
    const description = data.weather[0].description;
    const humidity = data.main.humidity;
    const iconCode = data.weather[0].icon;
    const iconUrl = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
    const city = data.name;
    currentHour = arrayTime[0];

    if (unit === 'fahr') {
        temp = (temp * 9/5) + 32;
        feelsLike = (feelsLike * 9/5) + 32;
        unitSymbol = 'F';
    } else if (unit === 'kelvin') {
        temp += 273,15;
        feelsLike += 273,15;
        unitSymbol = 'K';
    } else {
        unitSymbol = 'C';
    }

    const weatherHTML = `
        <div class="inside-containers">
        <h2>Current Weather in ${city}</h2>
        <img src="${iconUrl}" alt="${description}">
        <p id="weather-p"><strong>${description.charAt(0).toUpperCase() + description.slice(1)}</strong></p>
        <p id="current-p"><strong>Current time:</strong> ${arrayTime[0]}:${arrayTime[1]}</p>
        <p id="current-p"><strong>Temperature:</strong> ${temp.toFixed(1)}°${unitSymbol}</p>
        <p id="current-p"><strong>Feels Like:</strong> ${feelsLike.toFixed(1)}°${unitSymbol}</p>
        <p id="current-p"><strong>Humidity:</strong> ${humidity}%</p>
        <p id="current-p"><strong>Wind Speed:</strong> ${windSpeed.toFixed(1)} m/s</p>
        </div>
    `;
    
    weatherResultDiv.innerHTML = weatherHTML;
}

// Change the page look depending on current weather
function updateTheme(data) {
    const body = document.body;
    const sunrise = data.sys.sunrise;
    const sunset = data.sys.sunset;
    const currentTime = Math.floor(Date.now() / 1000);
    const temp = data.main.temp;
    const weatherState = data.weather[0].main;
    const isRaining = weatherState.includes("Rain");
    const h1 = document.querySelector('h1');
    const radios = document.querySelectorAll('#unit-selection label');

    if (currentTime >= sunrise && currentTime <= sunset) {
        if (temp <= 5) {
            h1.style.color = '#000000';
            radios.forEach(radio => {
                radio.style.color = '#000000';
            });
            document.getElementById('navigation').style.color = '#000000';
            document.getElementById('description-text').style.color = '#000000';
            body.style.backgroundImage = 'url(assets/freezing.avif)';
        } else if (isRaining) {
            h1.style.color = '#000000';
            radios.forEach(radio => {
                radio.style.color = '#000000';
            });
            document.getElementById('navigation').style.color = '#000000';
            document.getElementById('description-text').style.color = '#000000';
            body.style.backgroundImage = 'url(assets/raining.jpg)'; 
        } else if (temp <= 20) {
            body.style.backgroundImage = 'url(assets/green.jpg)'; 
            document.getElementById('description-text').style.color = '#333333';
            h1.style.color = '#333333';
            radios.forEach(radio => {
                radio.style.color = '#333333';
            });
            document.getElementById('navigation').style.color = '#000000';
        } else {
            body.style.backgroundImage = 'url(assets/hot.avif)'; 
            document.getElementById('description-text').style.color = '#000000';
            h1.style.color = '#000000';
            radios.forEach(radio => {
                radio.style.color = '#000000';
            });
            document.getElementById('navigation').style.color = '#000000';
        }
    } else {
        body.style.backgroundImage = 'url(assets/night.jpg)';
        h1.style.color = '#ffffff';
        radios.forEach(radio => {
            radio.style.color = '#ffffff';
        });
        document.getElementById('description-text').style.color = '#ffffff';
    }

    body.style.backgroundSize = 'cover';
    body.style.backgroundPosition = 'center';
    body.style.backgroundRepeat = 'no-repeat';
}

// Fetch from openMeteo and call other functions
function getForecasts(latitude, longitude) {
    const unit = document.querySelector('input[name="unit"]:checked').value;
    const hourlyUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&hourly=temperature_2m,weather_code`;
    const dailyUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&daily=temperature_2m_max,temperature_2m_min,weathercode`;
    
    fetch(hourlyUrl)
        .then(response => response.json())
        .then(data => {
            displayHourlyForecast(data, unit);
        })
        .catch(error => {
            alert("Can't fetch hourly forecast... " + error.message);
        });

    fetch(dailyUrl)
        .then(response => response.json())
        .then(data => {
            displayDailyForecast(data, unit);
        })
        .catch(error => {
            alert("Can't fetch daily forecast... " + error.message);
        });
}

// Display 24h forecast
function displayHourlyForecast(data, unit) {
    const hourlyGrid = document.querySelector('.hourly-grid');
    hourlyGrid.innerHTML = '';
    let index = new Date(Date.now()).toLocaleTimeString([], { hour: '2-digit', hour12: false });
    index = Number(index) + 1;

    for (let i = 0; i < 24; i++) {
        let time = new Date(Date.now() + (i * 3600000)).toLocaleTimeString([], { hour: '2-digit', hour12: false });
        time = Number(time) + 1;
        let time2 = currentHour + 1 +i;
        if (time2 > 24) {
            time2 = time2 - 24;
        }
        let temp = data.hourly.temperature_2m[index];
        index++;
        let unitSymbol = '';
        const weatherCode = data.hourly.weather_code[i + time];
        const codeIcon = getWeatherIcon(weatherCode);
        
        if (unit === 'fahr') {
            temp = (temp * 9/5) + 32;
            unitSymbol = 'F';
        } else if (unit === 'kelvin') {
            temp += 273,15;
            unitSymbol = 'K';
        } else {
            unitSymbol = 'C';
        }

        if (time2 == 24) {
            hourlyGrid.innerHTML += `<div class="hour-grid-item"><p><strong>0:00</strong><br><img src='${codeIcon}' alt='icon for ${weatherCode}'><br>${temp.toFixed(1)}°${unitSymbol}</p></div>`;
        } else {
            hourlyGrid.innerHTML += `<div class="hour-grid-item"><p><strong>${time2}:00</strong><br><img src='${codeIcon}' alt='icon for ${weatherCode}'><br>${temp.toFixed(1)}°${unitSymbol}</p></div>`;
        }
    }
}

// Display 7day forecast
function displayDailyForecast(data, unit) {
    const dailyGrid = document.querySelector('.daily-grid');
    dailyGrid.innerHTML = '';

    data.daily.time.forEach((day, index) => {
        let maxTemp = data.daily.temperature_2m_max[index];
        let minTemp = data.daily.temperature_2m_min[index];
        const weatherCode = data.daily.weathercode[index];
        const codeIcon = getWeatherIcon(weatherCode);
        let unitSymbol = '';
        options = { weekday: 'long'}
        const dayX = new Date(day).toLocaleDateString(undefined, options);
        
        if (unit === 'fahr') {
            maxTemp = (maxTemp * 9/5) + 32;
            minTemp = (minTemp * 9/5) + 32;
            unitSymbol = 'F';
        } else if (unit === 'kelvin') {
            maxTemp += 273,15;
            minTemp += 273,15;
            unitSymbol = 'K';
        } else {
            unitSymbol = 'C';
        }

        dailyGrid.innerHTML += `<div class="day-grid-item"><p><strong>${dayX}</strong><br><img src='${codeIcon}' alt='icon for ${weatherCode}'><br>Max: ${maxTemp.toFixed(1)}°${unitSymbol}<br>Min: ${minTemp.toFixed(1)}°${unitSymbol}</p></div>`;
    });
}

// Map icon codes to weather codes
function getWeatherIcon(weatherCode) {
    const iconMap = {
        0: '01d',
        1: '02d',
        2: '03d',
        3: '04d',
        45: '50d',
        48: '50d',
        51: '09d',
        53: '09d',
        55: '09d',
        56: '13d',
        57: '13d',
        61: '10d',
        63: '10d',
        65: '10d',
        66: '13d',
        67: '13d',
        71: '13d',
        73: '13d',
        75: '13d',
        77: '13d',
        80: '09d',
        81: '09d',
        82: '09d',
        85: '13d',
        86: '13d',
        95: '11d',
        96: '11d',
        99: '11d'
    };

    return `https://openweathermap.org/img/wn/${iconMap[weatherCode]}@2x.png`;
}

// Get local time, because nor OpenWeatherMap nor OpenMeteo have current time in the API response
async function getTime(location) {
    const url = `http://api.weatherapi.com/v1/forecast.json?key=${apiKeyWA}&q=${location}&days=1&aqi=no&alerts=no`;
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error("Can't find the given location's time");
        }
        const data = await response.json();
        const localTime = data.location.localtime;
        const dateTime = new Date(localTime.replace(' ', 'T'));
        const currentHours = dateTime.getHours();
        const currentMinutes = dateTime.getMinutes();
        const formattedMinutes = String(currentMinutes).padStart(2, '0');
        return [currentHours, formattedMinutes]; 
    } catch (error) {
        console.error('Error fetching time:', error.message);
        return null;
    }
}