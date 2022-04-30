let currentPage = "/";
let PlayerName = "";
let AvatarColor = "#FFFFFF";
let unseenMessages = 0;

let hubName = "";
let hubTag = "";
let hubColor = "";

let roomListElement = document.querySelector("#roomlist");
let chatBox = document.querySelector("#chatbox");
let sendBox = document.querySelector("#messagesendbox");
let autoScroll = document.querySelector("#autoscroll");

function invertColor(hexcolor) {
    hexcolor = hexcolor.replace("#", "");
    var r = parseInt(hexcolor.substr(0,2),16);
    var g = parseInt(hexcolor.substr(2,2),16);
    var b = parseInt(hexcolor.substr(4,2),16);
    var yiq = ((r*299)+(g*587)+(b*114))/1000;
    return (yiq >= 128) ? 'black' : 'white';
}

const pSBC=(p,c0,c1,l)=>{
    let r,g,b,P,f,t,h,i=parseInt,m=Math.round,a=typeof(c1)=="string";
    if(typeof(p)!="number"||p<-1||p>1||typeof(c0)!="string"||(c0[0]!='r'&&c0[0]!='#')||(c1&&!a))return null;
    if(!this.pSBCr)this.pSBCr=(d)=>{
        let n=d.length,x={};
        if(n>9){
            [r,g,b,a]=d=d.split(","),n=d.length;
            if(n<3||n>4)return null;
            x.r=i(r[3]=="a"?r.slice(5):r.slice(4)),x.g=i(g),x.b=i(b),x.a=a?parseFloat(a):-1
        }else{
            if(n==8||n==6||n<4)return null;
            if(n<6)d="#"+d[1]+d[1]+d[2]+d[2]+d[3]+d[3]+(n>4?d[4]+d[4]:"");
            d=i(d.slice(1),16);
            if(n==9||n==5)x.r=d>>24&255,x.g=d>>16&255,x.b=d>>8&255,x.a=m((d&255)/0.255)/1000;
            else x.r=d>>16,x.g=d>>8&255,x.b=d&255,x.a=-1
        }return x};
    h=c0.length>9,h=a?c1.length>9?true:c1=="c"?!h:false:h,f=this.pSBCr(c0),P=p<0,t=c1&&c1!="c"?this.pSBCr(c1):P?{r:0,g:0,b:0,a:-1}:{r:255,g:255,b:255,a:-1},p=P?p*-1:p,P=1-p;
    if(!f||!t)return null;
    if(l)r=m(P*f.r+p*t.r),g=m(P*f.g+p*t.g),b=m(P*f.b+p*t.b);
    else r=m((P*f.r**2+p*t.r**2)**0.5),g=m((P*f.g**2+p*t.g**2)**0.5),b=m((P*f.b**2+p*t.b**2)**0.5);
    a=f.a,t=t.a,f=a>=0||t>=0,a=f?a<0?t:t<0?a:a*P+t*p:0;
    if(h)return"rgb"+(f?"a(":"(")+r+","+g+","+b+(f?","+m(a*1000)/1000:"")+")";
    else return"#"+(4294967296+r*16777216+g*65536+b*256+(f?m(a*255):0)).toString(16).slice(1,f?undefined:-2)
}

function navigateTo(url) {
	const event = new CustomEvent('router', { detail: url });

	document.dispatchEvent(event);
}

function hexToRgb(hex) {
	// Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
	var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
	hex = hex.replace(shorthandRegex, function(m, r, g, b) {
	  return r + r + g + g + b + b;
	});
  
	var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
	return result ? {
	  r: parseInt(result[1], 16),
	  g: parseInt(result[2], 16),
	  b: parseInt(result[3], 16)
	} : null;
  }

