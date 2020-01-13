require('./helpers/local-require')
const { test } = require('tap')
const handler = require('..')

process.env.PORT = 1

const express = require('express')
const app = express()

let onRequest = (req, res) => res.send()

app.get('/', (req, res) => onRequest(res, res))
app.listen(process.env.PORT)

const event = { httpMethod: 'GET', requestContext: { path: '/' }, headers: {} }

test('callbackWaitsForEmptyEventLoop yes', t => {
  process.env.WAIT_FOR_EMPTY_EVENT_LOOP = 'yes'
  const context = {}
  handler(event, context, () => {
    t.equals(true, context.callbackWaitsForEmptyEventLoop)
    t.end()
  })
})

test('callbackWaitsForEmptyEventLoop not yes', t => {
  process.env.WAIT_FOR_EMPTY_EVENT_LOOP = 'xyes'
  const context = {}
  handler(event, context, () => {
    t.equals(false, context.callbackWaitsForEmptyEventLoop)
    t.end()
  })
})

test('serverless-plugin-warmup', t => {
  const warmup = { ...event, source: 'serverless-plugin-warmup' }
  handler(warmup, {}, (err, result) => {
    t.error(err)
    t.equals('Lambda is warm!', result)
    t.end()
  })
})

test('ok response', t => {
  onRequest = (req, res) => {
    res.send('ok')
  }
  handler(event, {}, (err, result) => {
    t.error(err)
    t.equals('ok', result.body)
    t.equals(200, result.statusCode)
    t.end()
  })
})

test('SERVER_PORT', t => {
  delete process.env.PORT
  process.env.SERVER_PORT = 1
  onRequest = (req, res) => {
    res.send('still ok')
  }
  handler(event, {}, (err, result) => {
    t.error(err)
    t.equals('still ok', result.body)
    t.equals(200, result.statusCode)
    t.end()
  })
})