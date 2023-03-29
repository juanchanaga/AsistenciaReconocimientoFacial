import { fotos1 } from "./fotos/fotos.js";
import { buscar, guardar } from "./modules/mongodb.js";

const video = document.getElementById('video');
let container = document.createElement('div');
const registrar = document.getElementById('registrarAsistencia');
const nombre = document.getElementById('nombre');
const codigo = document.getElementById('codigo');
const documento = document.getElementById('documento');
const hora = document.getElementById('hora');
const taller = document.getElementById('taller');
const tomarAsistenciaButton = document.querySelector("#tomarAsistencia");
const registrarAsistenciaButton = document.querySelector("#registrarAsistencia");
const registrarEstudiante = document.querySelector('#registrarEstudiante');
const mensajeSuccess = document.getElementById('mensaje-success');
const mensajeWarning = document.getElementById('mensaje-warning');
const formulario = document.getElementById("formulario")
let datosAsistencia = {};

Promise.all([
    faceapi.nets.faceRecognitionNet.loadFromUri('models'),
    faceapi.nets.faceLandmark68Net.loadFromUri('models'),
    faceapi.nets.ssdMobilenetv1.loadFromUri('models'),
]).then(startVideo())

tomarAsistenciaButton.onclick = (event) => {
    event.preventDefault();
    video.classList.remove("d-none");
}

registrarEstudiante.onclick = (event) => {
    event.preventDefault();
    formulario.classList.remove('d-none');
}

registrarAsistenciaButton.onclick = async (event) => {
    event.preventDefault();
    const toastSuccess = bootstrap.Toast.getOrCreateInstance(mensajeSuccess);
    const toastWarning = bootstrap.Toast.getOrCreateInstance(mensajeWarning);
    const canva = document.getElementsByTagName("canvas");
    const response = await guardar(datosAsistencia);

    video.classList.add("d-none");
    registrar.classList.add("disabled");
    canva[0].remove();
    datosAsistencia = {};

    nombre.innerText = "";
    codigo.innerText = "";
    documento.innerText = "";
    hora.innerHTML = "";
    taller.innerText = "";

    if(response.status && response.status === "200"){
        toastSuccess.show();
    } else {
        toastWarning.show();
    }
}

function llenarDatos(user) {
    const date = new Date;
    
    const tiempo = ("0" + date.getDate()).slice(-2) + "/" +
    ("0" + (date.getMonth()+1)).slice(-2) + "/" +
    date.getFullYear() + " " +
    ("0" + date.getHours()).slice(-2) + ":" +
    ("0" + date.getMinutes()).slice(-2) + ":" +
    ("0" + date.getSeconds()).slice(-2);

    const attendant = fotos1.find(foto => foto.nombre === user);

    nombre.innerText = attendant.nombre;
    codigo.innerText = attendant.codigo;
    documento.innerText = attendant.nroDocumento;
    hora.innerHTML = tiempo;
    taller.innerText = attendant.taller;

    datosAsistencia.nombre = attendant.nombre;
    datosAsistencia.codigo = attendant.codigo;
    datosAsistencia.nroDocumento = attendant.nroDocumento;
    datosAsistencia.tiempo = tiempo;
    datosAsistencia.taller = attendant.taller;
}

async function startVideo(){
    container.style.position = 'relative';
    document.body.append(container);
    navigator.getUserMedia(
        { video: {}},
        stream => video.srcObject = stream,
        err => console.error(err)
    );

    video.addEventListener('play', async () => {
        container.append(video);
        const canvas = faceapi.createCanvasFromMedia(video);
        container.append(canvas);
        const displaySize = {width:video.width, height: video.height};
        faceapi.matchDimensions(canvas, displaySize);
        const detections = await faceapi.detectSingleFace(video).withFaceLandmarks().withFaceDescriptor();
        const resizedDetections = faceapi.resizeResults(detections, displaySize);
        const labeledDescriptors = await loadLabeledImages();
        const faceMatcher = new faceapi.FaceMatcher(labeledDescriptors, 0.6);
        const results = faceMatcher.findBestMatch(resizedDetections.descriptor);
        const box = resizedDetections.detection.box;
        const drawBox = new faceapi.draw.DrawBox(box, {label: results.toString()});
        drawBox.draw(canvas);
        llenarDatos(results.label);
        registrar.classList.remove('disabled');
    })
}

function loadLabeledImages() {
    return Promise.all(
        fotos1.map(async foto => {
            const descriptions =[];
            const img = await faceapi.fetchImage(foto.foto);
            const detections = await faceapi.detectSingleFace(img).withFaceLandmarks().withFaceDescriptor();
            descriptions.push(detections.descriptor);

            return new faceapi.LabeledFaceDescriptors(foto.nombre, descriptions);
        })
    )
}

// const formulario = document.querySelector('form');
// const formData = new FormData(formulario);

// const nombre = formData.get('nombre');
// const codigo = formData.get('codigo');
// const documento = formData.get('documento');
// const talleres = formData.getAll('taller');