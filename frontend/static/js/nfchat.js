let currentPage = "/";
let PlayerName = "";

let roomListElement = document.querySelector("#roomlist");

function invertColor(hexcolor) {
    hexcolor = hexcolor.replace("#", "");
    var r = parseInt(hexcolor.substr(0,2),16);
    var g = parseInt(hexcolor.substr(2,2),16);
    var b = parseInt(hexcolor.substr(4,2),16);
    var yiq = ((r*299)+(g*587)+(b*114))/1000;
    return (yiq >= 128) ? 'black' : 'white';
  }

console.log("NFChat.js loaded.")
document.addEventListener("DOMContentLoaded", () => {
	
});

let socket;
function connect() {
	console.log("Socket.IO INIT");
	socket = io();

	socket.on("hubs.create", (success) => {
		if(!success) console.log("failed to create a room")
		if(success) console.log("created a room")
	});

	socket.on("hubs.list", (list) => {
		roomListElement.innerHTML = "";

		list.forEach((hub) => {
			var item = document.createElement('li');
			let inverted = invertColor(hub.color);
			item.innerHTML = `
				<div>
					<span class="roomlist-text roomlist-roomname" style="color: ${inverted};">${hub.name}</span>
					<span class="roomlist-text roomlist-roomtag" style="color: ${inverted};">#${hub.tag}</span>
				</div>
				<div>
					<span class="roomlist-text roomlist-usercount" style="color: ${inverted};">${hub.users}</span>
					<span class="roomlist-text roomlist-maxusers" style="color: ${inverted};">/${hub.maxusers}</span>
					<i class="fa-solid fa-user" style="margin-left: 12px; margin-right: 20px; color: ${inverted};"></i>
				</div>
			`
			//item.setAttribute("nfchat", true)
			//item.setAttribute("href", "/")
			item.setAttribute("onclick", `joinHub("${hub.name}#${hub.tag}")`);
			item.style.backgroundColor = hub.color;
			roomListElement.appendChild(item);
		});
	});
}

function changeUsername(username) {
	socket.emit("user.changename", username);
}

function createRoom() {
	let roomName = document.querySelector("#create-settings-name-box").value;
	let roomColor = document.querySelector("#create-settings-name-color").value;
	let userCount = document.querySelector("#create-settings-members-count").value;

	socket.emit("hubs.create", roomName, roomColor, userCount);
}

function requestRoomList() {
	socket.emit("hubs.list");
}

function joinHub(hub) {
	socket.emit("hubs.join", hub);
}
