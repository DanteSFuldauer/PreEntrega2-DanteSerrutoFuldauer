import express from 'express'
import { create } from 'express-handlebars'
import { Server } from 'socket.io'
import path from 'path'
import { __dirname } from './path.js'
import productRouter from './routes/productos.routes.js'
import cartRouter from './routes/carritos.routes.js'

//instancia de express, handlebars
const app = express()
const hbs = create()
const PORT = 8080

const server = app.listen(PORT, () => {
    console.log("Server on Port", PORT)
})

//inicializo socket.io en el servidor
const io = new Server(server)


//Middlewares 
app.use(express.json()) //para manejar JSON en las peticiones
app.use(express.urlencoded({extended:true})) //para manejar queries complejos

//configuracion de hbs
app.engine('handlebars', hbs.engine)
app.set('view engine', 'handlebars')

//establezco el directorio de las vistas
app.set('views', path.join(__dirname, 'views'))

//rutas de mi applicacion
app.use('/public', express.static(__dirname + '/public'))
app.use('/api/products', productRouter)
app.use('/api/carts', cartRouter)
app.get('/', (req,res) => {
    res.status(200).send("ok")
})

//guardar mensajes en array
let mensajes = []

//agrego mensajes
io.on('connection', (socket) => { //cuando se produzca el apreton de manos puedo ejecutar las isguientes funciones
    console.log('Usuario conectado: ', socket.id) //id de conexion

    //con ON se recibe
    socket.on('mensaje', (data) => { 
        console.log('Mensaje recibido: ', data)
        mensajes.push(data)

        //envia el array de mensajes
        socket.emit('respuesta', mensajes)
    })

    //detectar desconexion
    socket.on('disconnect', () => {
        console.log('Usuario desconectado: ', socket.id);
    })
})
