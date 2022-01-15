export default class {
	constructor() {

	}

	setTitle(title) {
		document.title = title;
	}

	async getHTML() {
		const response = await fetch("");
     	const text = await response.text();
    	return text;
	}

}