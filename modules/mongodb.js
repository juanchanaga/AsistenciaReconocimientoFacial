import { URL_API_BUSCAR, URL_API_SAVE, URL_API_GET_ALL } from "./const.js";

export async function buscar(nroDocumento) {
	return fetch(URL_API_BUSCAR, {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({
        "nroDocumento": nroDocumento
    })
})
.then(response => {

    response.json()
    .then(doc => {
        return doc.json()
    })
    .catch(error => {
        return error.json();
    })
    
})
.catch(error => {
    return error.json();
});
}

export async function guardar(datos) {
    return fetch(URL_API_SAVE, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            "nombre": datos.nombre,
            "codigo": datos.codigo,
            "nroDocumento": datos.nroDocumento,
            "tiempo": datos.tiempo,
            "taller": datos.taller,
        })
    })
    .then(response => {
        return response.json();
    })
    .catch(error => {
        return error.json()
    })
}

export async function getAll() {
    return fetch(URL_API_GET_ALL, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({})
    })
    .then(response => {
        return response.json();
    })
    .catch(error => {
        return error.json()
    })
}