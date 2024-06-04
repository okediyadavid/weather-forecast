

const cityInput = document.querySelector(".city-input");
const searchButton = document.querySelector(".search-btn");
const locationButton = document.querySelector(".location-btn");
const currentWeatherDiv = document.querySelector(".current-weather");
const weatherCardsDiv = document.querySelector(".weather-cards");


const API_KEY = "0c7163e88372a06439b048f5410cf3e2"; // API KEY from open weather map

const createWeatherCard = (cityName, weatherItem, index) => {
    if(index === 0){
        return ` <div class="details">
                      <h2>${cityName}(${weatherItem.dt_txt.split(" ")[0]})</h2>
                      <h4>Temperature: ${(weatherItem.main.temp - 273.15).toFixed(2)}C</h4>
                      <h4>Wind: ${weatherItem.wind.speed} M/S</h4>
                      <h4>Humidity:${weatherItem.main.humidity}%</h4>
                 </div>
                 <div class="icon">
                      <img src="https://openweathermap.org/img/wn/${weatherItem.weather[0].icon}@4x.png" alt="weather icon"/>
                      <h4>${weatherItem.weather[0].description}</h4>
                 </div>`;
    } else {
        return `<li class="card">
              <h2>(${weatherItem.dt_txt.split(" ")[0]})</h2>
              <img src="https://openweathermap.org/img/wn/${weatherItem.weather[0].icon}@2x.png" alt="weather icon"/>
              <h4>Temp: ${(weatherItem.main.temp - 273.15).toFixed(2)}C</h4>
              <h4>Wind: ${weatherItem.wind.speed} M/S</h4>
              <h4>Humidity:${weatherItem.main.humidity}%</h4>
            </li>`;
    }
    
}
const getWeatherDetails = (cityName, lat, lon) => {
    const WEATHER_API_URL = `http://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}`;
    fetch(WEATHER_API_URL).then(res => res.json()).then(data => {
        const uniqueForecastDays = [];
       // get onl one forecast per day
       const fiveDaysForecast = data.list.filter(forecast => {
        const forecastDate = new Date(forecast.dt_txt).getDate();
        if(!uniqueForecastDays.includes(forecastDate)){
            return uniqueForecastDays.push(forecastDate);
        }
       });
       // clear previous weather data
       cityInput.value = "";
       currentWeatherDiv.innerHTML = "";
       weatherCardsDiv.innerHTML = "";

       
       fiveDaysForecast.forEach((weatherItem, index)=> {
        if(index === 0){
            currentWeatherDiv.insertAdjacentHTML("beforeend", createWeatherCard(cityName, weatherItem, index));
        }else{
            weatherCardsDiv.insertAdjacentHTML("beforeend", createWeatherCard(cityName, weatherItem, index));
        }
       });
    }).catch(() => {
        alert("Oops!! An error ocurred while getting the weather forecast");
    });
}


const getCityCoordinates = () => {


    const cityName = cityInput.value.trim(); // gets entered city name and remove extra spaces
    if(!cityName) return;
    const GEOCODING_API_URL = `http://api.openweathermap.org/geo/1.0/direct?q=${cityName}&limit=1&appid=${API_KEY}`;
    
    fetch(GEOCODING_API_URL).then(res => res.json()).then(data => {
        if(!data.length) return alert(`No coordinates found for ${cityName}`);
        const { name, lat, lon} = data[0];
        getWeatherDetails(name, lat, lon);
    }).catch(() => {
        alert("Oops!! An error ocurred while getting the coordinates");
    });
}

const getUserCoordinates = () =>  {
    navigator.geolocation.getCurrentPosition(
        position => {
            const { latitude, longitude } = position.coords;
            const REVERSE_GEOCODING_URL = `http://api.openweathermap.org/geo/1.0/reverse?lat=${latitude}&lon=${longitude}&limit=1&appid=${API_KEY}`;
            // get city name using reverse geocoding API
            fetch(REVERSE_GEOCODING_URL).then(res => res.json()).then(data => {
                const { name} = data[0];
                getWeatherDetails(name, latitude, longitude);
            }).catch(() => {
                alert("Oops!! An error ocurred while getting the city");
            });
        },
        error => {
            if(error.code === error.PERMISSION_DENIED) { 
                alert("Geolocation request denied. Reset location permission");
            }
        }
    );
}
const storeWeatherData = async (cityName, lat, lon, weatherData) => {
    try {
      const response = await fetch('/weather', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cityName, lat, lon, weatherData })
      });
  
      if (!response.ok) {
        throw new Error(`Error storing weather data: ${response.statusText}`);
      }
  
      console.log('Weather data stored in MongoDB');
    } catch (err) {
      console.error(err);
      alert('Error storing weather data in MongoDB');
    }
  };

  const storeSelectedState = () => {
    const stateSelect = document.getElementById("state-select");
    const selectedState = stateSelect.value;
    if (selectedState) {
        const selectedLat = 12.34; // Replace with actual coordinates
        const selectedLon = 56.78;

        fetchWeatherData(selectedState, selectedLat, selectedLon);
    } else {
        alert("Please select a state");
    }
};

const fetchWeatherData = (cityName, lat, lon) => {
    // Update this function to fetch weather data from OpenWeatherMap
    const WEATHER_API_URL = `http://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}`;
    fetch(WEATHER_API_URL)
        .then(res => res.json())
        .then(data => {
            displayWeatherData(cityName, data);
        })
        .catch(() => {
            alert("Oops!! An error occurred while getting the weather forecast");
        });
};
  
  // Event Listeners
  
searchButton.addEventListener("click",getCityCoordinates);
locationButton .addEventListener("click",getUserCoordinates);
cityInput.addEventListener("keyup", e => e.key === "Enter" && getCityCoordinates());