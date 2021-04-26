const { Duplex } = require('streamx')
const preventGlobalError = () => {}

module.exports = class WebSocketStream extends Duplex {
  constructor (socket) {
    super()

    this.socket = socket

    if (this.socket.on) {
      this.socket.on('message', (data) => this._pushBuffer(data))
      this.socket.on('error', preventGlobalError)
    } else {
      this.socket.binaryType = 'arraybuffer'
      this.socket.onmessage = (e) => this.push(Buffer.from(e.data))
      this.socket.onerror = preventGlobalError
    }

    this._readableState.updateNextTick() // trigger open straight way
  }

  _pushBuffer (data) {
    if (typeof data === 'string') data = Buffer.from(data)
    if (!Buffer.isBuffer(data)) return
    this.push(data)
  }

  _open (cb) {
    if (this.socket.readyState === 1) return cb(null)
    if (this.socket.readyState !== 0) return cb(new Error('Closed'))

    const self = this
    let opened = false
    const onopen = () => done(null)
    const onclose = (event) => {
      const error = eventToError(event)
      if (opened) {
        this.destroy(error)
      } else {
        done(error)
      }
    }

    if (this.socket.on) {
      this.socket.on('open', onopen)
      this.socket.on('close', onclose)
    } else {
      this.socket.onopen = onopen
      this.socket.onclose = onclose
    }

    function done (err) {
      opened = true
      if (self.socket.on) {
        self.socket.removeListener('open', onopen)
      } else {
        self.socket.onopen = null
      }

      if (!err) self.emit('connect')
      cb(err)
    }
  }

  _predestroy () {
    this.socket.close()
  }

  _destroy (cb) {
    this.socket.close()
    cb()
  }

  _write (data, cb) {
    this.socket.send(data)
    cb(null)
  }
}

function eventToError (event) {
  return new Error(`Websocket[url=${event.target.url}] closed[${event.code}] (reason="${event.reason}", clean=${event.wasClean})`)
}
