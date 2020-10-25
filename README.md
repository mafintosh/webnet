# webnet

WebSockets with a Node.js `net` compatible interface.

```
npm install webnet
```

Useful for Node.js/browser interop of low level protocols.

## Usage

``` js
const { createServer, connect } = require('webnet')

// similar to net.createServer and net.connect except the use a websocket

const server = createServer(function (socket) {
  console.log('New client! echoing')
  socket.pipe(socket)
})

server.listen(9090, function () {
  const socket = connect(9090)

  socket.on('connect', function () {
    console.log('connected!')
  })

  socket.on('data', function (data) {
    console.log('got data', data)
  })

  socket.write('hi')
})
```

## License

MIT
