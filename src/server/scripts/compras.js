document.addEventListener('DOMContentLoaded', () => {
    const productosContainer = document.getElementById('productos');
    const carritoContainer = document.getElementById('carrito');
    const totalContainer = document.getElementById('total');
    const carrito = [];

    // Cargar productos desde el archivo JSON
    fetch('productos.json')
        .then(response => response.json())
        .then(productos => {
            productos.forEach(producto => {
                const productoDiv = document.createElement('div');
                productoDiv.classList.add('producto');
                productoDiv.innerHTML = `
                    <h3>${producto.nombre}</h3>
                    <p>${producto.descripcion}</p>
                    <p><strong>Precio:</strong> $${producto.precio}</p>
                    <button class="btn-comprar" data-id="${producto.id}">Agregar al Carrito</button>
                `;
                productosContainer.appendChild(productoDiv);
            });

            // Agregar funcionalidad al botón "Agregar al Carrito"
            const botonesComprar = document.querySelectorAll('.btn-comprar');
            botonesComprar.forEach(boton => {
                boton.addEventListener('click', (e) => {
                    const productoId = parseInt(e.target.getAttribute('data-id'));
                    const producto = productos.find(p => p.id === productoId);
                    agregarAlCarrito(producto);
                });
            });
        })
        .catch(error => console.error('Error al cargar los productos:', error));

    // Función para agregar productos al carrito
    function agregarAlCarrito(producto) {
        carrito.push(producto);
        actualizarCarrito();
    }

    // Función para actualizar el carrito
    function actualizarCarrito() {
        carritoContainer.innerHTML = '';
        let total = 0;

        carrito.forEach((producto, index) => {
            const item = document.createElement('div');
            item.classList.add('carrito-item');
            item.innerHTML = `
                <p>${producto.nombre} - $${producto.precio}</p>
                <button class="btn-eliminar" data-index="${index}">Eliminar</button>
            `;
            carritoContainer.appendChild(item);
            total += producto.precio;
        });

        totalContainer.textContent = `Total: $${total}`;

        // Agregar funcionalidad al botón "Eliminar"
        const botonesEliminar = document.querySelectorAll('.btn-eliminar');
        botonesEliminar.forEach(boton => {
            boton.addEventListener('click', (e) => {
                const index = parseInt(e.target.getAttribute('data-index'));
                carrito.splice(index, 1);
                actualizarCarrito();
            });
        });

        // Actualizar el botón de PayPal
        renderizarPayPal(total);
    }

    // Función para renderizar el botón de PayPal
    function renderizarPayPal(total) {
        document.getElementById('paypal-button-container').innerHTML = ''; // Limpiar el contenedor

        paypal.Buttons({
            createOrder: function(data, actions) {
                return actions.order.create({
                    purchase_units: [{
                        amount: {
                            value: total.toFixed(2) // Total del carrito
                        }
                    }]
                });
            },
            onApprove: function(data, actions) {
                return actions.order.capture().then(function(details) {
                    alert(`Pago completado por ${details.payer.name.given_name}`);
                    carrito.length = 0; // Vaciar el carrito
                    actualizarCarrito();
                });
            },
            onError: function(err) {
                console.error('Error en el pago:', err);
                alert('Hubo un error al procesar el pago.');
            }
        }).render('#paypal-button-container');
    }
});

// Función para enviar el carrito al backend
function enviarCarritoAlBackend(carrito, total) {
    fetch('http://localhost:3000/api/pedidos', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            productos: carrito.map(producto => ({
                nombre: producto.nombre,
                precio: producto.precio,
                cantidad: 1 // Puedes agregar funcionalidad para manejar cantidades
            })),
            total: total
        })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Error al enviar el pedido');
        }
        return response.json();
    })
    .then(data => {
        alert('Pedido registrado con éxito');
        console.log('Pedido registrado:', data);
    })
    .catch(error => {
        console.error('Error al registrar el pedido:', error);
        alert('Hubo un error al registrar el pedido');
    });
}

