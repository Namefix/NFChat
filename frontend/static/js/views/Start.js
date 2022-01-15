import AbstractView from "./AbstractView.js";

export default class extends AbstractView {
	constructor() {
		super();
		this.setTitle("NFChat - Start");
	}

	async getHTML() {
		const response = await fetch(`static/css/start.html`);
     	const text = await response.text();
    	return text;
	}
}