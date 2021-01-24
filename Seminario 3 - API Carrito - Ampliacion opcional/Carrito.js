var Cliente = require ('./Modulo_Mongo.js');
class Carrito{
	constructor(){
		this.carrito = new Array();
	}

	//Se crea un carrito que será un array de productos

	anyadirProducto(producto){
		var carrito = this.carrito;

	//Creamos una copia del producto al que le sumaremos la cantidad de productos del mismo tipo 
	//ya existente en el carrito, para ello usamos JSON.parse(JSON.stringify(producto)), ya que
	//sino copiariamos la referencia al objeto sin desvincularnos de este.
		let productoComprueba = JSON.parse(JSON.stringify(producto));
		console.log(productoComprueba);
		var indice;
		
		if(carrito.length == 0){indice = -1;}
		for( let i in carrito ){
			if(carrito[i].key == producto.key){
			productoComprueba.cantidad = producto.cantidad + carrito[i].cantidad;
			indice = i;
			}
		}

		Cliente.compruebaStock(productoComprueba, function(sePuede){

			if(sePuede){
				
				if(indice == -1 || indice == undefined){
					carrito.push(producto);	
					console.log( "Producto: "+producto.description+" añadido al carrito ("+producto.cantidad+" unidades)!");
				}else{
					carrito[indice].cantidad = carrito[indice].cantidad + producto.cantidad;
					console.log( "Articulo: "+carrito[indice].description+" actualizado (+"+producto.cantidad+")!");	
				}
				
			}else{
				console.log( "El producto: "+producto.description+" NO se ha añadido al carrito");	
			}

		});
		
	}

	quitarProducto(clavePrimaria){
		var indice;
		var encontrado = false;
		for(var i = 0; i < this.carrito.length && !encontrado; i++) {
			if (this.carrito[i].key === clavePrimaria){ console.log(this.carrito[i].key); indice = i; encontrado = true;}
		}
		
		if(encontrado){
			let nombre = this.carrito[indice].description;
			console.log("Producto: "+nombre+" borrado del carrito!");
			this.carrito.splice(indice, 1);
			
		}
		else{
			console.log("No existe el producto de clave: "+clavePrimaria+" en el carrito!");
		}
		
    }
    
    

	/*arrayObjectIndexOf(myArray, searchTerm) {
		for(var i = 0; i < myArray.length; i++) {
			if (myArray[i].key === searchTerm) return i;
		}
		return -1;
	}*/
}
    

	/*arrayObjectIndexOf(myArray, searchTerm) {
	for(var i = 0; i < myArray.length; i++) {
		if (myArray[i].key === searchTerm) return i;
	}
	return -1
	}

	clone(obj) {
		if (null == obj || "object" != typeof obj) return obj;
		var copy = obj.constructor();
		for (var attr in obj) {
		  if (obj.hasOwnProperty(attr)) copy[attr] = obj[attr];
		}
		return copy;
	  }
}
//Test que comprueba la funcionalidad de los métodos de añadir y quitar productos del carrito
//Así pues, para añadir un producto, se comprueba que este exista en la base de datos.

//El objeto Cliente hace referencia al modulo de mongodb que realizará las consultas a la base
//a la hora de añadir productos
/*
  Cliente.insertarProductos(function(err,result) {
	if (err) throw err;
	setTimeout(()=>{anyadirProducto(new Producto(5, 'Salchichas',1));},1000);
	setTimeout(()=>{console.log(carrito);},1500);
	setTimeout(()=>{anyadirProducto(new Producto(1, 'Sombrero',20));},2000);
	setTimeout(()=>{console.log(carrito);},2500);
	setTimeout(()=>{anyadirProducto(new Producto(1, 'Sombrero',3));},3000);
	setTimeout(()=>{console.log(carrito);},3500);
	setTimeout(()=>{anyadirProducto(new Producto(2, 'Pizza',1));},4000);
	setTimeout(()=>{console.log(carrito);},4500);
	setTimeout(()=>{quitarProducto(30);},5000);
	setTimeout(()=>{console.log(carrito);},5500);
	setTimeout(()=>{quitarProducto(1);},6000);
	setTimeout(()=>{console.log(carrito);},6500);
	setTimeout(()=>{anyadirProducto(new Producto(1, 'Sombrero',20));},7000);
	setTimeout(()=>{console.log(carrito);},7500);
	
  });
*/
module.exports = Carrito;