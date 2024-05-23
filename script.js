const webcamElement = document.getElementById('webcam');
const canvasElement = document.getElementById('canvas');
const captureButton = document.getElementById('capture-button');
const restartButton = document.getElementById('restart-button');
const predictionElement = document.getElementById('prediction');
const webcamContainer = document.getElementById('webcam-container');
const webcam = new Webcam(webcamElement, 'user', canvasElement);
let isCaptured = false;

async function init() {
    try {
        await webcam.start();
        console.log('Webcam started');
    } catch (error) {
        console.error('Error accessing webcam:', error);
        handleWebcamError(error);
    }
}

function handleWebcamError(error) {
    if (error.name === 'NotAllowedError') {
        alert('Camera access was denied. Please allow access to the camera.');
    } else if (error.name === 'NotFoundError') {
        alert('No camera was found. Please ensure your camera is connected.');
    } else if (error.name === 'NotReadableError') {
        alert('The camera is already in use by another application.');
    } else if (error.name === 'OverconstrainedError') {
        alert('The camera constraints could not be satisfied. Please try a different camera.');
    } else if (error.name === 'SecurityError') {
        alert('Access to the camera is blocked by a security issue. Please check your browser settings.');
    } else {
        alert('An unknown error occurred while trying to access the camera.');
    }
}

captureButton.addEventListener('click', async () => {
    const picture = webcam.snap();
    const img = new Image();
    img.src = picture;

    img.onload = async () => {
        const model = await mobilenet.load();
        const predictions = await model.classify(img);
        displayPredictions(predictions);
        replaceLiveFeedWithImage(img);
        isCaptured = true;
    };
});

function replaceLiveFeedWithImage(img) {
    webcamContainer.innerHTML = ''; // Clear the webcam container
    webcamContainer.appendChild(img); // Append the captured image
}

restartButton.addEventListener('click', () => {
    window.location.reload(); // Reload the webpage
});

function displayPredictions(predictions) {
    predictionElement.innerHTML = '';
    predictions.forEach(prediction => {
        const p = document.createElement('p');
        p.innerText = `${prediction.className}: ${prediction.probability.toFixed(4)}`;
        predictionElement.appendChild(p);
    });
}

init();
