var title = "";
var body = "";
var mdnotes = "";

//TODO creare un'estensione di showdown per gestire le carte
// in modo da avere carte separate (solo per poi formattare
// meglio il CSS
//
// TODO alternativamente mettere dell'HTML nel markdown
// che però vabbè non è proprio bello
//
// nel caso si potrebbero separare le carte con una linea
// ma la linea andrebbe poi convertita in un <card>
// o un div comunque invisibile che serve solo per formattare il css

// per il resto funziona

showdown.setOption("noHeaderId", "true");

codeInput.registerTemplate("syntax-highlighted", codeInput.templates.hljs(hljs, []));

const input = document.getElementById("notes_file");
input.addEventListener('input', fileToTextArea);
input.addEventListener('change', fileToTextArea);

function fileToTextArea(){
	console.log("filetotextarea");
	//check the size of the file
	const fileSize = input.files[0].size / 1024 / 1024; // in MiB
  if (fileSize > 2) {
  	alert('File size exceeds 2 MiB');
    return;
  }
	const notesFile = input.files[0];
	let tarea = document.getElementById("bod");
	const reader = new FileReader();

	reader.addEventListener(
	"load",
	() => {
			console.log(reader.result);
		tarea.value = reader.result;
	},
	false
	);

	if (notesFile) {
	reader.readAsText(notesFile);
	}	
}


//this gets the title and the body of the notes
//and puts it in the global variables
function gettext(){
	let t = document.getElementById("tite");
	title = t.value;
	console.log(title);
	body = document.getElementById("bod").value;
	console.log(body);
	createNotes();
	toggle2(2);
}

//this activates the first part of the page
//so the section when you can input your notes.txt
function toggle1(){
	part1 = document.getElementById("insert");
	part2 = document.getElementById("editnotes");
	if(part1 == null || part2 == null){
		throw("Article not found.");
	}
	if(part1.hidden){
		part1.hidden = false;
		part2.hidden = true;
	}
	return true;
}

//this activates the third part of the page
//where you can preview and edit your notes
function toggle2(part){
	part1 = document.getElementById("insert");
	part2 = document.getElementById("editnotes");
	part3 = document.getElementById("previewnotes");
	linkpart2 = document.getElementById("editlink");
	linkpart3 = document.getElementById("previewlink");
	if(part1 == null || part2 == null || part3 == null){
		throw("Toggle failed. Not found.");
	}
	if(part2.hidden = true){
		part1.hidden = true;
		part2.hidden = false;
		part3.hidden = false;
		linkpart2.hidden = false;
		linkpart3.hidden = false;
		if(part == 2){
			part2.scrollIntoView();
		}
		else{
			part3.scrollIntoView();
		}
	}
	return true;
}


//the main function
function createNotes(){
	if(title == "" || body == ""){
		throw("Body or title not found or empty.");
	}
	//append a title to the main div
	let titlenode = document.createTextNode(title);
	if (document.getElementById("titlenotes") != null)
		document.getElementById("titlenotes").appendChild(titlenode);
		else throw("Non trovo noteh1");
	//splits the body into a cards array
	cards = parsebody(body);
	console.log(cards);
	//generates markdown
	mdnotes = generate_markdown(cards);
	console.log(mdnotes);
	editor = document.getElementById("editor");
	editor.value=mdnotes;
	
	//creates preview and links
	updatePreview();
}

var converter = new showdown.Converter();	

//creates preview and download buttons
function updatePreview(){
	console.log("Updating preview");
	editor = document.getElementById("editor");
	mdnotes = editor.value;
	body = converter.makeHtml(mdnotes);
	bodydiv = document.getElementById("notes-body");
	bodydiv.innerHTML = body;
	makeDownloadButton(mdnotes, "md");
	makeDownloadButton(body, "html");
	testolatex = writeLatex(title, cards);
	makeDownloadButton(testolatex, "tex");
}


