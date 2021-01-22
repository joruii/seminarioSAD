var Cliente = require ('./Modulo_Mongoose.js');
const express = require('express');
const { Console } = require('console');
const service = express();
const port = process.argv[2];


// GET
	service.get('/carrito', (req, res) => {
		res.send(carrito);
	  });

//POST
	service.post('/carrito/:key/:cantidad', (req,res,next) => {
		var descr = null;
		switch (req.params.key) {
			case "1" :
				descr = "Sombrero";
				break;
			case "2" :
				descr = "Pizza";
				break;
			case "3":
				descr = "Falda";
				break;
			case "4":
				descr = "Cocacola";
				break;
			case "5":
				descr = "Salchichas";
				break;
			default:
				return res.send("Producto no existente");
		}

		let clave = parseInt(req.params.key);
		let cantidad = parseInt(req.params.cantidad); 
		producto = new Producto(clave, descr,cantidad);
		console.log(producto);
		anyadirProducto(producto);
		setTimeout(()=>{res.send(carrito);},1000);
	});

	//Delete
	service.delete('/carrito/:key', (req,res,next) => {
		let prodABorrar= parseInt(req.params.key);
		quitarProducto(prodABorrar);
		res.send(carrito);
	});

	service.listen(port, () => {
		console.log('SAD APP listening at http://localhost:'  + port );
	})

//A partir de aquí el código es el mismo que el del módulo carrito, con los métodos de anyadirProducto y quitarProducto
	
class Producto{
	constructor(key, description, cantidad) {
        this.key = key;
		this.description = description;
		this.cantidad = cantidad;
    }
}
//Se crea un carrito que será un array de productos
var carrito = new Array();
Cliente.insertarProductos(()=>{console.log("Documentos insertados!");});

	var anyadirProducto = function(producto){

	//Creamos una copia del producto al que le sumaremos la cantidad de productos del mismo tipo 
	//ya existente en el carrito, para ello usamos JSON.parse(JSON.stringify(producto)), ya que
	//sino copiariamos la referencia al objeto sin desvincularnos de este.
		let productoComprueba = JSON.parse(JSON.stringify(producto));
		var indice;
		console.log(carrito.length);
		if(carrito.length == 0){indice = -1;}
		for( let i in carrito ){
			if(carrito[i].key == producto.key){
			productoComprueba.cantidad = producto.cantidad+carrito[i].cantidad;
			indice = i;
			}
		}

		Cliente.compruebaStock(productoComprueba, function(sePuede){

			if(sePuede){
				
				if(indice == -1 || indice == undefined){
					carrito.push(producto);	
					console.log( "Producto: "+producto.description+" añadido al carrito!");
				}else{
					carrito[indice].cantidad = carrito[indice].cantidad + producto.cantidad;
					console.log( "Articulo: "+carrito[indice].description+" actualizado!");	
				}
				
			}else{
				console.log( "El producto: "+producto.description+" NO se ha añadido al carrito");	
			}

		});
		
	}

	var quitarProducto = function(clavePrimaria){
		
		var indice = arrayObjectIndexOf(carrito, clavePrimaria);
		
		if(indice != -1){
			let nombre = carrito[indice].description;
			console.log("Producto: "+nombre+" borrado del carrito!");
			carrito.splice(indice, 1);
			
		}
		else{
			console.log("No existe el producto de clave: "+clavePrimaria+" en el carrito!");
		}
    }
    
    

function arrayObjectIndexOf(myArray, searchTerm) {
	for(var i = 0; i < myArray.length; i++) {
		if (myArray[i].key === searchTerm) return i;
	}
	return -1;
}

  