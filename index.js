const { EventEmitter } = require('events')
const http = require('http')
const WebSocket = require('ws')
const WebSocketStream = require('./websocket')

module.exports = { createServer, connect }

function createServer (onconnection) {
  const server = new Server()
  if (onconnection) server.on('connection', onconnection)
  return server
}

function connect (port, host) {
  const url = typeof port === 'number' ? 'ws://' + (host || 'localhost') + ':' + port : port
  const socket = new WebSocket(url)
  return new WebSocketStream(socket)
}

class Server extends EventEmitter {
  constructor () {
    super()
    this._ws = null
    this._server = null
  }

  close (onclose) {
    if (!this._ws) return
    if (onclose) this.once('close', onclose)
    this._server.close()
  }

  address () {
    return this._server.address()
  }

  listen (...args) {
    if (!this._server) {
      this._server = http.createServer()
      this._server.on('listening', () => this.emit('listening'))
      this._server.on('close', () => this.emit('close'))
      this._server.on('error', err => this.emit('error', err))
    }

    this._ws = new WebSocket.Server({ noServer: true })

    this._server.on('upgrade', (request, socket, head) => {
      this._ws.handleUpgrade(request, socket, head, (ws) => {
        this.emit('connection', new WebSocketStream(ws))
      })
    })

    if (args.length && typeof args[args.length - 1] === 'function') {
      this.once('listening', args.pop())
    }

    this._server.listen(...args)
  }
}
