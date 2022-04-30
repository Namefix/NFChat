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
	socket.avatarColor = '#' + (Math.random() * 0xfffff * 1000000).toString(16).slice(0,6);
	let users = await getUsers(false);
	console.log(`[NFCHAT] ${socket.username} is connected. (${users.length})`);
	
	socket.on("disconnect", (reason) => {
		if(socket.currentroom) {
			let chub = null;
			let index = null;
			chathubs.forEach((hub, i) => {
				if(hub.name + "#" + hub.tag === socket.currentroom) {
					chub = hub;
					index = i;
				}
			});
			if(!chub) return;
			chub.users--;
			if(chub.users <= 0) {chathubs.splice(index, 1); socket.broadcast.emit("hubs.list", chathubs); return;}
			io.to(chub.name+"#"+chub.tag).emit("chat.disconnect", socket.username);
			io.to(chub.name+"#"+chub.tag).emit("chat.notify", `${socket.username} left.`, "error");
			socket.broadcast.emit("hubs.list", chathubs);
		}
	})

	socket.on("user.changename", (username) => {
		socket.username = username;
	});

	socket.on("user.changecolor", (color) => {
		socket.avatarColor = color;
	});

	socket.on("hubs.create", (roomName, roomColor, userCount) => {
		if(socket.currentroom) return;
		let roomTag = Math.floor(Math.random() * (999999 - 100000) + 100000);
		let fullName = roomName + "#" + roomTag;
		socket.currentroom = fullName;
		socket.join(fullName);
		socket.emit("hubs.create", true, roomName, roomTag, roomColor, socket.avatarColor);
		chathubs.push({name:roomName,tag:roomTag,color:roomColor,users:1,maxusers:userCount});
		socket.broadcast.emit("hubs.list", chathubs);
	});

	socket.on("hubs.list", () => {
		socket.emit("hubs.list", chathubs);
	});

	socket.on("hubs.join", (fullName) => {
		if(socket.currentroom) return;
		let chub = null;
		let found = false;
		chathubs.forEach((hub) => {
			if(hub.name + "#" + hub.tag === fullName) {
				if(hub.users < hub.maxusers) {
					found = true;
					hub.users++;
					chub = hub;
				}	
			}
		});
		if(!found) {socket.emit("hubs.joined", false); return;}
		if(chub.users >= chub.maxusers) {socket.emit("hubs.joined", false); return};
		socket.currentroom = fullName;
		socket.join(fullName);
		socket.emit("hubs.joined", true, chub.name, chub.tag, chub.color, socket.avatarColor);
		io.to(fullName).emit("chat.connect", socket.username);
		io.to(fullName).emit("chat.notify", `${socket.username} joined.`, "success");
		socket.broadcast.emit("hubs.list", chathubs);
	});

	socket.on("chat.message", (message) => {
		if(!socket.currentroom) return;
		io.to(socket.currentroom).emit("chat.message", socket.username, message, socket.avatarColor);
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

