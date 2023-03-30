import { URL_API_BUSCAR, URL_API_SAVE, URL_API_GET_ALL, URL_API_SAVE_STUDENT } from "./const.js";

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
    return response.json();
})
.catch(error => {
    return error
})
}

export async function getAll() {
    return fetch(URL_API_GET_ALL, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then(response => {
        return response.json();
    })
    .catch(error => {
        return error
    })
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
        return error
    })
}

export async function guardarEstudiante(datos) {
    return fetch(URL_API_SAVE_STUDENT, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            "nombre": datos.nombre,
            "nroDocumento": datos.nroDocumento,
            "codigo": datos.codigo,
            "taller": datos.taller,
            "foto": datos.foto,
        })
    })
    .then(response => {
        return response.json();
    })
    .catch(error => {
        return error
    })
}

