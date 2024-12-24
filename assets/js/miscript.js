const Pedido = JSON.parse(localStorage.getItem("pedido")) || []
let productosCafeteria = []

const productosDiv = document.getElementById("div-productos")
const pedidoDiv = document.getElementById("pedido")
const totalDetalle = document.getElementById("totalDetalle")
const btnaplicarDescuento = document.getElementById("btnaplicarDescuento")
const codigoDescuento = document.getElementById("codigoDescuento")
const totalDetalleDescuento = document.getElementById("totalDetalleDescuento")
const searchInput = document.getElementById("InputBusqueda")

const btnBebida = document.getElementById("btnBebida")
const btnComida = document.getElementById("btnComida")
const btnComprar = document.getElementById("btnComprar")
const btnOrdenarNombre = document.getElementById("btnOrdenarNombre")
const btnOrdenarPrecio = document.getElementById("btnOrdenarPrecio")

idContador = 1
cantidad = 0
NegocioActivo = 'cafeteria'

function verificarStorage() {
    if (Pedido.length > 0) {
        btnComprar.disabled = false
    } else {
        btnComprar.disabled = true
    }
}

function AgregarAlPedido() {
    const cardProductos = document.getElementsByClassName("card-producto")
    const productosSeleccionados = Array.from(cardProductos)

    productosSeleccionados.forEach((producto) => {
        producto.addEventListener("click", (e) => {
            const productoCard = e.target.closest(".card-producto")
            const nombreProducto = productoCard.querySelector(".nombre-producto").innerText
            const precioProducto = Number(productoCard.querySelector(".precio-producto").innerText)

            const idProducto = idContador++
            const productoExistente = Pedido.find((producto) => producto.nombre === nombreProducto)

            if (productoExistente) {
                productoExistente.cantidad++
            } else {
                Pedido.push({
                    nombre: nombreProducto,
                    precio: precioProducto,
                    id: idProducto,
                    cantidad: 1,
                })
            }

            AgregarCarrito()
            verificarStorage()

        })
    })
}

function crearTarjeta(nombre, precio, id, img) {
    let imgHTML = ""

    if (img) {
        imgHTML = `<img src="${img}" class="card-img-top" alt="${nombre}">`
    }

    return `<div class="col-md-3 mb-4">
                <div class="card" style="width: 100%;">
                    ${imgHTML}
                    <div class="card-body card-producto" data-id="${id}">
                        <h5 class="card-title nombre-producto">${nombre}</h5>
                        <p class="card-text">Precio: $<span class="precio-producto">${precio}</span></p>
                        <button class="botonComprar">Comprar</button>
                    </div>
                </div>
            </div>`
}



function AgregarCarrito(){
    pedidoDiv.innerHTML = " "
    totalDetalle.innerHTML = " "
    Pedido.forEach(producto => {
        pedidoDiv.innerHTML += `<hr><div class="pedido-item d-flex justify-content-between">
                                <span>${producto.nombre}</span>
                                <span>$${producto.precio}</span>
                                <span>${producto.cantidad}</span>
                                <span><button class="btn btn-danger btn-sm" onclick="EliminarDelPedido(${producto.id})">X</button></span>
                            </div>`
    })

    localStorage.setItem("pedido", JSON.stringify(Pedido))
    const total = Pedido.reduce((acc, producto) => acc + (producto.precio * producto.cantidad), 0)
    totalDetalle.innerHTML = `$${total}`
}

function EliminarDelPedido(id) {
    const indice = Pedido.findIndex(producto => producto.id === id)

    if (indice >= 0) {
        Pedido.splice(indice, 1)
        AgregarCarrito()
        verificarStorage()
    }
}




btnBuscar.addEventListener("click", async () => {
    const searchValue = searchInput.value.toLowerCase()

    const productosFiltrados = productosCafeteria.filter(producto => producto.nombre.toLowerCase().includes(searchValue))

    try {
        const response = await fetch("https://www.themealdb.com/api/json/v1/1/filter.php?c=Beef")
        const data = await response.json()

        const recetasFiltradas = data.meals.filter(meal => meal.strMeal.toLowerCase().includes(searchValue))

        productosDiv.innerHTML = ""

        productosFiltrados.forEach(producto => {
            productosDiv.innerHTML += crearTarjeta(producto.nombre,producto.precio,producto.id,"assets/img/" + producto.img)
        })

        recetasFiltradas.forEach(meal => {
            productosDiv.innerHTML += crearTarjeta(meal.strMeal,meal.idMeal, meal.idMeal,meal.strMealThumb)
        })

        AgregarAlPedido()
    } catch (error) {
        console.error("Error:", error)
    }
})



function activarCafeteria() {
    NegocioActivo = 'cafeteria'
}

function activarRestaurant() {
    NegocioActivo = 'restaurant'
}


