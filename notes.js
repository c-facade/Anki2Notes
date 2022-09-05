

function createNotes(options = null){
	const queryString = window.location.search;
	const urlParams = new URLSearchParams(queryString);
	let stile = urlParams.get('stile');
	if(stile == "modern"){
		stylelink = document.getElementById("stylesh");
		stylelink.href = "style1.css";
	}
	let title = localStorage.getItem("title");
	let body = localStorage.getItem("body");
	let titlenode = document.createTextNode(title);
	if (document.getElementById("noteh1") != null)
		document.getElementById("noteh1").appendChild(titlenode);
		else console.log("Non trovo noteh1");
	let bodydiv = document.createElement("div");
	bodydiv.id = "bodydiv";
	if (document.getElementById("md") != null)
		document.getElementById("md").appendChild(bodydiv);
		else console.log("Non trovo maindiv");
	bodyarray = parsebody(body);
	printbody(bodyarray);
	testolatex = writeLatex(title, bodyarray);
	makeLatexLink(title, testolatex);
	console.log(testolatex);
}


function parsebody(bodytext){
	bodyarray = bodytext.split(/	|        /);
	return bodyarray
}

//barr is the body array
function printbody(barr) {
	//this is the parent we will be appending to
	let corpo = document.getElementById("bodydiv");
	//this for cicle appends a q&a div to the main body
	//and appends a question div and an answer div
	//to the q&a div
	for (let i = 0; i < barr.length; i=i+2){
		
		//checking for paragraph titles
		if(barr[i].indexOf("[[") != -1){
			insertPTitle(corpo, barr[i]);
			i++;
		}
		
		let domanda = barr[i];
		let risposta = barr[i+1];
		
		//checking for empty strings
		if (domanda == undefined || risposta == undefined) continue;
		//checking for cloze
		if (domanda.indexOf('{{c') != -1){
			domanda = cleanCloze(domanda);
		}
		
		//creating, naming and categorizing question and
		//answer div.
		let domandadiv = document.createElement("div");
		let rispostadiv = document.createElement("div");
		domandadiv.id = ("domanda" + i);
		rispostadiv.id = ("risposta" + (i+1));
		domandadiv.className = "domanda";
		rispostadiv.className = "risposta";
		domandadiv.innerHTML = domanda;
		rispostadiv.innerHTML = risposta;
		
		//creating main q&a block
		let bloccoquanda = document.createElement("div");
		bloccoquanda.className = "qanda";
		bloccoquanda.appendChild(domandadiv);
		bloccoquanda.appendChild(rispostadiv);
		//appending q&a block to body
		if (corpo != null) {
			corpo.appendChild(bloccoquanda);
		}
		else console.log("non trovo il corpo");
	}
}

function cleanCloze(stringa){
		let start = stringa.indexOf('{');
		let middle = stringa.indexOf(':')+2;
		let end = stringa.indexOf('}')+1;
		let interno = stringa.slice(middle, (end-1));
		interno = '<em><strong>' + interno + '</strong></em>';
		stringa = stringa.replace(/{{.+?}}/, interno);
		console.log(stringa);
		if (stringa.indexOf('{{c') != -1){
			stringa = cleanCloze(stringa);
		}
		return stringa;
}

	
function insertPTitle(body, PTitle){
	let start = PTitle.indexOf("[") + 2;
	let end = PTitle.indexOf("]");
	paragraphdiv = document.createElement("div");
	paragraphdiv.className = "paragraphtitle";
	paragraphdiv.innerHTML= PTitle.slice(start, end);
	body.appendChild(paragraphdiv);
}


//TODO: versione che utilizza Latex, per un pdf molto più leggero.
function writeLatex(title, bodyarray){
	var testolatex = "\\documentclass{article} " +
	" \\title{" + title + "} " + "\\author{Anki To Notes}"+ "\\date{\\today} " +
	"\\begin{document} " + "\\maketitle ";
	
	//ripuliamo da simboli html vari.
	
	for(let i = 0; i < bodyarray.length; i++){
		str = bodyarray[i];
		if (str.indexOf('{{c') != -1){
			str = cleanCloze(str);
		}
		str = str.replace(/<b>/g,"\\textbf{");
		str = str.replace(/<\/b>/g, "}");
		str = str.replace(/<strong>/g,"\\textbf{");
		str = str.replace(/<\/strong>/g, "}");
		str = str.replace(/<i>/g, "\\emph{");
		str = str.replace(/<\/i>/g, "}");
		str = str.replace(/<em>/g, "\\emph{");
		str = str.replace(/<\/em>/g, "}");
		str = str.replace(/&nbsp;/g, " ");
		str = str.replace(/<br>/g, " \\par ");
		str = str.replace(/&gt;/g, "$>$");
		str = str.replace(/&lt;/g, "$<$");
		str = str.replace(/<ul>/g, "\\begin{itemize} ");
		str = str.replace(/<\/ul>/g, "\\end{itemize} ");
		str = str.replace(/<li>/g, "\\item ");
		str = str.replace(/<\/li>/g, "");
		str = str.replace(/<ol>/g, "\\begin{enumerate} ");
		str = str.replace(/<\/ol>/g, "\\end{enumerate} ");
		str = str.replace(/<li>/g, "\\item ");
		str = str.replace(/<\/li>/g, "");
		bodyarray[i] = str;
	}
	
	for(let i = 0; i < bodyarray.length; i+=2){
		//cerca paragrafi
		if(bodyarray[i].indexOf("[[") != -1){
			testolatex += sezionelatex(bodyarray[i]);
			i++;
		}
		
		let domanda = bodyarray[i];
		let risposta = bodyarray[i+1];
		
		if(domanda == undefined || risposta == undefined) continue;
		
		testolatex += "\\paragraph{" + domanda +"}"+ risposta+" ";
	}
	
	testolatex += "\\end{document}";
	
	return testolatex;
	
}

function sezionelatex(testo){
	let start = testo.indexOf("[") + 2;
	let end = testo.indexOf("]");
	let interno = testo.slice(start, end);
	return "\\section{" + interno + "} ";
}

function makeLatexLink(title, testolatex){
	var filename = title + ".anki2notes.tex";
	var LatexBlob = new Blob([testolatex], {type: "text/plain;charset=utf-8"});
	var URLblob = URL.createObjectURL(LatexBlob
);
	let bloblink = document.createElement("a");
	bloblink.download = filename;
	bloblink.href = URLblob;
	bloblink.id = "bloblink";
	bloblink.innerHTML = "Download as Latex File.";
	downloadlf = document.getElementById("dlf");
	downloadlf.appendChild(bloblink);
}



	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
