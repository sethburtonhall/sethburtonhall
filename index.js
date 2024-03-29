require('dotenv').config();
const Mustache = require('mustache');
const fetch = require('node-fetch');
const fs = require('fs');
const puppeteerService = require('./services/puppeteer.service');

const MUSTACHE_MAIN_DIR = './main.mustache';

/**
 * DATA is the object that contains all
 * the data to be provided to Mustache
 * Notice the "name" and "date" property.
 */
let DATA = {
  name: 'Seth',
  date: new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    timeZoneName: 'short',
    timeZone: 'America/New_York',
  }),
};

async function setWeatherInfo() {
  await fetch(
    `https://api.openweathermap.org/data/2.5/weather?id=4498231&appid=${process.env.OPEN_WEATHER_MAP_KEY}&units=imperial`
  )
    .then((r) => r.json())
    .then((r) => {
      DATA.city_temperature = Math.round(r.main.temp);
      DATA.city_weather = r.weather[0].description;
      DATA.city_weather_icon = r.weather[0].icon;
      DATA.sun_rise = new Date(r.sys.sunrise * 1000).toLocaleString('en-US', {
        hour: 'numeric',
        minute: 'numeric',
        timeZoneName: 'short',
        timeZone: 'America/New_York',
      });
      DATA.sun_set = new Date(r.sys.sunset * 1000).toLocaleString('en-US', {
        hour: 'numeric',
        minute: 'numeric',
        timeZoneName: 'short',
        timeZone: 'America/New_York',
      });
    });
}

async function setInstagramPosts() {
  const instagramImages =
    await puppeteerService.getLatestInstagramPostsFromAccount('visitnc', 4);
  DATA.img1 = instagramImages[0];
  DATA.img2 = instagramImages[1];
  DATA.img3 = instagramImages[2];
  DATA.img4 = instagramImages[3];
}

/**
 * A - We open 'main.mustache'
 * B - We ask Mustache to render our file with the data
 * C - We create a README.md file with the generated output
 */
function generateReadMe() {
  fs.readFile(MUSTACHE_MAIN_DIR, (err, data) => {
    if (err) throw err;
    const output = Mustache.render(data.toString(), DATA);
    fs.writeFileSync('README.md', output);
  });
}

async function action() {
  await setWeatherInfo();
  await setInstagramPosts();
  await generateReadMe();
  await puppeteerService.close();
}

action();
