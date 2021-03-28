// form vars
var $inputEl = $('#city-search');
var $searchBtnEl = $('#search-btn');
var $searchFormEl = $('#search-form');
// lsit var
var $cityList = $('#city-list');
// current weather var
var $currentCityEl = $('#current-city');
var $currentTempEl = $('#current-temp');
var $currentHumidityEL = $('#current-humidity');
var $currentWSEl = $('#current-ws');
var $currentUViEl = $('#current-uvi');
// 5 day forecast var
var $weekForecastEl = $('#week-forecast');
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
  var cityInput = $inputEl.val().trim().toLowerCase();
  $inputEl.val(" ");

  // format city name uniformity
  var citySplit = cityInput.split(' ');
  for (var i = 0; i < citySplit.length; i++) {
    citySplit[i] = citySplit[i][0].toUpperCase() + citySplit[i].substr(1);
  }
  var city = citySplit.join(' ');
  // send to fetch request
  getCity(city);
};

var listSubmitHandler = function(event) {
  event.preventDefault;

  var city = event.target.textContent;
  console.log(city);
  getCity(city);
};

var updateList = function(city) {
  var $listItem = $('<li>')
    .addClass('list-group-item')
    .text(city);
  $cityList.append($listItem);

};

function displayCityList() {
  for (i = 0; i < cityArr.length; i++) {
    var $listItem = $('<li>')
    .addClass('list-group-item')
    .text(cityArr[i]);
  $cityList.append($listItem);
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

function uviWarning(uvIndex, $uviSpan) {
  if (uvIndex < 3) {
    $uviSpan
      .removeClass('moderate', 'high')
      .addClass('low');
  } else if (uvIndex >= 3) {
    $uviSpan
      .removeClass('low', 'high')
      .addClass('moderate');
  } else if (uvIndex > 6) {
    $uviSpan
      .removeClass('low', 'moderate')
      .addClass('high');
  };
};

var displayWeather = function(data, city) {
  console.log(data);

  // get date
  var unixDate = data.current.dt;
  var dateArr = new Date(unixDate * 1000).toLocaleDateString('en-US').split('/');
  var date = "(" + dateArr[0] + "/" + dateArr[1] + "/" + dateArr[2] + ")";

  // get weather icon
  var weatherIcon = data.current.weather[0].icon;
  var iconSrc = "http://openweathermap.org/img/w/" + weatherIcon + ".png";

  // display info
  $currentCityEl
    .html(city + " " + date + " " + `<img src=${iconSrc}>`);

  // get desired data
  var temp = data.current.temp;
  var humidity = data.current.humidity;
  var windSpeed = data.current.wind_speed;
  var uvIndex = data.current.uvi;

  // create uvi span and warning logic
  var $uviSpan = $('<span>')
    .addClass('uvi-span')
    .text(uvIndex);
  uviWarning(uvIndex, $uviSpan);
  
  // display desired data
  $currentTempEl
    .text('Temperature: ' + temp + ' °F');
  $currentHumidityEL
    .text('Humidity: ' + humidity + ' %');
  $currentWSEl
    .text('Wind Speed: ' + windSpeed + ' MPH');
  $currentUViEl
    .text('UV Index: ');
  $currentUViEl.append($uviSpan);

  display5Day(data);
};

var display5Day = function(data) {
  // clear old content
  $weekForecastEl.empty();

  for (i = 1; i < 6; i++) {
    // get date and format
    var unixDate = data.daily[i].dt;
    var dateArr = new Date(unixDate * 1000).toLocaleDateString('en-US').split('/');
    var date = "(" + dateArr[0] + "/" + dateArr[1] + "/" + dateArr[2] + ")";

    // get weather icon value and format src
    var weatherIcon = data.daily[i].weather[0].icon;
    var iconSrc = "http://openweathermap.org/img/w/" + weatherIcon + ".png";

    // get temperature and humidity
    var temp = data.daily[i].temp.day;
    var humidity = data.daily[i].humidity;

    // create card
    var $cardEl = $('<div>')
      .addClass('card');

    // title
    var $cardTitleEl = $('<p>')
      .addClass('card-title', 'date')
      .text(date);

    // weather icon
    var $iconEl = $('<img>')
      .attr({
        src: `${iconSrc}`,
        width: '50px'
      });

    // temperature
    var $tempSpan = $('<span>')
      .addClass('in-line')
      .text(temp + ' °F');
    var $tempEl = $('<p>')
      .addClass('card-text')
      .text('Temp: ');

    // humidity
    var $humiditySpan = $('<span>')
      .addClass('in-line')
      .text(humidity + ' %');
    var $humidityEl = $('<p>')
      .addClass('card-text')
      .text('Humidity: ');

    // append to page
    $tempEl.append($tempSpan);
    $humidityEl.append($humiditySpan);
    $cardEl.append($cardTitleEl, $iconEl, $tempEl, $humidityEl);
    $weekForecastEl.append($cardEl);
  };
};

$searchBtnEl.click(searchSubmitHandler);
$inputEl.keypress(function(e) {
  if (e.keyCode === 13) {
    e.preventDefault();
    $searchBtnEl.click();
  }
});
$cityList.click(function(event) {
  if (event.target.tagName.toLowerCase() === 'li') {
    listSubmitHandler(event);
  };
});