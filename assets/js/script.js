var inputEl = document.querySelector('#city-search');
var searchBtnEl = document.querySelector('#search-btn');
var cityListEl = document.querySelector('#city-list');
var currentCityEl = document.querySelector('#current-city');
var currentTempEl = document.querySelector('#current-temp');
var currentHumidityEL = document.querySelector('#current-humidity');
var currentWSEl = document.querySelector('#current-ws');
var currentUViEl = document.querySelector('#current-uvi');
var weekForecastEl = document.querySelector('#week-forecast');
var cityArr = [];

// load stored cities
var storedCities = JSON.parse(localStorage.getItem('storedCities'));

if (!storedCities) {
  console.log('nothing saved');
} else {
  cityArr = storedCities;
  
  // display searched city list
  displayCityList(cityArr);
}

var searchSubmitHandler = function(event) {
  event.preventDefault;

  // get city name
  var city = inputEl.value.trim();

  // check if city has been searched
  if (cityArr.includes(city)) {
    getCity(city);
  } else {
    cityArr.push(city);

    // store searched city
    localStorage.setItem('storedCities', JSON.stringify(cityArr));

    // update city list
    updateList(city);
    getCity(city);
  }
};

var updateList = function(city) {
  var listItemEl = document.createElement('li');
    listItemEl.className = 'list-group-item';
    listItemEl.textContent = city;
    cityListEl.appendChild(listItemEl);
};

function displayCityList() {
  for (i = 0; i < cityArr.length; i++) {
    var listItemEl = document.createElement('li');
    listItemEl.className = 'list-group-item';
    listItemEl.textContent = cityArr[i];
    cityListEl.appendChild(listItemEl);
  }
};

var getCity = function(city) {
  // var city = 'Los Angeles';
  var apiURL = "https://api.openweathermap.org/data/2.5/weather?q="
    + city + "&units=imperial&appid=";

  fetch(apiURL).then(function(response) {
    if (response.ok) {
      response.json().then(function(data) {
        getCityOneCall(data);
      });
    } else {
      alert("Error: " + response.statusText);
    };
  })
  .catch(function(error) {
    alert('Unable to connect');
  });
};

var getCityOneCall = function(data) {
  // get city name
  var city = data.name;

  // get coordinates
  var lat = data.coord.lat;
  var lon = data.coord.lon;

  // One Call API
  var apiURL = "https://api.openweathermap.org/data/2.5/onecall?lat=" 
  + lat + "&lon=" + lon + "&units=imperial&appid=";

  fetch(apiURL).then(function(response) {
    if (response.ok) {
      response.json().then(function(data) {
        displayWeather(data, city);
      });
    } else {
      alert("Error: " + response.statusText);
    }
  })
  .catch(function(error) {
    alert('Unable to connect');
  });
}

var displayWeather = function(data, city) {
  console.log(data);

  // get date
  var unixDate = data.current.dt;
  var dateArr = new Date(unixDate * 1000).toLocaleDateString('en-US').split('/');
  console.log(dateArr);
  var date = "(" + dateArr[0] + "/" + dateArr[1] + "/" + dateArr[2] + ")";
  console.log(date);

  // get weather icon
  var weatherIcon = data.current.weather[0].icon;
  var iconSrc = "http://openweathermap.org/img/w/" + weatherIcon + ".png";
  console.log(weatherIcon);

  // display info
  currentCityEl.innerHTML = city + " " + date + " " + `<img src=${iconSrc}>`;

  // get desired data
  var temp = data.current.temp;
  var humidity = data.current.humidity;
  var windSpeed = data.current.wind_speed;
  var uvIndex = data.current.uvi;

  // display desired data
  currentTempEl.textContent = 'Temperature: ' + temp + ' °F';
  currentHumidityEL.textContent = 'Humidity: ' + humidity + ' %';
  currentWSEl.textContent = 'Wind Speed: ' + windSpeed + ' MPH';
  currentUViEl.innerHTML = 'UV Index: ' + uvIndex;

  display5Day(data);
};

var display5Day = function(data) {
  // clear old content
  while (weekForecastEl.firstChild) {
    weekForecastEl.removeChild(weekForecastEl.firstChild);
  }

  for (i = 1; i < 6; i++) {
    // get date, temperature, and humidity
    var unixDate = data.daily[i].dt;
    var dateArr = new Date(unixDate * 1000).toLocaleDateString('en-US').split('/');
    var date = "(" + dateArr[0] + "/" + dateArr[1] + "/" + dateArr[2] + ")";
    var weatherIcon = data.daily[i].weather[0].icon;
    var iconSrc = "http://openweathermap.org/img/w/" + weatherIcon + ".png";
    var temp = data.daily[i].temp.day;
    var humidity = data.daily[i].humidity;
    console.log(date);
    console.log(temp);
    console.log(humidity);

    var cardEl = document.createElement('div');
    cardEl.className= 'card';
    var cardTitleEl = document.createElement('h5');
    cardTitleEl.className = 'card-title';
    cardTitleEl.innerHTML = date + `<img src=${iconSrc}>`;
    var tempEl = document.createElement('p');
    tempEl.className = 'card-text';
    tempEl.textContent = 'Temperature: ' + temp + ' °F';
    var humidityEl = document.createElement('p');
    humidityEl.className = 'card-text';
    humidityEl.textContent = 'Humidity: ' + humidity + ' %';

    // append to page
    cardEl.appendChild(cardTitleEl);
    cardEl.appendChild(tempEl);
    cardEl.appendChild(humidityEl);
    weekForecastEl.appendChild(cardEl);
  };
}

searchBtnEl.addEventListener('click', searchSubmitHandler);
inputEl.addEventListener('submit', searchSubmitHandler);