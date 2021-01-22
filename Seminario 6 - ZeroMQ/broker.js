//Creamos las variables que necesitaremos para el funcionamiento del codigo.
var zmq = require("zeromq");
var mongo = require ('./Modulo_Mongo.js');
let cliente= zmq.socket("router");
let worker= zmq.socket("router");
var carritoCreado = 0;

//Insertamos los prodcutos en la BD
mongo.insertarProductos(()=>{console.log("Documentos insertados!");});

// workers que se gestionan 
let workers = []; clientes = []; peticiones = []; carritos = {}; carritoCreado = [];

class CarritoAux{
  constructor(carrito, accion, idProd, cant){
    this.carrito = carrito;
    this.accion = accion;
    this.idProd = idProd;
    this.cant = cant;
  }
}

var argumentos = process.argv;
if (argumentos.length < 2) {
  console.log ("Introduce node cola.js puertoDelCliente puertoDelWorker");
  process.exit(-1);
}
var puertoDelCliente = argumentos[2];
var puertoDelWorker = argumentos[3];


//Conectamos el broker al Cliente

cliente.bind("tcp://127.0.0.1:"+puertoDelCliente);
worker.bind("tcp://127.0.0.1:"+puertoDelWorker);

//Escuchamos las peticiones del cliente
cliente.on('message', function() { // (idCliente, tipoTrabajo,idProducto, cantidad)
    
  var aEnviar;  
  var args = Array.apply(null, arguments);
  let identificadorCliente = args[0];
  let tipoTrabajo = parseInt(args[1]);
  let idProducto = parseInt(args[2]);
  let cantidadProducto = parseInt(args[3]);

  console.log(args +"\n");
  console.log("Cliente con identificador: " + identificadorCliente +" ---> conectado!\n");
  console.log("Sirviendo petición el broker: "+puertoDelCliente);
  console.log(carritos[identificadorCliente]);

    if(tipoTrabajo == 5){//Pide eliminar un carrito
      if(carritoCreado[identificadorCliente] == 1){
      delete carritos[identificadorCliente];
      carritoCreado[identificadorCliente] = 0;
      cliente.send([identificadorCliente,"Carrito Eliminado"])
      }else{
        cliente.send([identificadorCliente, "Primero tienes que crear un carrito con '/actividad6/crear'"]);
      }
    }
    else{ //NO pide eliminar un carrito
    if(args.length == 3){ //Si solicita un GET del carrito
      if(carritoCreado[identificadorCliente] == 1){
      cliente.send([identificadorCliente, JSON.stringify(carritos[identificadorCliente])]);
      }
      else{
        cliente.send([identificadorCliente, "Primero tienes que crear un carrito con '/actividad6/crear'"]);
      }
    }
    else{
      if (args.length == 2){//Si pide crear un carrito
        if(carritoCreado[identificadorCliente] == 0 || carritoCreado[identificadorCliente] == undefined){
          let carritoAUX = new Array();
          carritos[identificadorCliente] = carritoAUX;
          aEnviar = new CarritoAux(carritos[identificadorCliente], tipoTrabajo, idProducto, cantidadProducto);
          carritoCreado[identificadorCliente] = 1;
          }else{
          cliente.send([identificadorCliente, "Carrito ya creado!!"]);
        }
      }
      else{
        if(carritoCreado[identificadorCliente] == 0 || carritoCreado[identificadorCliente] == undefined){
          cliente.send([identificadorCliente, "Primero tienes que crear un carrito con '/actividad6/crear'"]);
        }else{
        if(tipoTrabajo == 0){//Si pide añadir productos
          console.log("Ha pedido añadir " + cantidadProducto+ " unidades del producto " + idProducto + "\n");
        }
        if(tipoTrabajo == 1){//Si pide eliminar productos
          console.log("Ha pedido eliminar el producto " + idProducto + "\n");
        }
        if (workers.length == 0){ //Si no hay workers activos, almacenamos la peticion del cliente.
          peticiones.push(args);
        }else{//Hay workers activos

          aEnviar = new CarritoAux(carritos[identificadorCliente], tipoTrabajo, idProducto, cantidadProducto);
        }
      
      worker.send([workers.shift(),identificadorCliente,JSON.stringify(aEnviar)]);
    }
    }}}
});

//Escuchamos las respuestas del Worker
worker.on('message', function() { // (idWorker,idCliente,carrito)

  var argumentos = Array.apply(null, arguments);
  var idWorker = argumentos[0];
  let argumentosEnvia = argumentos.slice(1);

  if (argumentos.length == 2) {//El worker avisa de que ha llegado
    workers.push(idWorker);
  
  if (peticiones.length > 0){ //No había workers disponibles y se almacenó una peticion de un cl
    let args = peticiones.shift();
    let identificadorCliente = args[0];
    let tipoTrabajo = parseInt(args[1]);
    let idProducto = parseInt(args[2]);
    let cantidadProducto = parseInt(args[3]);
    aEnviar = new CarritoAux(carritos[identificadorCliente], tipoTrabajo, idProducto, cantidadProducto);
    worker.send([workers.shift(),identificadorCliente,JSON.stringify(aEnviar)]);
  }
  }else {

    var argumentosParseados = JSON.parse(argumentosEnvia[1]);
    carritos[argumentosEnvia[0]] = argumentosParseados.carro;
    cliente.send([argumentosEnvia[0],JSON.stringify(argumentosParseados.carro) ]);
    workers.push(idWorker);
  }
})