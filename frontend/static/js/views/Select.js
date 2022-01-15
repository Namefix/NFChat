import AbstractView from "./AbstractView.js";

export default class extends AbstractView {
	constructor() {
		super();
		this.setTitle("NFChat - Chat Hub Type");
	}

	async getHTML() {
		const response = await fetch(`static/css/select.html`);
     	const text = await response.text();
    	return text;
	}
}