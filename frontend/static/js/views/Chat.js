import AbstractView from "./AbstractView.js";

export default class extends AbstractView {
	constructor() {
		super();
		this.setTitle("NFChat");
	}

	async getHTML() {
		const response = await fetch(`static/css/chat.html`);
     	const text = await response.text();
    	return text;
	}
}