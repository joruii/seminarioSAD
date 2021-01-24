const express = require('express');
const service = express();
const port = 3000;
const mongoose = require('mongoose');
var Schema = mongoose.Schema;

//Creación del Schema Producto
var productoSchema = mongoose.Schema({
    key: {type: Number, required: true},
    description: {type: String, required: true},
    cantidad: {type: Number, required: true}
});

//creación del modelo a partir del Schema de productos definido 
var Productos = mongoose.model('Productos', productoSchema);

//método que actualiza el stock en BBDD
exports.insertarProductos = () => {

	mongoose.connect('mongodb+srv://root:1234@clustersad.k9fmv.mongodb.net/mydb?retryWrites=true&w=majority');

	const db = mongoose.connection;
	db.on('error', console.error.bind(console, 'connection error:'));


	//para eliminar los productos del carrito antes de insertarlos
	Productos.remove()
		.exec()
		.then(result => {
			console.log(result); //Se borraron con exito
		})
		.catch(err => {
			console.log(err); //Fallo
		});

	//insertar stock de productos en BBDD
	var product1 = new Productos({
		key: 1,
		description: "Sombrero",
		cantidad: 50
	})
	
	product1.save()
		.then(result => {
			console.log(result);
		})
		.catch(err => console.log(err));

	var product2 = new Productos({
		key: 2,
		description: "Pizza",
		cantidad: 40
	})
		
	product2.save()
		.then(result => {
			console.log(result);
		})
		.catch(err => console.log(err));

	var product3 = new Productos({
		key: 3,
		description: "Falda",
		cantidad: 30
	})
		
	product3.save()
		.then(result => {
			console.log(result);
		})
		.catch(err => console.log(err));
	
	var product4 = new Productos({
		key: 4,
		description: "Cocacola",
		cantidad: 20
	})
			
	product4.save()
		.then(result => {
			console.log(result);
		})
		.catch(err => console.log(err));

	var product5 = new Productos({
		key: 5,
		description: "Salchichas",
		cantidad: 10
	})
				
	product5.save()
		.then(result => {
			console.log(result);
		})
		.catch(err => console.log(err));
	
	console.log("Se han insertado 5 elementos");
}

//comprueba el stock para poder insertar el elemento en el carrito
exports.compruebaStock = function(elemento,callback){

	//conexión con BBDD
	mongoose.connect('mongodb+srv://root:1234@clustersad.k9fmv.mongodb.net/mydb?retryWrites=true&w=majority');
	const db = mongoose.connection;
	db.on('error', console.error.bind(console, 'connection error:'));

	puedeInsertar = false;
	var llave = elemento.key;
	Productos.findOne({key: llave})
		.exec()
		.then(doc => {
			var cant = doc.cantidad;
			console.log("From database", doc)
			if(cant >= elemento.cantidad){
				console.log("Stock suficiente del producto " + elemento.key + ": " + elemento.description +"\n");
				puedeInsertar= true;
				callback(puedeInsertar);
			}else{
				console.log("El producto " +elemento.key+": " + elemento.description + " no puede añadirse ya que no hay stock suficiente\n(Stock menor a "+elemento.cantidad+")\n");
				puedeInsertar= false;
				callback(puedeInsertar);
			}
		})
		.catch(err => {
			console.log(err)
		})

	
}
