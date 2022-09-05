console.log("I'm here");

function start(){
	let t = document.getElementById("tite");
	var title = t.value;
	console.log(title);
	var body = document.getElementById("bod").value;
	console.log(body);
	let linktext1 = document.createTextNode("Your notes in modern style.")
	let linktext2 = document.createTextNode("Your notes in minimal style.")
	localStorage.setItem("title", title);
	localStorage.setItem("body", body);
	if (!document.getElementById("modernnoteslink").hasChildNodes()){
		document.getElementById("modernnoteslink").appendChild(linktext1);
	}
	if (!document.getElementById("minimalnoteslink").hasChildNodes()){
		document.getElementById("minimalnoteslink").appendChild(linktext2);
	}
}
