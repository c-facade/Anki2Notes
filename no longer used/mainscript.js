console.log("I'm here");

//this gets the title and the body of the notes
//and loads it into temporary storage
//so that it can be used to generate notes.
function gettext(){
	let t = document.getElementById("tite");
	var title = t.value;
	console.log(title);
	var body = document.getElementById("bod").value;
	console.log(body);	
	
	localStorage.setItem("title", title);
	localStorage.setItem("body", body);
	
	//This gives the user the choice to view their notes
	//in the modern style or the minimalist style
	let linktext1 = document.createTextNode("Your notes in modern style.")
	let linktext2 = document.createTextNode("Your notes in minimal style.")

	if (!document.getElementById("modernnoteslink").hasChildNodes()){
		document.getElementById("modernnoteslink").appendChild(linktext1);
	}
	if (!document.getElementById("minimalnoteslink").hasChildNodes()){
		document.getElementById("minimalnoteslink").appendChild(linktext2);
	}
}
