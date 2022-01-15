import AbstractView from "./AbstractView.js";

export default class extends AbstractView {
	constructor() {
		super();
		this.setTitle("NFChat - Room List");
	}

	async getHTML() {
		const response = await fetch(`static/css/roomlist.html`);
     	const text = await response.text();
    	return text;
	}
}