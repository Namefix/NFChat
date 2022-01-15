import AbstractView from "./AbstractView.js";

export default class extends AbstractView {
	constructor() {
		super();
		this.setTitle("NFChat - Create");
	}

	async getHTML() {
		const response = await fetch(`static/css/create.html`);
     	const text = await response.text();
    	return text;
	}
}