require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const helmet = require('helmet')
const { NODE_ENV } = require('./config')
const { v4: uuid } = require('uuid')

const app = express()

const morganOption = (NODE_ENV === 'production')
  ? 'tiny'
  : 'common';

app.use(morgan(morganOption))
app.use(helmet())
app.use(cors())
app.use(express.json())

// {
//   id: UUID,
//   firstName: String,
//   lastName: String,
//   address1: String,
//   address2: String,
//   city: String,
//   state: String,
//   zip: Number
// }

const addressBook = [
  {
    'id': uuid(),
    'firstName': 'Bob',
    'lastName': 'Test',
    'address1': '123 Main Street',
    'address2': 'apt 1',
    'city': 'SLC',
    'state': 'UT',
    'zip': 84123
  }
]

app.get('/address', (req, res) => {
  res.status(200).json(addressBook)
})

app.post('/address', (req, res) => {
  const { firstName, lastName, address1, address2, city, state, zip } = req.body
  
  // Do we have the info we need?
  if(!firstName) {
    res
      .status(400)
      .send('First name is required')
  }

  if(!lastName) {
    res
      .status(400)
      .send('Last name is required')
  }

  if(!address1) {
    res
      .status(400)
      .send('Address line 1 is required')
  }

  if(!city) {
    res
      .status(400)
      .send('City is required')
  }

  if(!state) {
    res
      .status(400)
      .send('State is required')
  }

  if(!zip) {
    res
      .status(400)
      .send('Zip is required')
  }

  // Is the info we received valid?

  if(state.length !== 2) {
    res
      .status(400)
      .send('Please provide a valid state code')
  }

  if(zip.toString().length !== 5 && typeof zip !== 'number') {
    res
      .status(400)
      .send('Please provide a valid zip code')
  }
  const id = uuid()
  const newAddress = {
    id,
    firstName,
    lastName,
    address1,
    address2,
    city,
    state,
    zip
  }

  addressBook.push(newAddress)

  res
    .status(201)
    .location(`http://localhost:8000/address/${id}`)
    .json(newAddress)
})

app.use(function errorHandler(error, req, res, next) {
  let response
  if(NODE_ENV === 'production') {
    response = { error: {message: 'server error'}}
  } else {
    console.error(error)
    response = { message: error.message, error }
  }
  res.status(500).json(response)
})

module.exports = app