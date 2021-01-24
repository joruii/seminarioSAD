const express = require('express');
const ServiceRegistry = require('./lib/ServiceRegistry');
const pjson = require('../package.json');
const Carrito = require('../Carrito');
let carritoRegistrado = false;
var carrito = new Carrito();

const service = express();
class Producto{
	constructor(key, description, cantidad) {
    this.key = key;
		this.description = description;
		this.cantidad = cantidad;
    }
}

module.exports = (config) => {
  const log = config.log();
  const serviceRegistry = new ServiceRegistry(log);
  if (service.get('env') === 'development') {
    service.use((req, res, next) => {
      log.debug(`${req.method}: ${req.url}`);
      return next();
    });
  }
  // Add a request logging middleware in development mode

  service.get('/carrito', (req, res) => {
    if(!carritoRegistrado){
      return res.send('Servicio no registrado!');
    }
    res.send(carrito);
  });

  service.put('/registrar/carrito', (req, res) =>{
    if(carritoRegistrado == false){
      serviceRegistry.register(pjson.name, pjson.version, 'localhost', '3000');
      carritoRegistrado = true;
      res.send("Carrito registrado! !!")
    }else{
      res.send("El carrito ya esta registrado !!");
    }
  });

  service.post('/carrito/:key/:cantidad', (req,res,next) => {
    if(!carritoRegistrado){
      res.send("El carrito no esta registrado");
    }else{
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
    let producto = new Producto(clave, descr, cantidad);

    console.log(producto);
    carrito.anyadirProducto(producto);
    setTimeout(()=>{res.send(carrito);},1000);
  }
  });

  service.delete('/carrito/:key', (req,res,next) => {
    if(!carritoRegistrado){
      return res.send('Servicio no registrado!');
    }else{
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
    let indiceProd = parseInt(req.params.key);
    //let cantidad = parseInt(req.params.cantidad); 
    carrito.quitarProducto(indiceProd);
    res.send(carrito);
  }
  });

  service.delete('/carrito', (req,res,next) => {
    if(!carritoRegistrado){
      return res.send('Servicio no registrado!');
    }else{
    serviceRegistry.
      unregister(pjson.name, pjson.version, 'localhost', '3000');
      res.send("Carrito eliminado... Gracias por usarlo !!");
      carritoRegistrado = false;
      carrito = new Carrito();
      //process.exit();
    }
  });

  // eslint-disable-next-line no-unused-vars
  service.use((error, req, res, next) => {
    res.status(error.status || 500);
    // Log out the error to the console
    log.error(error);
    return res.json({
      error: {
        message: error.message,
      },
    });
  });
  return service;
};
