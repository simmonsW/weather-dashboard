var inputEl = document.querySelector('#city-search');
var searchBtnEl = document.querySelector('#search-btn');
var searchFormEl = document.querySelector('#search-form');
// var cityListEl = document.querySelector('#city-list');
var $cityList = $('#city-list');
var currentCityEl = document.querySelector('#current-city');
var currentTempEl = document.querySelector('#current-temp');
var currentHumidityEL = document.querySelector('#current-humidity');
var currentWSEl = document.querySelector('#current-ws');
var currentUViEl = document.querySelector('#current-uvi');
var weekForecastEl = document.querySelector('#week-forecast');
var cityArr = [];
var clicked = false;

// load stored cities
var storedCities = JSON.parse(localStorage.getItem('storedCities'));

if (!storedCities) {
  console.log('nothing saved');
  var city = "Los Angeles";
  getCity(city);
} else {
  cityArr = storedCities;
  
  // display searched city list
  displayCityList(cityArr);

  // display data for first city
  var city = cityArr[0];
  getCity(city);
};

var searchSubmitHandler = function(event) {
  event.preventDefault;
  clicked = true;

  // get city name
  var cityInput = inputEl.value.trim().toLowerCase();

  // format city name uniformity
  var citySplit = cityInput.split(' ');

  for (var i = 0; i < citySplit.length; i++) {
    citySplit[i] = citySplit[i][0].toUpperCase() + citySplit[i].substr(1);
  }
  var city = citySplit.join(' ');

  getCity(city);
};

var listSubmitHandler = function(event) {
  event.preventDefault;

  var city = event.target.textContent;
  console.log(city);
  getCity(city);
};

var updateList = function(city) {
  // var listItemEl = document.createElement('li');
  var $listItem = $('<li>')
    .addClass('list-group-item')
    .text(city);
    // .appendTo($cityList);
  $cityList.append($listItem);
    // listItemEl.className = 'list-group-item';
    // listItemEl.textContent = city;
    // cityListEl.appendChild(listItemEl);
};

function displayCityList() {
  for (i = 0; i < cityArr.length; i++) {
    var $listItem = $('<li>')
    .addClass('list-group-item')
    .text(cityArr[i]);
    // .appendTo($cityList);
  $cityList.append($listItem);
    // var listItemEl = document.createElement('li');
    // listItemEl.className = 'list-group-item';
    // listItemEl.textContent = cityArr[i];
    // cityListEl.appendChild(listItemEl);
  }
};

function citySearchCheck(city) {
  // check if city has been searched
  if (cityArr.includes(city)) {
    console.log('City already stored');
  } else {
    cityArr.push(city);

    // store searched city
    localStorage.setItem('storedCities', JSON.stringify(cityArr));

    // update city list
    updateList(city);
  };
};

function getCity(city) {
  var apiURL = "https://api.openweathermap.org/data/2.5/weather?q="
    + city + "&units=imperial&appid=";

  fetch(apiURL).then(function(response) {
    if (response.ok) {
      response.json().then(function(data) {
        getCityOneCall(data);
        if (clicked === true) {
          console.log(clicked);
          citySearchCheck(city);
        }
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
};

function uviWarning(uvIndex, uviSpan) {
  if (uvIndex < 3) {
    uviSpan.classList.remove('moderate', 'high');
    uviSpan.classList.add('low');
  } else if (uvIndex >= 3) {
    uviSpan.classList.remove('low', 'high');
    uviSpan.classList.add('moderate');
  } else if (uvIndex > 6) {
    uviSpan.classList.remove('low', 'moderate');
    uviSpan.classList.add('high');
  };
};

var displayWeather = function(data, city) {
  // updateList(city);
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

  // create uvi span and warning logic
  var uviSpan = document.createElement('span');
  uviSpan.classList.add('uvi-span');
  uviSpan.textContent = uvIndex;
  uviWarning(uvIndex, uviSpan);
  
  // display desired data
  currentTempEl.textContent = 'Temperature: ' + temp + ' °F';
  currentHumidityEL.textContent = 'Humidity: ' + humidity + ' %';
  currentWSEl.textContent = 'Wind Speed: ' + windSpeed + ' MPH';
  currentUViEl.textContent = 'UV Index: ';
  currentUViEl.appendChild(uviSpan);

  display5Day(data);
};

var display5Day = function(data) {
  // clear old content
  while (weekForecastEl.firstChild) {
    weekForecastEl.removeChild(weekForecastEl.firstChild);
  };

  for (i = 1; i < 6; i++) {
    // get date, icon, temperature, and humidity
    var unixDate = data.daily[i].dt;
    var dateArr = new Date(unixDate * 1000).toLocaleDateString('en-US').split('/');
    var date = "(" + dateArr[0] + "/" + dateArr[1] + "/" + dateArr[2] + ")";
    var weatherIcon = data.daily[i].weather[0].icon;
    var iconSrc = "http://openweathermap.org/img/w/" + weatherIcon + ".png";
    var temp = data.daily[i].temp.day;
    var humidity = data.daily[i].humidity;

    var tempSpan = document.createElement('span');
    tempSpan.classList.add('in-line');
    tempSpan.textContent = temp + ' °F';
    var humiditySpan = document.createElement('span');
    humiditySpan.classList.add('in-line');
    humiditySpan.textContent = humidity + ' %';

    // create card
    var cardEl = document.createElement('div');
    cardEl.classList.add('card');
    // title
    var cardTitleEl = document.createElement('p');
    cardTitleEl.classList.add('card-title', 'date');
    cardTitleEl.textContent = date;
    // weather icon
    var iconEl = document.createElement('img');
    iconEl.setAttribute('src', `${iconSrc}`);
    iconEl.setAttribute('width', '50px');
    // temperature
    var tempEl = document.createElement('p');
    tempEl.classList.add('card-text');
    tempEl.textContent = 'Temp: ';
    // humidity
    var humidityEl = document.createElement('p');
    humidityEl.classList.add('card-text');
    humidityEl.textContent = 'Humidity: ';

    // append to page
    tempEl.appendChild(tempSpan);
    humidityEl.appendChild(humiditySpan);
    cardEl.appendChild(cardTitleEl);
    cardEl.appendChild(iconEl);
    cardEl.appendChild(tempEl);
    cardEl.appendChild(humidityEl);
    weekForecastEl.appendChild(cardEl);
  };
};

// searchFormEl.addEventListener('submit', searchSubmitHandler);
searchBtnEl.addEventListener('click', searchSubmitHandler);
inputEl.addEventListener('keypress', function(e) {
  if (e.keyCode === 13) {
    e.preventDefault();
    searchBtnEl.click();
  }
});
cityListEl.addEventListener('click', function(event) {
  if (event.target.tagName.toLowerCase() === 'li') {
    listSubmitHandler(event);
  };
});