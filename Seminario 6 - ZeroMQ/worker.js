var Cliente = require ('./Modulo_Mongo.js');
const zmq = require("zeromq");
let dealer  = zmq.socket("dealer")
const timeCPU = 1000
const brokerPort1 = 8000; 

//Array para almacenar las peticiones de los clientes
//Declaramos la identidad del Worker
var id  = "W_"+require('os').hostname()+getRandomArbitrary(1,100);
dealer.identity = id

//COnectamos el worker al Broker
dealer.connect("tcp://127.0.0.1:"+brokerPort1);

class MensajeADevolver{
  constructor(carro){
    this.carro = carro;
  }
}

//Avisamos al Broker que el Worker está operativo.
dealer.send(['']);

//Quedamos escuchando las peticiones del worker
dealer.on('message', (idCliente, message) => {

  let descr;
  var messageParsed = JSON.parse(message); //OBJETO message = idCLiente, carrito(aEnviar)

  if(messageParsed.accion == 2){ //Creamos carrito vacío

    var carritoAux = new Array(); 
    var carroAux = new MensajeADevolver([]);
    dealer.send([idCliente, JSON.stringify(carroAux)]);

  }
  else if(messageParsed.accion == 0){ //Añadimos un producto al carrito.

    switch (messageParsed.idProd.toString()) {
      case "1" :
        descr = 'Sombrero';
        break;
      case "2" :
        descr = "Pizza";
        break;
      case "3":
        descr = "Cocacola";
        break;
      case "4":
        descr = "Falda";
        break;
      case "5":
        descr = "Salchichas";
        break;
      default:
		  return dealer.send([idCliente, "Producto no existente"]);
    }

    let arrayObject = messageParsed.carrito;
    let carrito = arrayObject;
    producto = new Producto(messageParsed.idProd, descr, messageParsed.cant);

    //Llamamos al método anyadirProducto del Carrito
    anyadirProducto(carrito, producto);
    setTimeout(() =>{

      var carroFinal = new MensajeADevolver(carrito);
      dealer.send([idCliente, JSON.stringify(carroFinal)]);
	  },1000);
	
  }
  else{ //Si solicita ELIMINAR un producto del carrito
    switch (messageParsed.idProd.toString()) {
      case "1" :
        descr = 'Sombrero';
        break;
      case "2" :
        descr = "Pizza";
        break;
      case "3":
        descr = "Cocacola";
        break;
      case "4":
        descr = "Falda";
        break;
      case "5":
        descr = "Salchichas";
        break;
      default:
	  	return dealer.send([idCliente, "Producto no existente"]);
    }
    let arrayObject = messageParsed.carrito;
    let carrito = arrayObject;
    //Llamamos al metodo eliminar Producto del carrito
    quitarProducto(carrito, messageParsed.idProd);
    setTimeout(() =>{

    var carroFinal = new MensajeADevolver(carrito);    
		dealer.send([idCliente, JSON.stringify(carroFinal)]);
	},1000)
  }
});

function getRandomArbitrary(min, max) {
  return Math.random() * (max - min) + min;
}

class Producto{
	constructor(key, description, cantidad) {
		this.key = key;
		this.description = description;
		this.cantidad = cantidad;
	}
}
//Se crea un carrito que será un array de productos
	var anyadirProducto = function(carrito, producto){

	//Creamos una copia del producto al que le sumaremos la cantidad de productos del mismo tipo 
	//ya existente en el carrito, para ello usamos JSON.parse(JSON.stringify(producto)), ya que
	//sino copiariamos la referencia al objeto sin desvincularnos de este.
		let productoComprueba = JSON.parse(JSON.stringify(producto));
		var indice;
		console.log("Longitud del carrito Producto" + carrito.length);
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

	var quitarProducto = function(carrito, clavePrimaria){
		
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

