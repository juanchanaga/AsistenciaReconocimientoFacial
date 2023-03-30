import { buscar, guardar, getAll, guardarEstudiante } from "./modules/mongodb.js";

const video = document.getElementById('video');
let container = document.createElement('div');
const registrar = document.getElementById('registrarAsistencia');
const borrar = document.getElementById('borrarDatos');
const botonFoto = document.getElementById('botonFoto');
const nombre = document.getElementById('nombre');
const codigo = document.getElementById('codigo');
const documento = document.getElementById('documento');
const hora = document.getElementById('hora');
const taller = document.getElementById('taller');
const tomarAsistenciaButton = document.querySelector("#tomarAsistencia");
const registrarAsistenciaButton = document.querySelector("#registrarAsistencia");
const registrarEstudiante = document.querySelector('#registrarEstudiante');
const borrarDatos = document.querySelector('#borrarDatos');
const mensajeSuccess = document.getElementById('mensaje-success');
const mensajeWarning = document.getElementById('mensaje-warning');
const mensajeRegistroSuccess = document.getElementById('mensaje-registro-success');
const mensajeRegistroWarning = document.getElementById('mensaje-registro-warning');
const mensajeGuardarWarning = document.getElementById('mensaje-guardar-warning');
const mensajeFotoWarning = document.getElementById('mensaje-foto-warning');
const mensajeTallerWarning = document.getElementById('mensaje-taller-warning');
const formulario = document.getElementById("formulario");
const fotoVideo = document.getElementById('foto-video');
const fotoCanvas = document.getElementById('foto-canvas');
const formularioCampos = document.getElementById("formulario-registro");
let datosAsistencia = {};
let estudiantes = [];

Promise.all([
    faceapi.nets.faceRecognitionNet.loadFromUri('modelosFace'),
    faceapi.nets.faceLandmark68Net.loadFromUri('modelosFace'),
    faceapi.nets.ssdMobilenetv1.loadFromUri('modelosFace'),
]).then(startVideo())

tomarAsistenciaButton.onclick = async (event) => {
    event.preventDefault();
    estudiantes = [];
    const allEstudiantes = await getAll();
    estudiantes.push(...allEstudiantes);
    video.classList.remove("d-none");
    borrar.classList.remove('disabled');
    registrarEstudiante.classList.add('disabled');
}

registrarEstudiante.onclick = (event) => {
    event.preventDefault();

    borrar.classList.remove('disabled');
    formulario.classList.remove('d-none');

    navigator.mediaDevices.getUserMedia({ video: true })
        .then(stream => {
          fotoVideo.srcObject = stream;
          fotoVideo.play();
        })
        .catch(error => {
          console.error('Error al obtener acceso a la cámara', error);
        });
}

botonFoto.onclick = (event) => {
    event.preventDefault();

    fotoCanvas.getContext('2d').drawImage(fotoVideo, 0, 0, fotoCanvas.width, fotoCanvas.height);
    const imagenBase64 = fotoCanvas.toDataURL('image/png');
    localStorage.setItem('foto', imagenBase64);
}

borrarDatos.onclick = (event) => {
    event.preventDefault();
    location.reload();
    borrar.classList.add('disabled');
}

registrarAsistenciaButton.onclick = async (event) => {
    event.preventDefault();
    const toastSuccess = bootstrap.Toast.getOrCreateInstance(mensajeSuccess);
    const toastWarning = bootstrap.Toast.getOrCreateInstance(mensajeWarning);
    const response = await guardar(datosAsistencia);

    if(response.status && response.status === "200"){
        toastSuccess.show();

        setTimeout(function(){
            location.reload();
        }, 2000);

    } else {
        toastWarning.show();
    }
}

formularioCampos.onsubmit = async (event) => {
    event.preventDefault();
    
    const formData = new FormData(formularioCampos);
    const toastSuccess = bootstrap.Toast.getOrCreateInstance(mensajeRegistroSuccess);
    const toastWarning = bootstrap.Toast.getOrCreateInstance(mensajeRegistroWarning);
    const toastSaveWarning = bootstrap.Toast.getOrCreateInstance(mensajeGuardarWarning);
    const toastFotoWarning = bootstrap.Toast.getOrCreateInstance(mensajeFotoWarning);
    const toastTallerWarning = bootstrap.Toast.getOrCreateInstance(mensajeTallerWarning);
    const nroDocumento = formData.get('documento');
    const encontrarEstudiante = await buscar(nroDocumento);

    if(encontrarEstudiante === null){
        const nombre = formData.get('nombre');
        const codigo = formData.get('codigo');
        const taller = formData.getAll('taller');
        const foto = localStorage.getItem('foto');

        if(taller.length === 0){
            toastTallerWarning.show();
            return
        }

        console.log(localStorage.getItem('foto'));

        if(foto === null){
            console.log(foto);
            toastFotoWarning.show();
            return
        }

        const datosEstudiante = {
            "nombre": nombre,
            "nroDocumento": nroDocumento,
            "codigo": codigo,
            "taller": taller,
            "foto": foto
        }

        const response = await guardarEstudiante(datosEstudiante);

        if(response.status && response.status === "200"){
            toastSuccess.show();
            localStorage.clear();

            setTimeout(function(){
                location.reload();
            }, 2000);

        } else {
            toastSaveWarning.show();
        }
    } else {
        toastWarning.show();
    }    
}

function llenarDatos(user) {
    const date = new Date;
    datosAsistencia = {};
    let tallerActual;
    
    const tiempo = ("0" + date.getDate()).slice(-2) + "/" +
    ("0" + (date.getMonth()+1)).slice(-2) + "/" +
    date.getFullYear() + " " +
    ("0" + date.getHours()).slice(-2) + ":" +
    ("0" + date.getMinutes()).slice(-2) + ":" +
    ("0" + date.getSeconds()).slice(-2);

    const attendant = estudiantes.find(foto => foto.nroDocumento === user);

    attendant.taller.forEach(taller => {
        if (taller.includes("J-AM") && date.getHours < 12){
            tallerActual = taller;
        } else if (taller.includes("V-AM") && date.getHours < 12){
            tallerActual = taller;
        } else if (taller.includes("J-PM") && date.getHours > 12){
            tallerActual = taller;
        } else if (taller.includes("V-PM") && date.getHours > 12){
            tallerActual = taller;
        } else {
            tallerActual = "El estudiante no está registrado en el taller de esta jornada";
        }
    })

    nombre.innerText = attendant.nombre;
    codigo.innerText = attendant.codigo;
    documento.innerText = attendant.nroDocumento;
    hora.innerHTML = tiempo;
    taller.innerText = tallerActual;

    datosAsistencia.nombre = attendant.nombre;
    datosAsistencia.codigo = attendant.codigo;
    datosAsistencia.nroDocumento = attendant.nroDocumento;
    datosAsistencia.tiempo = tiempo;
    datosAsistencia.taller = tallerActual;
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
        estudiantes.map(async estudiante => {
            const descriptions =[];
            const img = await faceapi.fetchImage(estudiante.foto);
            const detections = await faceapi.detectSingleFace(img).withFaceLandmarks().withFaceDescriptor();
            if(detections && detections.descriptor){
                descriptions.push(detections.descriptor);
            }

            return new faceapi.LabeledFaceDescriptors(estudiante.nroDocumento, descriptions);
        })
    )
}