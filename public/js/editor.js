//get the static landing page skeleton
var page = document.getElementById("page");
var sidebar = document.getElementById("sidebar");
var modal = document.getElementById("modal");
var modalContent = document.getElementById("modalContent");
var clickedID = null;
var clickedElement;
var backgroundColor = document.getElementById("backgroundColor");
var textColor = document.getElementById("textColor");	
var content = document.getElementById("copy");
var bodyContent = [

];

function setupModal()
{
modal.style.display = "none";
modal.style.position = "fixed";
modal.style.zIndex = "1";
modal.style.left = "0";
modal.style.top = "0";
modal.style.width = "100%";
modal.style.height = "100%";
modal.style.backgroundColor = "rgba(0, 0, 0, 0.4)";	

modalContent.style.backgroundColor = "#fefefe";
modalContent.style.margin = "15% auto";
modalContent.style.padding = "20px";
modalContent.style.border = "1px; solid #888";
modalContent.style.width = "80%";
}

function setupSidebar()
{
sidebar.style.position = "fixed";
sidebar.style.left = "0px";
sidebar.style.top = "0px";
sidebar.style.width = "15%";
sidebar.style.height = "100%";	
sidebar.style.zIndex = "2";
}

setupModal();
setupSidebar();

//function for modal to show which has the style and text on it.

var ids = ["headlineOne", "subHeadlineOne"];

function saveElement()
{
modal.style.display = "none";
var element = bodyContent[clickedID];
element.backgroundColor = backgroundColor.value;
element.textColor = textColor.value;
element.content = content.value;
element.dateModified = Date.now();

clickedElement.style.backgroundColor = backgroundColor.value;
clickedElement.style.color = textColor.value
clickedElement.innerHTML = content.value;
console.log("item saved");	
}

//add setInterval to save json object every 5 seconds

//add new row to end of page
function fillIn(element, column)
{
element.classList.add("droppable");
element.setAttribute("data-row", bodyContent.length);
element.setAttribute("data-column", column);
var HTML = '  <div class="bg-light mr-md-3 pt-3 px-3 pt-md-5 px-md-5 text-center overflow-hidden"> <div class="my-3 p-3"> <h2 class="display-5">This is a new row</h2> <p class="lead">This is some witty subtext.</p> </div> <div class="bg-white shadow-sm mx-auto" style="width: 80%; height: 300px; border-radius: 21px 21px 0 0;"></div> </div>';
element.innerHTML = HTML;
element.addEventListener("dragover", function (event) {allowDrop(event);});	
element.addEventListener("dragenter", function (event) {allowDrop(event);});	
element.addEventListener("drop", function (event) {drop(event);});
return element;	
}

function addToBody(total)
{
if (total == 1)
	{
	bodyContent[bodyContent.length] = [[]]	
	}
else if (total == 2)
	{
	bodyContent[bodyContent.length] = [[], []]
	}
else if (total == 3)
	{
	bodyContent[bodyContent.length] = [[], [], []]	
	}
	
console.log(bodyContent);
}

function newRow(cols)
{
var row = document.createElement("DIV");
row.classList.add("row");
switch(cols)
	{
	case 1:
	var oneColumn = document.createElement("DIV");
	oneColumn.classList.add("col-md-12");
	oneColumn = fillIn(oneColumn, 0);
	row.appendChild(oneColumn);
	addToBody(1);
	console.log("one");
	break;	
	case 2:
	var firstColumn = document.createElement("DIV");
	firstColumn.classList.add("col-md-6");
	firstColumn = fillIn(firstColumn, 0);
	row.appendChild(firstColumn);
	var secondColumn = document.createElement("DIV");
	secondColumn.classList.add("col-md-6");
	secondColumn = fillIn(secondColumn, 1);
	row.appendChild(secondColumn);
	addToBody(2);
	console.log("two");
	break;
	case 3:
	firstColumn = document.createElement("DIV");
	firstColumn.classList.add("col-md-4");
	firstColumn = fillIn(firstColumn, 0);
	row.appendChild(firstColumn);
	secondColumn = document.createElement("DIV");	
	secondColumn.classList.add("col-md-4");
	secondColumn = fillIn(secondColumn, 1);
	row.appendChild(secondColumn);
	thirdColumn = document.createElement("DIV");	
	thirdColumn.classList.add("col-md-4");
	thirdColumn = fillIn(thirdColumn, 2);
	row.appendChild(thirdColumn);
	addToBody(3);
	console.log("three");
	break;
	}
page.appendChild(row);
//$(".droppable").on("drop", function (event) {drop(event);});
//ondrop="drop(event)" ondragover="allowDrop(event)"
//$(".droppable").on("dragenter", function (event) {console.log("it works!"); allowDrop(event);});

}
//add new modal to body with: image src(text field), image preview(img), image size(select), image 


//toggle sidebar
function toggleSidebar()
{
sidebar.classList.toggle('active');
console.log("sidebar toggled");
}

function addComponent(name)
{
console.log("adding component " + name);	
}

function allowDrop(ev)
{
ev.preventDefault();	
//console.log(event.target);
}

function drag(ev)
{
ev.dataTransfer.setData("text", ev.target.id);	
console.log("currently dragging " + ev.target.id);
}

function drop(ev)
{
ev.preventDefault();
var data = ev.dataTransfer.getData("text");
var node = document.getElementById(data).cloneNode();
node.id = "1234";
node.innerHTML = "test";
ev.target.appendChild(node);
console.log(ev.target.parentElement.parentElement.parentElement);
if (ev.target.hasAttribute("data-row") && ev.target.hasAttribute("data-column"))
	{
	var position = bodyContent[ev.target.getAttribute("data-row")][ev.target.getAttribute("data-column")];
	position.push(ev.target.tagName);
	console.log(ev.target);	
	}
else if (ev.target.parentElement.parentElement.parentElement.hasAttribute("data-row") && ev.target.parentElement.parentElement.parentElement.hasAttribute("data-column"))
	{
	console.log("the parent had row and column");
	parent = ev.target.parentElement.parentElement.parentElement;
	row = parseInt(parent.getAttribute("data-row"));
	column = parseInt(parent.getAttribute("data-column"));
	position = bodyContent[row][column];
	console.log();
	position.push(ev.target.tagName);
		
	}
else
	{
	console.log("target didn't have a row and/or column");	
	}
}
//document.getElementById("sidebarCollapse").addEventListener("click", toggleSidebar());	
	
function publishPage()
{
page = document.getElementById("page").innerHTML;
//run regular expressions to weed out ' and change it to "
page.replace(/'/g, '"');
var ajax = new XMLHttpRequest();
ajax.open("POST", "api/pages", true);
ajax.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
ajax.send("page=" + page);
console.log("sent json to api/pages");	
}




















































































 
function newImage()
{
div = document.createElement("DIV");

var img = document.createElement("IMG");
img.src = "/public/images/example.jpg";
img.style.zIndex = 2;
img.style.position = "absolute";
img.style.left = "45%";
img.style.top =	"45%";
img.style.width = "10%";
img.style.height = "10%";
page.appendChild(img);
console.log("this works.");
}

//add new text to body
function newText()
{
alert("new Text");	
}

