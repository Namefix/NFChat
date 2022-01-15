const express = require("express");
const path = require("path");
const http = require('http');
const { Server } = require("socket.io");

let PORT = 8000;

const app = express();
const server = http.createServer(app);

const io = new Server(server);

app.use("/static", express.static(path.resolve(__dirname, "frontend", "static")));

app.get("/*", (req, res) => {
	res.sendFile(path.resolve(__dirname, "frontend", "main.html"));
});

server.listen(PORT, () => {
	console.log(`[NFCHAT] Listening at port ${PORT}`);
});

// SOCKET.IO

let chathubs = [];

async function getUsers(filter=true) {
	const sockets = await io.fetchSockets();
	let users = [];
	sockets.forEach((client) => {
		if(filter) {
			if(client.username != "Unnamed") {
				users.push({id:client.id,username:client.username});
			}
		} else {
			users.push({id:client.id,username:client.username});
		}
	});
	return users;
}

io.on("connection", async (socket) => {
	if(!socket.username) socket.username = "Unnamed";
	let users = await getUsers(false);
	console.log(`[NFCHAT] ${socket.username} is connected. (${users.length})`);
	
	socket.on("user.changename", (username) => {
		socket.username = username;
	});

	socket.on("hubs.create", (roomName, roomColor, userCount) => {
		if(socket.currentroom) return;
		let roomTag = Math.floor(Math.random() * (999999 - 100000) + 100000);
		let fullName = roomName + "#" + roomTag;
		socket.currentroom = fullName;
		socket.join(fullName);
		socket.emit("hubs.create", true);
		chathubs.push({name:roomName,tag:roomTag,color:roomColor,users:1,maxusers:userCount});
		socket.broadcast.emit("hubs.list", chathubs);
	});

	socket.on("hubs.list", () => {
		socket.emit("hubs.list", chathubs);
	});

	socket.on("hubs.join", (fullName) => {
		if(socket.currentroom) return;
		let found = false;
		chathubs.forEach((hub) => {
			if(hub.name + "#" + hub.tag === fullName) {
				if(hub.users < hub.maxusers) {
					found = true;
					hub.users++;
				}	
			}
		});
		if(!found) return;
		socket.currentroom = fullName;
		socket.join(fullName);
		io.to(fullName).emit("chat.connect", socket.username);
		socket.broadcast.emit("hubs.list", chathubs);
	});
});

io.of("/").adapter.on("create-room", async (room) => {
	// FILTER DEFAULT ROOMS
	const sockets = await io.fetchSockets();
	let clientRoom = false;
	sockets.forEach((client) => {
		if(client.id === room) clientRoom = true;
	});
	if(clientRoom) return;
	console.log(`room ${room} was created`);
});

