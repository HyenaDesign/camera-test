const webcamElement = document.getElementById('webcam');
const canvasElement = document.getElementById('canvas');
const captureButton = document.getElementById('capture-button');
const predictionElement = document.getElementById('prediction');
const restartButton = document.getElementById('restart-button');
const webcam = new Webcam(webcamElement, 'user', canvasElement);
let inceptionModel;

async function init() {
    try {
        await webcam.start();
        console.log('Webcam started');
        inceptionModel = await tf.loadGraphModel('https://tfhub.dev/google/tfjs-model/inception_v3/1/default/1', { fromTFHub: true });
        console.log('Inception model loaded');
    } catch (error) {
        console.error('Error accessing webcam or loading model:', error);
        handleInitError(error);
    }
}

function handleInitError(error) {
    if (error.name === 'NotAllowedError') {
        alert('Camera access was denied. Please allow access to the camera.');
    } else if (error.name === 'NotFoundError') {
        alert('No camera was found. Please ensure your camera is connected.');
    } else if (error.name === 'NotReadableError') {
        alert('The camera is already in use by another application.');
    } else {
        alert('An unknown error occurred while trying to access the camera.');
    }
}

captureButton.addEventListener('click', async () => {
    const picture = webcam.snap();
    const img = new Image();
    img.src = picture;

    img.onload = async () => {
        const predictions = await predictWithInception(img);
        displayPredictions(predictions);
    };
});

async function predictWithInception(image) {
    const tensor = tf.browser.fromPixels(image).resizeNearestNeighbor([299, 299]).toFloat().expandDims();


    const predictions = await inceptionModel.predict(tensor);

    return Array.from(predictions.dataSync());
}

restartButton.addEventListener('click', () => {
    window.location.reload(); // Reload the webpage
});

function displayPredictions(predictions) {
    const top5 = getTopPredictions(predictions, 5); // Get top 5 predictions
    predictionElement.innerHTML = '';
    top5.forEach((probability, index) => {
        const p = document.createElement('p');
        p.innerText = `Class ${index}: ${probability.toFixed(4)}`;
        predictionElement.appendChild(p);
    });
}

function getTopPredictions(predictions, numTopPredictions) {
    const values = Array.from(predictions);
    const indices = values.map((value, index) => index);
    indices.sort((indexA, indexB) => values[indexB] - values[indexA]);
    const topIndices = indices.slice(0, numTopPredictions);
    return topIndices.map(index => values[index]);
}

init();
