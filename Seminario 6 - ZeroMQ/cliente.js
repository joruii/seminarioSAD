const express = require('express');
const service = express();
const zmq = require('zeromq');
const port = process.argv[2];
const puertoEscuchaBroker = 4000;
var mensaje;
var llega = false;

/////////////////////////////////////////////////////
//Declaramos dealer y le asignamos una identidad
var dealer = zmq.socket("dealer");
var identidad  = process.argv[3];
dealer.identity = identidad;

//Conectamos el dealer al broker
dealer.connect("tcp://127.0.0.1:"+puertoEscuchaBroker);



//GET estado ACTUAL del carrito
service.get('/actividad6/:operacion', (req, res, next) => {

        //Aqui se crea la variable que almacenara el tipo de operacion.
        let operacion;
        switch (req.params.operacion) {
                
                case "consultar" :
                        //Aqui se define la variable operacion en funcion del tipo de operacion solicitada.
                        operacion = 3;
                        break;
                default:
                        //En el caso de que se mande una operacion no soportada, se informa al usuario.
                        return res.send("Operacion no soportada. Escribe: 'consultar' para CONSULTAR el carrito");
        }
        //Enviamos al Broker la operacion
        dealer.send([operacion, null]);

        //Nos quedamos esperando la respuesta del Broker para mandarsela al cliente
        dealer.on('message', (msg) =>{
                if (msg == undefined){
                        //En el caso de que se reciba un carrito undefined, para evitar un error en cascada, se cierra el proceso cliente
                        process.exit(0);
                }
                mensaje = msg;
        });

        setTimeout(()=>{
                console.log("Mensaje " + mensaje);
                res.send(mensaje); res.end();
        },3000);
}); 

service.post('/actividad6/:operacion/:idProducto/:cantidad', (req, res, next) => {

        //Aqui se crea la variable que almacenara el tipo de operacion.
        let operacion;

        //Producto que se sumara al carrito
        let idProducto = parseInt(req.params.idProducto.toString());

       //Nº de veces que el producto que se sumara al carrito
        let cantidad = parseInt(req.params.cantidad.toString());
        
        switch (req.params.operacion) {
                case "añadir" :
                        //Aqui se define la variable operacion en funcion del tipo de operacion.
                        operacion = 0;
                        break;
                default:
                        //En el caso de que se mande una operacion no soportada, se informa al usuario.
                        return res.send("Operacion no soportada. Escribe: 'añadir' para AÑADIR un producto del carrito");
        }

        //Enviamos al Broker la operacion
        dealer.send([operacion, idProducto, cantidad]);

        //Nos quedamos esperando la respuesta del Broker para mandarsela al cliente
        dealer.on('message', (msg) =>{
                if (msg == undefined){
                        //En el caso de que se reciba un carrito undefined, para evitar un error en cascada, se cierra el proceso cliente
                        process.exit(0);
                }
                mensaje = msg;
                llega = true;
        });
        setTimeout(()=>{
                console.log("Mensaje " + mensaje);
                res.send(mensaje); res.end();
        },3000);
}
});      

service.delete('/actividad6/:operacion/:idProducto', (req, res, next) => {

        //Aqui se crea la variable que almacenara el tipo de operacion.
        let operacion;
        if(req.params.idProducto.toString() == "carrito"){
                operacion = 5;
                idProducto = null;
                dealer.send([operacion, null, null]);
        }
        else{
                //Producto que se restara del carrito
                let idProducto = parseInt(req.params.idProducto.toString());

                switch (req.params.operacion) {
                        case "eliminar" :
                                //Aqui se define la variable operacion en funcion del tipo de operacion.
                                operacion = 1;
                                break;
                        default:
                                //En el caso de que se mande una operacion no soportada, se informa al usuario.
                                return res.send("Operacion no soportada. Escribe: 'eliminar' para  ELIMINAR un producto del carrito");
                }
        //Enviamos al Broker la operacion
        dealer.send([operacion, idProducto, null]);
        }
        

        //Nos quedamos esperando la respuesta del Broker para mandarsela al cliente
        dealer.on('message', (msg) =>{
                if (msg == undefined){
                        //En el caso de que se reciba un carrito undefined, para evitar un error en cascada, se cierra el proceso cliente
                        process.exit(0);
                }
                mensaje = msg;
        });     
        setTimeout(()=>{
                res.send(mensaje); res.end();
        },3000);
});             
        
service.post('/actividad6/:operacion' , (req, res, next) => {

        //Aqui se crea la variable que almacenara el tipo de operacion para crear carrito.
        let operacion = 2;
        let crear = req.params.operacion.toString();
        if (crear != "crear"){
                res.send ("Solo puedo crear.");
        }else{
                //Enviamos a la cola el tipo de operacion.
                dealer.send([operacion]);

                //El dealer espera la respuesta de la cola y se lo manda al cliente
                dealer.on('message', (msg) =>{
                        mensaje = msg;
                });
        }
        setTimeout(()=>{
                if(mensaje == undefined){
                        mensaje = "Carrito creado!!";
                }
                res.send(mensaje + []); res.end();
        },2000);
});

//Nos quedamos escuchando en el puerto 'port'
service.listen(port, () => {
    console.log('Ejercicio 6 listening at http://localhost:'  + port )
});