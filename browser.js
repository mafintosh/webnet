const WebSocketStream = require('./websocket')

module.exports = { createServer, connect }

function createServer () {
  throw new Error('Cannot create a websocket server in a browser context')
}

function connect (port, host) {
  const url = typeof port === 'number' ? 'ws://' + (host || 'localhost') + ':' + port : port
  const socket = new window.WebSocket(url)
  return new WebSocketStream(socket)
}
