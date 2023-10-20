const express = require('express')
const app = express()
const path = require('path')

if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config()
}

const port = process.env.port || 3000

app.use(express.json())
app.use('/', express.static(path.join(__dirname, 'public')))

const reverseGeocode = async ({ lat, lng }) => {
  const response = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat}%2C${lng}&key=${process.env.G_API_KEY}`)
  const data = await response.json()
  return data
}

const getTimeZone = async ({ lat, lng }) => {
  const response = await fetch(`https://maps.googleapis.com/maps/api/timezone/json?location=${lat}%2C${lng}&timestamp=${Date.now()/1000}&key=${process.env.G_API_KEY}`)
  const data = await response.json()
  return data
}

app.get('/api/timezone', async (req, res) => {
  const latLng = {...req.query}

  console.log(latLng)
  const data = await getTimeZone(latLng)

  console.log(data)
  res.send(data)
})

app.get('/api/address', async (req, res) => {
  const latLng = {...req.query}
  const data = await reverseGeocode(latLng)
  res.send(data)
})

app.listen(port, () => {
  console.log(`Server listening on port ${port}`)
})