function escapeHtml(unsafe)
{
	return unsafe
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;")
		.replace(/'/g, "&#039;");
}

console.log("NFChat.js loaded.")
document.addEventListener("DOMContentLoaded", () => {
	
});

document.addEventListener("visibilitychange", () => {
	if(location.pathname != "/chat") return;
	if(document.hasFocus()) {
		unseenMessages = 0;
		document.title = "NFChat";
	}
}, false);

let socket;
function connect() {
	socket = io();

	socket.on("hubs.create", (success, hname, htag, hcolor, aColor) => {
		if(!success) return console.log("failed to create a room")
		if(success) console.log("created a room")

		hubName = hname;
		hubTag = htag
		hubColor = hcolor;
		AvatarColor = aColor;

		navigateTo("/chat");
	});

	socket.on("hubs.list", (list) => {
		roomListElement.innerHTML = "";

		list.forEach((hub) => {
			var item = document.createElement('li');
			let inverted = invertColor(hub.color);
			item.innerHTML = `
				<div>
					<span class="roomlist-text roomlist-roomname" style="color: ${inverted};">${escapeHtml(hub.name)}</span>
					<span class="roomlist-text roomlist-roomtag" style="color: ${inverted};">#${hub.tag}</span>
				</div>
				<div>
					<span class="roomlist-text roomlist-usercount" style="color: ${inverted};">${hub.users}</span>
					<span class="roomlist-text roomlist-maxusers" style="color: ${inverted};">/${hub.maxusers}</span>
					<i class="fa-solid fa-user" style="margin-left: 12px; margin-right: 20px; color: ${inverted};"></i>
				</div>
			`
			item.setAttribute("onclick", `joinHub("${hub.name}#${hub.tag}")`);
			item.style.backgroundColor = hub.color;
			roomListElement.appendChild(item);
		});
	});

	socket.on("hubs.joined", (success, hname, htag, hcolor, aColor) => {
		if(!success) return console.log("Cannot join")

		hubName = hname;
		hubTag = htag;
		hubColor = hcolor;
		AvatarColor = aColor;

		navigateTo("/chat");
	});

	socket.on("chat.message", (user, msg, aColor) => {
		let item = document.createElement("li");
		let message = escapeHtml(msg);

		// Message Filter
		let messageFilter = [
			[":D", "😄"],
			[":flushed:", "😳"],
			[":sunglasses:", "😎"],
			[":yum:", "😋"]
		];

		for (let i = 0; i < messageFilter.length; i++) {
			message = message.replaceAll(messageFilter[i][0], messageFilter[i][1]);
		}

		item.innerHTML =
		`
		<div class="message-avatar" style="background-color: ${aColor}; border-color: ${pSBC(-0.60, aColor)};"></div>
		<div class="message-box"><span class="text">${message}</span></div>
		<span class="message-username text thin">${escapeHtml(user)}</span>
		`;

		chatBox.appendChild(item);
		autoScroll.scrollTop = autoScroll.scrollHeight;

		// Tab Modify
		if(!document.hasFocus()) {
			unseenMessages++;
			document.title = `NFChat (${unseenMessages})`
		}
	});

	socket.on("chat.notify", (msg, type) => {
		let item = document.createElement("li");
		item.classList.add("notification");
		let message = escapeHtml(msg);

		item.innerHTML =
		`
		<div class="${type}"><span class="text">${message}</span></div>
		`;

		chatBox.appendChild(item);
		autoScroll.scrollTop = autoScroll.scrollHeight;
	})
}

function changeUsername(username) {
	socket.emit("user.changename", username);
}

function changeColor(hex) {
	socket.emit("user.changecolor", hex);
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

document.addEventListener('pagechange', function (e) { 
	switch(e.detail) {
		case "/": {
			AvatarColor = '#' + (Math.random() * 0xfffff * 1000000).toString(16).slice(0,6);

			let colorPicker = document.querySelector("#avatarSelector");
			let avatarColor = document.querySelector("#avatar");
			let root = document.querySelector(":root");

			avatarColor.style.backgroundColor = AvatarColor;
			avatarColor.style.borderColor = pSBC(-0.4, AvatarColor);

			colorPicker.addEventListener("change", () => {
				avatarColor.style.backgroundColor = colorPicker.value;
				avatarColor.style.borderColor = pSBC(-0.4, colorPicker.value);
				root.style.setProperty('--selectorColor', invertColor(colorPicker.value));
				AvatarColor = colorPicker.value;
			}, false);
			break;
		}
		case "/chat": {
			let roomColor = document.querySelector("#hubavatar");
			let roomBG = document.querySelector("#topbar");
			let roomName = document.querySelector("#hubname");
			let roomTag = document.querySelector("#hubtag");

			let sendButton = document.querySelector("#sendbutton");
			sendBox = document.querySelector("#messagesendbox");
			let localAvatar = document.querySelector("#localAvatar");
			autoScroll = document.querySelector("#autoscroll");

			roomColor.style.backgroundColor = hubColor;
			roomColor.style.borderColor = pSBC(-0.60, hubColor);
			roomBG.style.backgroundColor = pSBC(0.60, hubColor);
			roomName.innerText = hubName;
			roomName.style.color = invertColor(pSBC(0.60, hubColor));
			roomTag.style.color = invertColor(pSBC(0.60, hubColor));
			roomTag.innerText = "#"+hubTag;

			localAvatar.style.backgroundColor = AvatarColor;
			localAvatar.style.borderColor = pSBC(-0.60, AvatarColor);

			sendButton.addEventListener("click", (event) => {
				if(sendBox.value == "") return;
				socket.emit("chat.message", sendBox.value);
				sendBox.value = "";
			});

			document.addEventListener("keydown", (event) => {
				if(event.code == "Enter") {
					if(sendBox.value == "") return;
					socket.emit("chat.message", sendBox.value);
					sendBox.value = "";
				}
			});
		}
	}
 }, false);