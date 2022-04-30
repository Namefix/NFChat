import Start from "./views/Start.js";
import RoomList from "./views/RoomList.js";
import Create from "./views/Create.js";
import Chat from "./views/Chat.js";

const navigateTo = url => {
	history.pushState(null,null,url);
	router();
}

const router = async () => {
	const routes = [
		{path: "/", view:Start},
		{path: "/roomlist", view:RoomList},
		{path: "/create", view:Create},
		{path: "/chat", view:Chat}
	];

	if(PlayerName == "" && location.pathname != "/") location.pathname = "/" 

	const potentialMatches = routes.map(route => {
		return {
			route: route,
			isMatch: location.pathname === route.path
		}
	});

	let match = potentialMatches.find(potentialMatch => potentialMatch.isMatch);

	if(!match) {
		match = {
			route: routes[0],
			isMatch: true
		}
		location.pathname = "/";
	}

	const view = new match.route.view();
	currentPage = location.pathname;

	document.querySelector("#app").innerHTML = await view.getHTML();

	if(location.pathname == "/roomlist") {
		requestRoomList();
		roomListElement = document.querySelector("#roomlist");
	}
	if(location.pathname == "/chat") {
		requestRoomList();
		chatBox = document.querySelector("#chatbox");
	}

	const event = new CustomEvent('pagechange', { detail: currentPage });

	document.dispatchEvent(event);
};

window.addEventListener("popstate", router);

document.addEventListener("DOMContentLoaded", () => {
	connect();
	document.body.addEventListener("click", e => {
		if(e.target.id == "sendbox" || e.target.parentElement.id == "sendbox") {
			if(document.querySelector(".start-input").value == "") {
				return;
			}
			PlayerName = document.querySelector(".start-input").value;
			changeColor(AvatarColor);
			changeUsername(PlayerName);
		}

		if(e.target.hasAttribute("nfchat") || e.target.parentElement.hasAttribute("nfchat")) {
			e.preventDefault();
			let target = e.target.getAttribute("href") || e.target.parentElement.getAttribute("href");
			navigateTo(target);
		}
	});

	router();
});

document.addEventListener('router', function (e) { 
	navigateTo(e.detail)
 }, false);
