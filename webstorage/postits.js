/* postits.js
 *
 */

var notas = [];

window.onload = init;

function init() {
	var button = document.getElementById("add_button");
	button.onclick = createSticky;

    // Boton del_button, clearStickyNotes
    var button_clear = document.getElementById("del_button");
    button_clear.onclick = clearStickyNotes;    // EJERCICIO C

    // Poner notitas pulsando tecla enter
    var noteText = document.getElementById("note_text");
    noteText.onkeydown = function(e) {
        if (e.keyCode === 13) {
            createSticky();
            noteText.focus();
        }
    };

    if (localStorage.getItem("postit_numNotas") != null) {
        cargarNotas();  // EJERCICIO A
    }
}

function createSticky() {
	var value = document.getElementById("note_text").value;
	addStickyToDOM(value);
    notas.push(value);
    guardarNotas();     // EJERCICIO B
}


function addStickyToDOM(value) {
	var stickies = document.getElementById("stickies");
	var postit = document.createElement("li");
	var span = document.createElement("span");
	span.setAttribute("class", "postit");
	span.innerHTML = value;
	postit.appendChild(span);
	stickies.appendChild(postit);
}

function clearStickyNotes() {   // EJERCICIO C
    var stickies = document.getElementById("stickies");
    var nodes = stickies.childNodes;
    var numNotas = localStorage.getItem("postit_numNotas");
    

    // elimino cada nodo hasta que no queda ninguno
    while(nodes[0] != undefined){
        // eliminar visualmente
        var deadchild = stickies.removeChild(nodes[0]);
    }
    
    var i = numNotas-1; // recorrer desde atras
    while(i >= 0){
        localStorage.removeItem("postit_" + i); // eliminar de localstorage
        notas.pop();    // eliminamos el último del array
        i--;
    }
    // actualizar numero total de notas (postits) a cero
    localStorage.setItem("postit_numNotas", 0);

}

function cargarNotas() {    // EJERCICIO A
	notas = [];
    var numNotas = localStorage.getItem("postit_numNotas");

	for (var i=0; i < numNotas; i++) {
		var valor = localStorage.getItem("postit_" + i);
		notas.push(valor);
        addStickyToDOM(valor);
	}
}

function guardarNotas() {   // EJERCICIO B
    for (var i=0; i < notas.length; i++) {
        localStorage.setItem("postit_" + i, notas[i]);
    }
    localStorage.setItem("postit_numNotas", notas.length);
}