btnCafeteria.addEventListener("click", () => {
    activarCafeteria()
    const bebidas = productosCafeteria.filter(producto => producto.categoria === "bebida")
    productosDiv.innerHTML = ""

    bebidas.forEach(producto => {
        productosDiv.innerHTML += crearTarjeta(producto.nombre, producto.precio, producto.id, "assets/img/" + producto.img)
    })
    AgregarAlPedido()
} )


btnRestaurant.addEventListener("click", async () => {
    activarRestaurant()
    try {
        const response = await fetch("https://www.themealdb.com/api/json/v1/1/filter.php?c=Beef")
        const data = await response.json()

        productosDiv.innerHTML = ""
    
        data.meals.forEach((meal) => {
            productosDiv.innerHTML += crearTarjeta(meal.strMeal, meal.idMeal,meal.idMeal, meal.strMealThumb)
        })

        AgregarAlPedido()

    } catch (error) {
        console.error("Error:", error)
    }
})


async function ordenarProductos(criterio, NegocioActivo) {
    let productosAOrdenar = []

    if (NegocioActivo === 'cafeteria') {
        productosAOrdenar = [...productosCafeteria]
    } else if (NegocioActivo === 'restaurant') {
        try {
            const response = await fetch("https://www.themealdb.com/api/json/v1/1/filter.php?c=Beef")
            const data = await response.json()

            productosAOrdenar = data.meals.map(meal => ({
                nombre: meal.strMeal,
                precio: parseFloat(meal.idMeal),
                id: meal.idMeal,
                img: meal.strMealThumb
            }))
        } catch (error) {
            console.error("Error al obtener los productos del restaurant:", error)
            return
        }
    } else {
        console.error("Negocio no activo o no definido.")
        return
    }

    if (criterio === 'nombre') {
        productosAOrdenar.sort((a, b) => {
            if (a.nombre.toLowerCase() < b.nombre.toLowerCase()) return -1
            if (a.nombre.toLowerCase() > b.nombre.toLowerCase()) return 1
            return 0
        })
    } else if (criterio === 'precio') {
        productosAOrdenar.sort((a, b) => a.precio - b.precio)
    }

    productosDiv.innerHTML = ""
    productosAOrdenar.forEach(producto => {
        productosDiv.innerHTML += crearTarjeta(producto.nombre, producto.precio, producto.id, 
            NegocioActivo === 'cafeteria' ? "assets/img/" + producto.img : producto.img
        )
    })

    AgregarAlPedido()
}




btnOrdenarNombre.addEventListener("click", () => {
    ordenarProductos("nombre", NegocioActivo)
})

btnOrdenarPrecio.addEventListener("click", () => {
    ordenarProductos("precio", NegocioActivo)
})



document.addEventListener("DOMContentLoaded", async () => {
    try {
        const response = await fetch("../../productos.json")
        const data = await response.json()

        productosCafeteria = data

        productosCafeteria.forEach((producto) => {
            productosDiv.innerHTML += crearTarjeta(producto.nombre, producto.precio, producto.id, "assets/img/" + producto.img)
        })

        AgregarAlPedido()
        AgregarCarrito()
        verificarStorage()
    } catch (error) {
        console.error("Error al cargar los productos:", error)
    }
})

btnaplicarDescuento.addEventListener("click", () => {
    const total = Pedido.reduce((acc, producto) => acc + (producto.precio * producto.cantidad), 0)

    if (codigoDescuento.value.includes("CODIGO10")) {
        const totalConDescuento = total - (total * 0.10)
        totalDetalleDescuento.innerHTML = `$${totalConDescuento}`

        Swal.fire({
            icon: 'success',
            title: '¡Descuento aplicado!',
            text: `El total con descuento es: $${totalConDescuento}`,
            confirmButtonText: 'Aceptar',
            background: '#f9f9f9',
            confirmButtonColor: '#795548'
        })
    } else {
        totalDetalleDescuento.innerHTML = `$${total}`
    }
} )






document.getElementById("btnComprar").addEventListener("click", () => {

    Swal.fire({
        title: "Por favor, completa tus datos",
        html: `
          <input type="text" id="nombre" class="swal2-input" placeholder="Nombre">
          <input type="text" id="apellido" class="swal2-input" placeholder="Apellido">
          <input type="text" id="direccion" class="swal2-input" placeholder="Dirección">
        `,
        focusConfirm: false,
        showCancelButton: true,
        confirmButtonText: "Enviar",
        preConfirm: () => {
          const nombre = document.getElementById("nombre").value.trim()
          const apellido = document.getElementById("apellido").value.trim()
          const direccion = document.getElementById("direccion").value.trim()
      
          return { nombre, apellido, direccion }
        },
      }).then((result) => {
        if (result.isConfirmed) {
          Swal.fire({
            icon: 'success',
            title: 'Compra realizada!',
            text: 'MKuchismas Gracias por su compra. Su pedido ya va en camino.',
            confirmButtonText: 'Aceptar',
            confirmButtonColor: '#28a745'
          })
        }
      })

    Pedido.length = 0
    localStorage.removeItem("pedido")
    AgregarCarrito()
    verificarStorage()
})