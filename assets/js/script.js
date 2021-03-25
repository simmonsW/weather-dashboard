var currentCityEl = document.querySelector('#current-city');
var currentTempEl = document.querySelector('#current-temp');
var currentHumidityEL = document.querySelector('#current-humidity');
var currentWSEl = document.querySelector('#current-ws');
var currentUViEl = document.querySelector('#current-uvi');

var getCity = function() {
  var city = 'Los Angeles';
  var apiURL = "https://api.openweathermap.org/data/2.5/weather?q="
    + city + "&units=imperial&appid=";

  fetch(apiURL).then(function(response) {
    if (response.ok) {
      response.json().then(function(data) {
        getCityOneCall(data);
      });
    } else {
      alert("Error: " + response.statusText);
    }
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

  // get current date
  var dateArr = new Date().toLocaleDateString('en-US').split('/');
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
  currentTempEl.textContent = 'Temperature: ' + temp + '°F';
  currentHumidityEL.textContent = 'Humidity: ' + humidity + '%';
  currentWSEl.textContent = 'Wind Speed: ' + windSpeed + 'MPH';
  currentUViEl.innerHTML = 'UV Index: ' + uvIndex;

};

getCity();