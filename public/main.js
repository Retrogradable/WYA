
const getGeoLocation = () => new Promise(
  (resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        position => {
          const coords = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        }
        
        resolve(coords)
      },
      error => reject(error))
  }
)

const getIP = async () => {
  const res = await fetch('https://api.ipify.org?format=json')
  const json = await res.json()
  const ip = json.ip
  return ip
}

const getTimeZone = async ({ latitude, longitude }) => {
  const res = await fetch(`http://localhost:1337/api/timezone?lat=${latitude}&lng=${longitude}`)
  const json = await res.json()
  return json
}

const getAddress = async ({ latitude, longitude }) => {
  const res = await fetch(`http://localhost:1337/api/address?lat=${latitude}&lng=${longitude}`)
  const json = await res.json()
  return json.results
}

const renderClock = () => {
  const clockElem = document.querySelector('.geoInfo__clock')

  let date = new Date()
  let hours = date.getHours()
  let minutes = date.getMinutes()
  let seconds = date.getSeconds()
  let ampm = hours > 12 ? 'PM' : 'AM'

  if(hours == 0)
    hours = 12
  if(hours > 12)
    hours -= 12

  clockElem.innerHTML = `Clock time: ${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')} ${ampm}`

  setTimeout(renderClock, 1000)
}

const renderInfo = async function (coords, ip, address, timeZone, clockRenderer) {
  const coordsElem = document.querySelector('.geoInfo__coords')
  const ipElem = document.querySelector('.geoInfo__ip')
  const addressElem = document.querySelector('.geoInfo__address')
  const timeZoneElem = document.querySelector('.geoInfo__timeZone')

  coordsElem.innerHTML = `Latitude: ${coords.latitude}, Longitude: ${coords.longitude}`
  ipElem.innerHTML = `IP address: ${ip}`
  addressElem.innerHTML = `Address location: ${address}`
  timeZoneElem.innerHTML = `Timezone: ${timeZone}`

  clockRenderer()
}

const map = L.map('map').setView([0, 0], 13)

const displayBtn = document.querySelector('.geoInfo__button')

displayBtn.addEventListener('click', async () => {
  const coords = await getGeoLocation()
  const ip = await getIP()
  let address = await getAddress(coords)
  let timeZone = await getTimeZone(coords)

  // Get the first (most accurate) result from the array of returned address components API object.
  // Format the timeZone
  address = address[0].formatted_address
  timeZone = `${timeZone.timeZoneId} ${timeZone.timeZoneName}`

  // Display all results on the page.
  renderInfo(coords, ip, address, timeZone, renderClock)

  // Testing call (avoids exhausting Google Maps API calls when refreshing)
  //renderInfo(coords, '127.0.0.1', '1234 my dog is best rd.', 'Some place in the world', renderClock)

  // Set the location of the Leaflet map
  map.setView([coords.latitude, coords.longitude], 13)
  L.marker([coords.latitude, coords.longitude]).addTo(map)
  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map)
}, { once: true })