// splits text into an array of cards
function parsebody(bodytext){
  bodyarray = bodytext.split(/\r|\n/);
  let cardsarray = [];
  for (let i = 0; i< bodyarray.length; i=i+1){
    let question = ""; 
    let answer = ""; 
    if(isClozeCard(bodyarray[i])){
      answer = cleanCloze(bodyarray[i]);
    }   
    else{
      card = bodyarray[i].split(/\t|    /);
      question = card[0];
      answer = card[1];
    }   
    question = question.replace(/^"/, "");
    question = question.replace(/"$/, "");
    answer = answer.replace(/^"/, "");
    answer = answer.replace(/"$/, "");
    cardsarray.push([question, answer]);
  }
  return cardsarray;
}

// GENERAZIONE HTML __________________________________


/*
//this assumes that the front of the card
//is a question and the back is the answer
//so the card block is called q&a 
//barr is the body array
function printbody(barr) {
	//this is the parent we will be appending to
	let corpo = document.getElementById("bodydiv");
	//this for cicle appends a q&a div to the main body
	//and appends a question div and an answer div
	//to the q&a div
	for (let i = 0; i < barr.length; i=i+2){
		
		//checking for section titles
		if(barr[i].indexOf("#") != -1){
			insertsection(corpo, barr[i]);
			i++;
		}
		
		let question = barr[i]; //the front of the card
		let answer = barr[i+1]; //the back of the card
		
		//checking for empty strings
		if (question == undefined || answer == undefined) continue;
		//checking for cloze
		if (question.indexOf('{{c') != -1){
			question = cleanCloze(question);
		}
		
		//creating, naming and categorizing question and
		//answer div.
		let questionp = document.createElement("p");
		let answerp = document.createElement("p");
		questionp.id = ("question" + i);
		answerp.id = ("answer" + (i+1));
		questionp.className = "question";
		answerp.className = "answer";
		questionp.innerHTML = question;
		answerp.innerHTML = answer;
		
		//creating options + questions block
		let qocontainer = document.createElement("div");
		qocontainer.className = "question-option-container";
		let optionscontainer = document.createElement("div");
		optionscontainer.className = "options-container";
		optionscontainer.innerHTML = "<button class='editbutton'> <picture alt='edit block'> <source srcset='images/pencil.svg' media='(prefers-color-scheme:dark)'> <img src='images/pencil_black.svg' height='20' width='20'/> </picture> </button> <button class='movebutton'> <picture alt='move block'> <source srcset='images/arrows.svg' media='(prefers-color-scheme:dark)'> <img src='images/arrows_black.svg' height='22' width='22' /> </picture> </button>";
		qocontainer.appendChild(optionscontainer);
		qocontainer.appendChild(questionp);
		
		//creating main q&a block
		let bloccoquanda = document.createElement("div");
		bloccoquanda.className = "qanda";
		bloccoquanda.appendChild(qocontainer);
		bloccoquanda.appendChild(answerp);
		//appending q&a block to body
		if (corpo != null) {
			corpo.appendChild(bloccoquanda);
		}
		else console.log("Can't find the body.");
	}
}
*/


function generate_markdown(cards){
	let md = [];
	for (let i = 0; i < cards.length; i=i+1){
		card = cards[i];
		// a card is an array of two strings
		// the front and the back of the card
		card[0] = converter.makeMarkdown(card[0]);
		card[1] = converter.makeMarkdown(card[1]);
		card[1] = card[1].replace(/\n/g, '');
		md.push("#### "+card[0]+"\n"+card[1]+"\n");
	}
	mdstring = md.join('');
	return mdstring;
}

function isClozeCard(card){
	if(card.indexOf('{{c') != -1){
		return true;
	}
	return false;
}

//if we find a cloze card
//we will substitute the internal text
//with emphasised text
function cleanCloze(stringa){
	let start = stringa.indexOf('{');
	let middle = stringa.indexOf(':')+2;
	let end = stringa.indexOf('}')+1;
	//interno is the internal text of
	//the cloze
	let interno = stringa.slice(middle, (end-1));
	interno = '<u><em>' + interno + '</em></u>';
	stringa = stringa.replace(/{{.+?}}/, interno);
	//if there is more the one cloze
	//we call the function again
	if (stringa.indexOf('{{c') != -1){
		stringa = cleanCloze(stringa);
	}
	return stringa;
}


//LATEX GENERATION -----------------------------------------

function writeLatex(title, cards){
	
	var testolatex = 
		"\\documentclass{article}\n " +
		" \\title{" + title + "}\n" + "\\author{Anki To Notes}\n"+
		"\\date{\\today}\n" + "\\usepackage{multicol}\n" +
		"\\usepackage[margin=1in]{geometry}\n" +
		"\\setlength\\columnsep{20pt}\n" +
		"\\begin{document}\n" + "\\maketitle\n" + "\\begin{multicols}{2}\n";
	
	//ripuliamo da simboli html vari.


	
	for(let i = 0; i < cards.length; i++){
		testolatex += "\\paragraph{} \\begin{large}" + cards[i][0] +"\\end{large} \\hfill "+ cards[i][1]+"\n";
	}
	
	testolatex += "\\end{multicols}\n \\end{document}\n";

	//ripuliamo da simboli html vari
	testolatex = testolatex.replace(/<b>/g,"\\textbf{");
	testolatex = testolatex.replace(/<i>/g, "\\emph{");
	testolatex = testolatex.replace(/<em>/g, "\\emph{");
	testolatex = testolatex.replace(/&nbsp;/g, " ");
	testolatex = testolatex.replace(/<br>/g, " \\par ");
	testolatex = testolatex.replace(/&gt;/g, "$>$");
	testolatex = testolatex.replace(/&lt;/g, "$<$");
	testolatex = testolatex.replace(/<ul>/g, "\\begin{itemize} ");
	testolatex = testolatex.replace(/<\/ul>/g, "\\end{itemize} ");
	testolatex = testolatex.replace(/<li>/g, "\\item ");
	testolatex = testolatex.replace(/<\/li>/g, "");
	testolatex = testolatex.replace(/<ol>/g, "\\begin{enumerate} ");
	testolatex = testolatex.replace(/<\/ol>/g, "\\end{enumerate} ");
	testolatex = testolatex.replace(/<u>/g, "\\underline{");
	testolatex = testolatex.replace(/<\/b>|<\/i>|<\/em>|<\/u>/g, "}");
	return testolatex;
}

//make or replace internal file of download button
function makeDownloadButton(text, extension){
	var filename = title + "."+extension;
	var newblob = new Blob([text], {type: "text/plain;charset=utf-8"});
	var blobURL = URL.createObjectURL(newblob);
	if(document.getElementById("button."+extension) == undefined){
		let downloadlink = document.createElement("a");
		downloadlink.download = filename;
		downloadlink.href = blobURL;
		downloadlink.className = "download-link";
		downloadlink.id = "link."+extension;
		let downloadbutton = document.createElement("button");
		downloadbutton.innerHTML = "Download as ."+extension+" file";
		downloadbutton.id = "button."+extension;
		downloadlink.appendChild(downloadbutton);
		downloadlf = document.getElementById("dlf");
		downloadlf.appendChild(downloadlink);
	}
	else{
		downloadlink = document.getElementById("link."+extension);
		if(downloadlink == undefined) console.log("DOWNLOAD LINK UNDEFINED")
		downloadlink.href = blobURL;
	}

}

/*
function makeLatexLink(title, testolatex){
	var filename = title + ".anki2notes.tex";
	var LatexBlob = new Blob([testolatex], {type: "text/plain;charset=utf-8"});
	var URLblob = URL.createObjectURL(LatexBlob);
	let bloblink = document.createElement("a");
	bloblink.download = filename;
	bloblink.href = URLblob;
	bloblink.id = "bloblink";
	bloblink.innerHTML = "Download as Latex File.";
	downloadlf = document.getElementById("dlf");
	downloadlf.appendChild(bloblink);
}
*/

//IMAGES ___________________________________________________

let slideIndex = 1;

// Next/previous controls
function plusSlides(n) {
  showSlides(slideIndex += n);
}

// Thumbnail image controls
function currentSlide(n) {
  showSlides(slideIndex = n);
}

function showSlides(n) {
  let i;
  let slides = document.getElementsByClassName("mySlides");
  let dots = document.getElementsByClassName("demo");
  let captionText = document.getElementById("caption");
  if (n > slides.length) {slideIndex = 1}
  if (n < 1) {slideIndex = slides.length}
  for (i = 0; i < slides.length; i++) {
    slides[i].style.display = "none";
  }
  for (i = 0; i < dots.length; i++) {
    dots[i].className = dots[i].className.replace(" active", "");
  }
  slides[slideIndex-1].style.display = "block";
  dots[slideIndex-1].className += " active";
  captionText.innerHTML = dots[slideIndex-1].alt;
} 
