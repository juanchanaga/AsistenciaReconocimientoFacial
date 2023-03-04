const video = document.getElementById('video');
let container = document.createElement('div');
const registrar = document.getElementById('registrarAsistencia');
const nombre = document.getElementById('nombre');
const codigo = document.getElementById('codigo');
const documento = document.getElementById('documento');
const hora = document.getElementById('hora');
const taller = document.getElementById('taller');

Promise.all([
    faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
    faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
    faceapi.nets.ssdMobilenetv1.loadFromUri('/models'),
]).then(startVideo())

function tomarAsistencia() {
    video.classList.remove("d-none");
}

function llenarDatos(name) {
    const date = new Date;
    const tiempo = ("0" + date.getDate()).slice(-2) + "/" +
    ("0" + (date.getMonth()+1)).slice(-2) + "/" +
    date.getFullYear() + " " +
    ("0" + date.getHours()).slice(-2) + ":" +
    ("0" + date.getMinutes()).slice(-2) + ":" +
    ("0" + date.getSeconds()).slice(-2);

    nombre.innerText = name;
    hora.innerHTML = tiempo;
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
    const labels = ['Juan Chanaga', 'Sonny Cacua'];
    return Promise.all(
        labels.map(async label => {
            const descriptions = [];
            const img = await faceapi.fetchImage(`/fotos/${label}/1.jpg`);
            const detections = await faceapi.detectSingleFace(img).withFaceLandmarks().withFaceDescriptor();
            descriptions.push(detections.descriptor);

            return new faceapi.LabeledFaceDescriptors(label, descriptions);
        })
    )
}