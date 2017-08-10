const express = require('express');

class Webserver {
    constructor(port) {
        this.port = port;
        this.app = express();
        this.server = require('http').Server(this.app);
        this.io = require('socket.io')(this.server);

        this.initVariables();
        this.initRoutes();
        this.initSockets();
        this.boot();
    }
    initVariables() {
        this.usernames = {};
        this.rooms = {
            default: {
                users: {},
                messages: [],
            },
        };
    }
    initRoutes() {
        this.app.use(express.static('public'));
        this.app.get('/', (req, res) => {
            res.sendFile('index.html')
        });
    }

    initSockets() {
        this.io.on('connection', (socket) => {
            console.log(`A new user connected on ${ socket.id }`);

            socket.on('register', (username) => {
                console.log(`user on socket ${socket.id} requests username: ${ username }`);
                let count = Object.keys(this.usernames)
                    .map(uid => this.usernames[uid])
                    .filter(user => username === user)
                    .length;

                if (count > 0) {
                    socket.emit('register.failed', 'username in use');
                    return;
                }

                this.usernames[socket.id] = username;
                this.rooms.default.users[username] = { username: username };
                socket.emit('register.success', this.rooms);
                this.io.emit('system-message', `${username} connected.`)
            });
            socket.on('message', (message) => {
                var message = {
                    user: this.usernames[socket.id],
                    message: message,
                }

                this.io.emit('message', message);
                this.io.emit('message.success');
            });
            socket.on('disconnect', () => {
                if (this.usernames[socket.id]) {
                    this.io.emit('system-message', `${this.usernames[socket.id]} disconnected.`)
                }
                delete this.usernames[socket.id];
                console.log(`user on socket ${socket.id} disconnected.`);
            });
        });
    }

    boot() {
        this.server.listen(this.port, () => {
            console.info(`Server listening on ${ this.port }.`);
        });
    }
}

module.exports = Webserver;
