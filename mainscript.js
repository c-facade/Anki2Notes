console.log("I'm here");

function start(){
	let t = document.getElementById("tite");
	var title = t.value;
	console.log(title);
	var body = document.getElementById("bod").value;
	console.log(body);
	let linktext = document.createTextNode("Click here to view your notes.")
	localStorage.setItem("title", title);
	localStorage.setItem("body", body);
	if (!document.getElementById("noteslink").hasChildNodes())
		document.getElementById("noteslink").appendChild(linktext);
	
}
