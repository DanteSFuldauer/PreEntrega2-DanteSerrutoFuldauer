import { Router } from 'express'
import crypto from 'crypto'
import { __dirname } from '../path.js'
import {promises as fs} from 'fs'
import path from 'path'

const productRouter = Router()

//encuentra la direccion donde esta productos.json
const productosPath = path.resolve(__dirname, '../src/db/productos.json');

//lee el archivo productos.json
const productosData = await fs.readFile(productosPath, 'utf-8');
const productos = JSON.parse(productosData)

//consultar productos
productRouter.get('/', (req, res) => {

    //limito la cantidad de productos
    const {limit} = req.query
    const products = productos.slice(0, limit) //devuelve una copia de una array (inicio, fin)

    res.status(200).render('templates/home', {productos: products, js: 'productos.js', css: 'productos.css'})
})

//consultar producto via id
productRouter.get('/:pid', (req, res) => {

    const idProducto = req.params.pid
    const producto = productos.find(prod => prod.id == idProducto)
    
    if(producto) { //si el producto existe
        res.status(200).send(producto)

    } else { //si el producto no existe
        res.status(404).send({mensaje: "El producto no existe"})
    }
})

/// crear nuevo producto
productRouter.post('/', async (req,res) => {

    //pido parametros del producto
    const {title, description, code, price, category, stock} = req.body

    //constructor del producto
    const nuevoProducto = {
        id: crypto.randomBytes(10).toString('hex'), //me genera un id unico
        title: title,
        description: description,
        code: code, 
        category: category,
        price: price,
        stock: stock,
        status: true,
        thumbnails: []
    }

    //agrego el producto
    productos.push(nuevoProducto)

    //guardo el nuevo producto en el json
    await fs.writeFile(productosPath, JSON.stringify(productos))
    res.status(201).send({mensaje: `Producto creado correctamente con el id: ${nuevoProducto.id}`})
})

productRouter.put('/:pid', async (req,res) => {
    //pido id del producto
    const idProducto = req.params.pid

    //pido datos para actualizar
    const {title, description, code, price, category, stock, thumbnails, status} = req.body

    //consulto en que posicion del array se encuentra un producto dado su id
    const indice = productos.findIndex(prod => prod.id == idProducto) 

    if (indice != -1) { //si el producto existe
        productos[indice].title = title
        productos[indice].description = description
        productos[indice].code = code
        productos[indice].price = price
        productos[indice].stock = stock
        productos[indice].status = status
        productos[indice].category = category
        productos[indice].thumbnails = thumbnails

        //actualiza el producto
        await fs.writeFile(productosPath, JSON.stringify(productos))

        res.status(200).send({Mensaje: "Producto actualizado"})
    } else { //si el producto no existe
        res.status(404).send({Mensaje: "El producto no existe"})
    }
})

productRouter.delete('/:pid', async (req,res) => {
    //pido id del producto que voy a eliminar
    const idProducto = req.params.pid

    //consulto indice del elemento
    const indice = productos.findIndex(prod => prod.id == idProducto)

    if(indice != -1) { //si el producto existe
        productos.splice(indice, 1)

        //elimina el producto
        await fs.writeFile(productosPath, JSON.stringify(productos))

        res.status(200).send({Mensaje: "Producto eliminado"})
    } else { //producto no existe
        res.status(404).send({Mensaje: "El producto no existe"})
    }
})

export default productRouter