// Modificar la función de PayPal para enviar el carrito al backend
function renderizarPayPal(total) {
    document.getElementById('paypal-button-container').innerHTML = ''; // Limpiar el contenedor

    paypal.Buttons({
        createOrder: function(data, actions) {
            return actions.order.create({
                purchase_units: [{
                    amount: {
                        value: total.toFixed(2) // Total del carrito
                    }
                }]
            });
        },
        onApprove: function(data, actions) {
            return actions.order.capture().then(function(details) {
                alert(`Pago completado por ${details.payer.name.given_name}`);
                enviarCarritoAlBackend(carrito, total); // Enviar el carrito al backend
                carrito.length = 0; // Vaciar el carrito
                actualizarCarrito();
            });
        },
        onError: function(err) {
            console.error('Error en el pago:', err);
            alert('Hubo un error al procesar el pago.');
        }
    }).render('#paypal-button-container');
}
// Función para enviar el carrito al backend
function enviarCarritoAlBackend(carrito, total) {
    const token = localStorage.getItem('token'); // Obtener el token del almacenamiento local

    fetch('http://localhost:3000/api/pedidos', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': token // Incluir el token en los encabezados
        },
        body: JSON.stringify({
            productos: carrito.map(producto => ({
                nombre: producto.nombre,
                precio: producto.precio,
                cantidad: 1 // Puedes agregar funcionalidad para manejar cantidades
            })),
            total: total
        })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Error al enviar el pedido');
        }
        return response.json();
    })
    .then(data => {
        alert('Pedido registrado con éxito');
        console.log('Pedido registrado:', data);
    })
    .catch(error => {
        console.error('Error al registrar el pedido:', error);
        alert('Hubo un error al registrar el pedido');
    });
}


//primer codigo
/*document.addEventListener('DOMContentLoaded', () => {
    const productosContainer = document.getElementById('productos');

    // Cargar productos desde el archivo JSON
    fetch('productos.json')
        .then(response => response.json())
        .then(productos => {
            productos.forEach(producto => {
                const productoDiv = document.createElement('div');
                productoDiv.classList.add('producto');
                productoDiv.innerHTML = `
                    <h3>${producto.nombre}</h3>
                    <p>${producto.descripcion}</p>
                    <p><strong>Precio:</strong> $${producto.precio}</p>
                    <button class="btn-comprar" data-id="${producto.id}">Comprar</button>
                `;
                productosContainer.appendChild(productoDiv);
            });

            // Agregar funcionalidad al botón "Comprar"
            const botonesComprar = document.querySelectorAll('.btn-comprar');
            botonesComprar.forEach(boton => {
                boton.addEventListener('click', (e) => {
                    const productoId = e.target.getAttribute('data-id');
                    alert(`Has comprado el producto con ID: ${productoId}`);
                });
            });
        })
        .catch(error => console.error('Error al cargar los productos:', error));
});
*/
// cuando instale node actualizar ocn este codigo



/*
document.addEventListener('DOMContentLoaded', () => {
    const productosContainer = document.getElementById('productos');

    // Cargar productos desde el backend
    fetch('http://localhost:3000/api/productos')
        .then(response => response.json())
        .then(productos => {
            productos.forEach(producto => {
                const productoDiv = document.createElement('div');
                productoDiv.classList.add('producto');
                productoDiv.innerHTML = `
                    <h3>${producto.nombre}</h3>
                    <p>${producto.descripcion}</p>
                    <p><strong>Precio:</strong> $${producto.precio}</p>
                    <button class="btn-comprar" data-id="${producto._id}">Comprar</button>
                `;
                productosContainer.appendChild(productoDiv);
            });

            // Agregar funcionalidad al botón "Comprar"
            const botonesComprar = document.querySelectorAll('.btn-comprar');
            botonesComprar.forEach(boton => {
                boton.addEventListener('click', (e) => {
                    const productoId = e.target.getAttribute('data-id');
                    alert(`Has comprado el producto con ID: ${productoId}`);
                });
            });
        })
        .catch(error => console.error('Error al cargar los productos:', error));
});
*/