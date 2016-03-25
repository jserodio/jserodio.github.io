// getElementById
	function $id(id) {
		return document.getElementById(id);
	}


	// output information
	function Output(msg) {
		var m = $id("messages");
		m.innerHTML = m.innerHTML + msg;
	}


	// file drag hover
	function FileDragHover(e) {
		e.stopPropagation();
		e.preventDefault();
		e.target.className = (e.type == "dragover" ? "hover" : "");
	}


	// file selection
	function FileSelectHandler(e) {

		// cancel event and hover styling
		FileDragHover(e);

		// fetch FileList object
		var files = e.target.files || e.dataTransfer.files;

		// process all File objects
		for (var i = 0, f; f = files[i]; i++) {
			ParseFile(f);
		}

	}


	// output file information
	function ParseFile(file) {

		Output(
			"<p>Datos del fichero: <strong>" + file.name +
			"</strong> Tipo: <strong>" + file.type +
			"</strong> Tamaño: <strong>" + file.size +
			"</strong> bytes</p>"
		);

	}


	// initialize
	function Init() {
        
			var filedrag = $id("filedrag");

			// file drop
			filedrag.addEventListener("dragover", FileDragHover, false);
			filedrag.addEventListener("dragleave", FileDragHover, false);
			filedrag.addEventListener("drop", FileSelectHandler, false);
			filedrag.style.display = "block";
	}

	// call initialization file
	if (window.File && window.FileList) {
		Init();
	}


// Al pulsar en el botón Enviar, imprime los resultados del formulario
$id("upload").onsubmit = function(e) {
    // hacer que no envie nada
    e.preventDefault();
    
    //
    // var libros = "";
    // for (var i=0; i<document.getElementsByName("libro").length; i++) {
    //     libros = libros + document.getElementsByName("libro")[i].value;
    // }
    
    // recoger las variables del formulario
    var msg = "Nombre: " + 
            document.getElementsByName("nombre")[0].value + ", Telefono: " +
            document.getElementsByName("telefono")[0].value + ", Email: " +
            document.getElementsByName("email")[0].value + ", Libro: " +
            // libros + ", " +
            document.getElementsByName("libro")[0].value + ", Cantidad: " +
            document.getElementsByName("cantidad")[0].value + "<br>";
    // imprimir las variables del formulario
    Output(msg);
}