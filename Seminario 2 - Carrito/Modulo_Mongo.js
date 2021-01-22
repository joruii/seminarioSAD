var mongo = require ('mongodb');
var assert = require('assert');
var mongoclient =mongo.MongoClient;
var url='mongodb://localhost:27017/almacen';
var collection;

exports.compruebaStock = function(elemento,callback){

	puedeInsertar = false;

	mongoclient.connect(url, function (err, db) {
		assert.equal(err, null);
		var base = db.db("mydb");
		collection = base.collection('baseCarrito');
		collection.findOne(
			{$and: 
			[ 
			  {key:elemento.key}, 
			  {cantidad:{$gte:elemento.cantidad}} 
			]},function(err,result){
				
				if(result){
					console.log("Stock suficiente del producto " + result.key+ ": " + result.description +"\n");
					db.close();
					puedeInsertar= true;
					callback(puedeInsertar);
	
				}else{
					console.log("El producto " +elemento.key+": " + elemento.description + " no puede añadirse"+
					 " ya que no existe en la base o no hay stock suficiente\n(Stock menor a "+elemento.cantidad+")\n");
					db.close();
					puedeInseratr= false;
					callback(puedeInsertar);
				}
			});

			
	  });	
	}
  exports.insertarProductos = function(callback){

	mongoclient.connect(url, function (err, db) {
		assert.equal(err, null);
		var base = db.db("mydb");
		//llenamos la db con elementos
		collection = base.collection('baseCarrito');
		//para eliminar los productos del carrito antes de insertarlos
		collection.deleteMany({});
		collection.insertMany([
		{ key: 1, description: 'Sombrero', cantidad: 22 },{ key: 2, description: 'Pizza', cantidad: 2 }
		,{ key: 3, description: 'CocaCola', cantidad: 1 },{ key: 4, description: 'Falda', cantidad: 2 }
		,{ key: 5, description: 'Salchichas', cantidad: 1 }
	  ], function (err, result) {
		assert.equal(err, null);
		assert.equal(5, result.result.n);
		assert.equal(5, result.ops.length);
		console.log("Se han insertado 5 elementos");
		
		db.close();
		callback(err,result);
	  	});
	
	
	  });


  }

