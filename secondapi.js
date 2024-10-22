const apiKey = 'c628454f253845373b801351d7ea7498'; // OpenWeatherAPI
const apiKeyWA = 'e2268370278a4caba5b62924242110'; // WeatherAPI
let lat = 0;
let lon = 0;
let apiArray1 = [];
let apiArray2 = [];
let currentLocation = "";
let hourTime = 0;

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
                getForecasts(location);
            } else {
                getWeather(currentLocation);
                getForecasts(currentLocation);
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
function getWeather(location) {
    const unit = document.querySelector('input[name="unit"]:checked').value;
    const url = `http://api.weatherapi.com/v1/forecast.json?key=${apiKeyWA}&q=${location}&days=1&aqi=no&alerts=no`;
    fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error("Can't find given location :(");
            }
            return response.json();
        })
        .then(data => {
            apiArray1 = [];
            apiArray2 = [];
            displayWeather(data, unit);
            updateTheme(data);
            lat = data.location.lat;
            lon = data.location.lon;
            getForecasts(location);
        })
        .catch(error => {
            alert('Error when getting fetching weather... ', error.message);
        });
    document.getElementById("hidden").style.display = "flex";

}

// Display current weather
function displayWeather(data, unit) {
    const weatherResultDiv = document.getElementById('current-weather');
    let temp = data.current.temp_c;
    let feelsLike = data.current.feelslike_c;
    let windSpeed = data.current.wind_kph;
    let unitSymbol = '';
    const description = data.current.condition.text;
    const humidity = data.current.humidity;
    const iconUrl = data.current.condition.icon;
    const city = data.location.name;
    const localTime = data.location.localtime;
    const dateTime = new Date(localTime.replace(' ', 'T'));
    const currentHours = dateTime.getHours(); 
    const currentMinutes = dateTime.getMinutes();
    const formattedMinutes = String(currentMinutes).padStart(2, '0');



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
        <p id="current-p"><strong>Current time:</strong> ${currentHours}:${formattedMinutes}</p>
        <p id="current-p"><strong>Temperature:</strong> ${temp.toFixed(1)}°${unitSymbol}</p>
        <p id="current-p"><strong>Feels Like:</strong> ${feelsLike.toFixed(1)}°${unitSymbol}</p>
        <p id="current-p"><strong>Humidity:</strong> ${humidity}%</p>
        <p id="current-p"><strong>Wind Speed:</strong> ${windSpeed.toFixed(1)} km/h</p></div>
    `;
    
    weatherResultDiv.innerHTML = weatherHTML;
}

// Change the page look depending on current weather
function updateTheme(data) {
    const body = document.body;
    const isDay = Boolean(data.current.is_day);
    const temp = data.current.temp_c;
    const precip = data.current.precip_mm;
    const h1 = document.querySelector('h1');
    const radios = document.querySelectorAll('#unit-selection label');

    if (isDay) {
        if (temp <= 5) {
            h1.style.color = '#000000';
            radios.forEach(radio => {
                radio.style.color = '#000000';
            });
            document.getElementById('navigation').style.color = '#000000';
            document.getElementById('description-text').style.color = '#000000';
            body.style.backgroundImage = 'url(assets/freezing.avif)';
        } else if (precip > 0.1) {
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
        document.getElementById('navigation').style.color = '#ffffff';
        document.getElementById('description-text').style.color = '#ffffff';
    }

    body.style.backgroundSize = 'cover';
    body.style.backgroundPosition = 'center';
    body.style.backgroundRepeat = 'no-repeat';
}

// Fetch from weatherAPI and openMeteo and call other functions
function getForecasts(location) {
    const unit = document.querySelector('input[name="unit"]:checked').value;
    const hourlyUrl = `http://api.weatherapi.com/v1/forecast.json?key=${apiKeyWA}&q=${location}&days=7&aqi=no&alerts=no`;
    const dailyUrl = `http://api.weatherapi.com/v1/forecast.json?key=${apiKeyWA}&q=${location}&days=7&aqi=no&alerts=no`;
    const hourlyUrl2 = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&hourly=temperature_2m,weather_code`;
    fetch(hourlyUrl)
        .then(response => response.json())
        .then(data => {
            displayHourlyForecast(data, unit);
            checkAndCreateChart();
        })
        .catch(error => {
            alert("Can't fetch hourly forecast from weatherAPI... " + error.message);
        });

    fetch(hourlyUrl2)
        .then(response => response.json())
        .then(data => {
            displayHourlyForecast2(data, unit);
            checkAndCreateChart();
        })
        .catch(error => {
            alert("Can't fetch hourly forecast from openMeteo... " + error.message);
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

// Create comparison chart if both arrays are populated
function checkAndCreateChart() {
    if (apiArray1.length > 0 && apiArray2.length > 0) {
        createTemperatureChart(apiArray1, apiArray2);
    }
}

// Display 24h forecast
function displayHourlyForecast(data, unit) {
    const hourlyGrid = document.querySelector('.hourly-grid');
    hourlyGrid.innerHTML = '';
    let nextDay = false;
    const localTime2 = data.location.localtime;
    const dateTime2 = new Date(localTime2.replace(' ', 'T'));
    const time2 = dateTime2.getHours(); 
    hourTime = time2;

    for (let i = 0; i < 24; i++) {
        const localTime = data.location.localtime;
        const dateTime = new Date(localTime.replace(' ', 'T'));
        let time = dateTime.getHours() + 1 + i; 
        if (time > 24) {
            time = time - 24;
        }
        let unitSymbol = '';

        if (!nextDay && time !== 24) {
            let temp = data.forecast.forecastday[0].hour[time].temp_c;
            const codeIcon = data.forecast.forecastday[0].hour[time].condition.icon;
            if (time === 23) {
                nextDay = true;
            }

            if (unit === 'fahr') {
                temp = (temp * 9/5) + 32;
                unitSymbol = 'F';
            } else if (unit === 'kelvin') {
                temp += 273,15;
                unitSymbol = 'K';
            } else {
                unitSymbol = 'C';
            }

            apiArray1.push(temp);
            hourlyGrid.innerHTML += `<div class="hour-grid-item"><p><strong>${time}:00</strong><br><img src="${codeIcon}" alt="icon"><br>${temp.toFixed(1)}°${unitSymbol}</p></div>`;
        } else if (time == 24) {
            let temp = data.forecast.forecastday[1].hour[0].temp_c;
            const codeIcon = data.forecast.forecastday[1].hour[0].condition.icon;

            if (unit === 'fahr') {
                temp = (temp * 9/5) + 32;
                unitSymbol = 'F';
            } else if (unit === 'kelvin') {
                temp += 273,15;
                unitSymbol = 'K';
            } else {
                unitSymbol = 'C';
            }

            apiArray1.push(temp);
            hourlyGrid.innerHTML += `<div class="hour-grid-item"><p><strong>0:00</strong><br><img src="${codeIcon}" alt="icon"><br>${temp.toFixed(1)}°${unitSymbol}</p></div>`;
        } else {
            let temp = data.forecast.forecastday[1].hour[time].temp_c;
            const codeIcon = data.forecast.forecastday[1].hour[time].condition.icon;

            if (unit === 'fahr') {
                temp = (temp * 9/5) + 32;
                unitSymbol = 'F';
            } else if (unit === 'kelvin') {
                temp += 273,15;
                unitSymbol = 'K';
            } else {
                unitSymbol = 'C';
            }

            apiArray1.push(temp);
            hourlyGrid.innerHTML += `<div class="hour-grid-item"><p><strong>${time}:00</strong><br><img src="${codeIcon}" alt="icon"><br>${temp.toFixed(1)}°${unitSymbol}</p></div>`;
            }
    }
}

// Display 7day forecast
function displayDailyForecast(data, unit) {
    const dailyGrid = document.querySelector('.daily-grid');
    dailyGrid.innerHTML = '';

    data.forecast.forecastday.forEach((day, index) => {
        let maxTemp = data.forecast.forecastday[index].day.maxtemp_c;
        let minTemp = data.forecast.forecastday[index].day.mintemp_c;
        const codeIcon = data.forecast.forecastday[index].day.condition.icon;
        let unitSymbol = '';
        options = { weekday: 'long'}
        const dayX = new Date(day.date).toLocaleDateString(undefined, options);
        
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

        dailyGrid.innerHTML += `<div class="day-grid-item"><p><strong>${dayX}</strong><br><img src="${codeIcon}" alt="icon"><br>Max: ${maxTemp.toFixed(1)}°${unitSymbol}<br>Min: ${minTemp.toFixed(1)}°${unitSymbol}</p></div>`;
    });
}

// Push 24h temperatures to array for comparison in chart
function displayHourlyForecast2(data, unit) {
    let index = (new Date(Date.now()).getHours()) + 1;

    for (let i = 0; i < 24; i++) {
        let temp = data.hourly.temperature_2m[index];
        index++;
        let unitSymbol = '';
        
        if (unit === 'fahr') {
            temp = (temp * 9/5) + 32;
            unitSymbol = 'F';
        } else if (unit === 'kelvin') {
            temp += 273,15;
            unitSymbol = 'K';
        } else {
            unitSymbol = 'C';
        }
        apiArray2.push(temp);
    }
}

// Create comparison chart
function createTemperatureChart(api1, api2) {
    //const currentHour = new Date().getHours();
    const labels = Array.from({ length: 24 }, (_, i) => {
        const hour = (hourTime + i + 1) % 24;
        return hour;
    });
    const chart = new frappe.Chart("#chart", {
        title: "24-Hour Temperature Forecast by two different providers",
        data: {
            labels: labels,
            datasets: [
                {
                    name: "Weatherapi.com",
                    values: api1,
                },
                {
                    name: "Openmeteo.com",
                    values: api2,
                },
            ],
        },
        type: "line",
        height: 300,
        colors: ["#00aaff", "#ffcc00"],
        background: "rgba(255, 255, 255, 0.2)",
        axisOptions: {
            xAxisMode: "tick",
            yAxisMode: "span",
        },
    });
}

