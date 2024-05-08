var title = "";
var body = "";
var mdnotes = "";
var html_start = `
<!DOCTYPE html>
 <html>                     
 <head>
   <title>Generated by Anki2Notes</title>
   <link rel="stylesheet" href="print.css">
   <meta charset='UTF-8'/>
   <meta name='viewport'
     content='width=device-width, initial-scale=1.0, maximum-scale=1.      0' />
 </head>
 <body>
 <style>
	 .card {
		width: 45%;
		display: table;
		page-break-inside: avoid;
		overflow: auto;
		display: inline;
	}

	body {
		margin: 0;
		font-size: 11pt;
		font-family: Helvetica;
		background-color: #fff;
		display: flex;
		flex-direction: row;
		flex-wrap: wrap;
		justify-content: space-around;
	}

	h1 {
		width: 100%;
	}

	p {
		margin: 5pt 0;
	}
	</style>
`;
var html_end = `
</body>
</html>
`;

//TODO migliorare conversione HTML --> markdown
//TODO migliorare formattazione dell'HTML

// options ----------

var converter = new showdown.Converter({ extensions: ['cards'] });
converter.setOption("noHeaderId", true);

codeInput.registerTemplate("syntax-highlighted", codeInput.templates.hljs(hljs, []));

// getting the input file --------------------------

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

// TOGGLE SECTIONS ---------------------------------

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

// THE MAIN FUNCTION ________________________________

//the main function
function createNotes(){
	if(title == "" || body == ""){
		alert("Title or body is empty.");
		throw("Body or title not found or empty.");
	}
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

//creates preview and download buttons
function updatePreview(){
	console.log("Updating preview");
	editor = document.getElementById("editor");
	mdnotes = editor.value;
	body = converter.makeHtml(mdnotes);
	bodydiv = document.getElementById("notes-body");
	bodydiv.innerHTML = body;
	html_start = html_start.replace(/Generated by Anki2Notes/, title);
	html = html_start+body+html_end;
	makeDownloadButton(mdnotes, "md");
	makeDownloadButton(html, "html");
	testolatex = writeLatex();
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
			if(question == undefined){
				console.log("Question is undefined")
				break;
			}
			if(answer == undefined){
				console.log("created cardsarray")
				break;
			}
    }   
    question = question.replace(/^"/, "");
    question = question.replace(/"$/, "");
    answer = answer.replace(/^"/, "");
		answer = answer.replace(/"$/, "");
		console.log([question, answer])
    cardsarray.push([question, answer]);
  }
  return cardsarray;
}

// GENERAZIONE MARKDOWN  __________________________________


function generate_markdown(cards){
	let md = ["# "+title+"\n"];
	for (let i = 0; i < cards.length; i=i+1){
		card = cards[i];
		// a card is an array of two strings
		// the front and the back of the card
		front = converter.makeMarkdown(card[0]);
		back = converter.makeMarkdown(card[1]);
		back = back.replace(/>\n\n/g, '>');
		md.push("#### "+card[0]+"\n"+card[1]+"\n____\n")
	}
	mdstring = md.join('');
	console.log("mdstring ="+mdstring);
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
	//TODO find a way to exclude latex from cloze and other
	//transformation
	
	stringa = stringa.replaceAll(/{{c\d+::(.+?)}}/g, "$1")
	
	/*let start = stringa.indexOf('{');
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
		console.log(stringa);
		stringa = cleanCloze(stringa);
	}
	*/
	return stringa;
}


//LATEX GENERATION -----------------------------------------

function writeLatex(){
	
	var testolatex = 
		"\\documentclass{article}\n " +
		" \\title{" + title + "}\n" + "\\author{Anki To Notes}\n"+
		"\\date{\\today}\n" + "\\usepackage{multicol}\n" +
		"\\usepackage[margin=1in]{geometry}\n" +
		"\\setlength\\columnsep{20pt}\n" +
		"\\begin{document}\n" + "\\maketitle\n" + "\\begin{multicols}{2}\n";
	
	//ripuliamo da simboli html vari.

	testolatex += body.replace(/<div class="card"><h4>(.+?)<\/h4>((.|\n)+?)<\/div>/g, '\\paragraph{} \\begin{large} $1 \\end{large} \\hfill $2\n');
	
	/*for(let i = 0; i < cards.length; i++){
		testolatex += "\\paragraph{} \\begin{large}" + cards[i][0] +"\\end{large} \\hfill "+ cards[i][1]+"\n";
	}
	*/
	
	testolatex += "\\end{multicols}\n \\end{document}\n";

	//ripuliamo da simboli html vari
	testolatex = testolatex.replace(/<p>((.|\n)+?)<\/p>/g, '$1\n');
	testolatex = testolatex.replace(/<h1>(.+?)<\/h1>/g, '');
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
	testolatex = testolatex.replace(/<([a-z])>((.|\n)+?)<\/\1>/, '$2');
	return testolatex;
}

// DOWNLOAD _______________________________________

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
