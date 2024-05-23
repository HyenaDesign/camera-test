const canvasElement = document.getElementById('canvas');
const captureButton = document.getElementById('capture-button');
const predictionElement = document.getElementById('prediction');
const restartButton = document.getElementById('restart-button');

async function init() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { exact: 'environment' } } });
        const videoTrack = stream.getVideoTracks()[0];
        const imageCapture = new ImageCapture(videoTrack);
        captureButton.addEventListener('click', async () => {
            const blob = await imageCapture.takePhoto();
            const img = new Image();
            img.src = URL.createObjectURL(blob);
            img.onload = async () => {
                const model = await mobilenet.load();
                const predictions = await model.classify(img);
                displayPredictions(predictions);
            };
        });
        console.log('Camera started');
    } catch (error) {
        console.error('Error accessing camera:', error);
        handleCameraError(error);
    }
}

function handleCameraError(error) {
    if (error.name === 'NotAllowedError') {
        alert('Camera access was denied. Please allow access to the camera.');
    } else if (error.name === 'NotFoundError') {
        alert('No camera was found. Please ensure your camera is connected.');
    } else if (error.name === 'NotReadableError') {
        alert('The camera is already in use by another application.');
    } else if (error.name === 'OverconstrainedError' || error.name === 'ConstraintNotSatisfiedError') {
        alert('The requested constraints could not be satisfied by any available camera.');
    } else {
        alert('An unknown error occurred while trying to access the camera.');
    }
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
