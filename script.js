const videoElement = document.getElementById('video');
const canvasElement = document.getElementById('canvas');
const captureButton = document.getElementById('capture-button');
const predictionElement = document.getElementById('prediction');
const restartButton = document.getElementById('restart-button');

if (!videoElement || !canvasElement || !captureButton || !predictionElement || !restartButton) {
    console.error("One or more required elements are missing.");
    // Handle this error, perhaps by displaying a message to the user
}

async function init() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { exact: 'environment' } } });
        videoElement.srcObject = stream;
        videoElement.play();
        console.log('Camera started');
    } catch (error) {
        console.error('Error accessing camera:', error);
        handleCameraError(error);
    }
}

captureButton.addEventListener('click', () => {
    const context = canvasElement.getContext('2d');
    context.drawImage(videoElement, 0, 0, canvasElement.width, canvasElement.height);
    const picture = canvasElement.toDataURL('image/jpeg');
    const img = new Image();
    img.src = picture;

    img.onload = async () => {
        const model = await mobilenet.load();
        const predictions = await model.classify(img);
        displayPredictions(predictions);
    };
});

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
