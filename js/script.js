var canvas = document.getElementById('signatureCanvas');
var ctx = canvas.getContext('2d');
var drawing = false;
var hasStarted = false;
var undoStack = [];
var currentMode = 'pen'; // 'pen' or 'eraser'

// Set drawing properties
ctx.strokeStyle = '#000000';
ctx.lineWidth = 5;
ctx.lineCap = 'round';
ctx.lineJoin = 'round';

// Thickness selector
document.getElementById('thickness').addEventListener('input', function() {
    ctx.lineWidth = this.value;
    document.getElementById('thicknessValue').textContent = this.value;
});

// Color selector
document.getElementById('colorPicker').addEventListener('input', function() {
    ctx.strokeStyle = this.value;
});

// Drawing mode selectors
document.getElementById('penMode').addEventListener('click', function() {
    currentMode = 'pen';
    ctx.globalCompositeOperation = 'source-over'; // Normal drawing
    this.classList.add('bg-blue-700');
    this.classList.remove('bg-blue-600');
    document.getElementById('eraserMode').classList.remove('bg-gray-700');
    document.getElementById('eraserMode').classList.add('bg-gray-600');
});

document.getElementById('eraserMode').addEventListener('click', function() {
    currentMode = 'eraser';
    ctx.globalCompositeOperation = 'destination-out'; // Erase mode
    this.classList.add('bg-gray-700');
    this.classList.remove('bg-gray-600');
    document.getElementById('penMode').classList.remove('bg-blue-700');
    document.getElementById('penMode').classList.add('bg-blue-600');
});

// Mouse events
document.addEventListener('keydown', function(e) {
    if (e.key === 'Shift') {
        undoStack.push(ctx.getImageData(0, 0, canvas.width, canvas.height));
        drawing = true;
        hasStarted = false;
    }
});
document.addEventListener('keyup', function(e) {
    if (e.key === 'Shift') {
        drawing = false;
        hasStarted = false;
    }
});
document.addEventListener('mousemove', draw);

// Touch events for mobile
canvas.addEventListener('touchstart', function(e) {
    e.preventDefault();
    startDrawing(e);
});
canvas.addEventListener('touchend', function(e) {
    e.preventDefault();
    stopDrawing();
});
document.addEventListener('touchmove', function(e) {
    e.preventDefault();
    draw(e);
});

// Function to start drawing
function startDrawing(e) {
    undoStack.push(ctx.getImageData(0, 0, canvas.width, canvas.height));
    drawing = true;
    hasStarted = true;
    ctx.beginPath();
    ctx.moveTo(getX(e), getY(e));
}

function draw(e) {
    if (!drawing) return;
    if (!hasStarted) {
        ctx.beginPath();
        ctx.moveTo(getX(e), getY(e));
        hasStarted = true;
    } else {
        ctx.lineTo(getX(e), getY(e));
        ctx.stroke();
    }
}

// Function to stop drawing
function stopDrawing() {
    drawing = false;
}

// Helper function to get X coordinate from event

function stopDrawing() {
    drawing = false;
}

// Helper function to get Y coordinate from event

function getX(e) {
    var rect = canvas.getBoundingClientRect();
    var scaleX = canvas.width / rect.width;
    return ((e.clientX || e.touches[0].clientX) - rect.left) * scaleX;
}

function getY(e) {
    var rect = canvas.getBoundingClientRect();
    var scaleY = canvas.height / rect.height;
    return ((e.clientY || e.touches[0].clientY) - rect.top) * scaleY;
}

// Clear button
document.getElementById('clearBtn').addEventListener('click', function() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    undoStack = [];
});

// Undo button
document.getElementById('undoBtn').addEventListener('click', function() {
    if (undoStack.length > 0) {
        var imgData = undoStack.pop();
        ctx.putImageData(imgData, 0, 0);
    }
});

// Enhance button
document.getElementById('enhanceBtn').addEventListener('click', function() {
    enhanceSignature();
});

// Function to enhance/smooth the signature
function enhanceSignature() {
    // Save current state for undo
    undoStack.push(ctx.getImageData(0, 0, canvas.width, canvas.height));
    
    // Get image data
    var imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    var data = imageData.data;
    var width = canvas.width;
    var height = canvas.height;
    
    // Create a copy for processing
    var output = new Uint8ClampedArray(data);
    
    // Apply smoothing filter (box blur)
    var radius = 1; // Small radius for subtle smoothing
    for (var y = radius; y < height - radius; y++) {
        for (var x = radius; x < width - radius; x++) {
            var idx = (y * width + x) * 4;
            
            // Only process pixels that are not white (part of the signature)
            if (data[idx] < 250 || data[idx + 1] < 250 || data[idx + 2] < 250) {
                var r = 0, g = 0, b = 0, a = 0, count = 0;
                
                // Average neighboring pixels
                for (var dy = -radius; dy <= radius; dy++) {
                    for (var dx = -radius; dx <= radius; dx++) {
                        var nidx = ((y + dy) * width + (x + dx)) * 4;
                        r += data[nidx];
                        g += data[nidx + 1];
                        b += data[nidx + 2];
                        a += data[nidx + 3];
                        count++;
                    }
                }
                
                output[idx] = r / count;
                output[idx + 1] = g / count;
                output[idx + 2] = b / count;
                output[idx + 3] = a / count;
            }
        }
    }
    
    // Put the smoothed data back
    var smoothedImageData = new ImageData(output, width, height);
    ctx.putImageData(smoothedImageData, 0, 0);
}

// Save button
document.getElementById('saveBtn').addEventListener('click', function() {
    var dataURL = canvas.toDataURL('image/png');
    document.getElementById('previewImg').src = dataURL;
    var modal = document.getElementById('previewModal');
    var modalContent = document.getElementById('modalContent');
    modal.classList.remove('hidden');
    setTimeout(() => {
        modalContent.classList.remove('scale-95');
        modalContent.classList.add('scale-100');
    }, 10);
});

// Full screen button
var isFullscreen = false;
var originalParent = canvas.parentElement;
var fullscreenBtn = document.getElementById('fullscreenBtn');
var originalBtnParent = fullscreenBtn.parentElement;
document.getElementById('fullscreenBtn').addEventListener('click', function() {
    if (!isFullscreen) {
        // Enter full screen
        document.body.appendChild(canvas);
        canvas.style.position = 'fixed';
        canvas.style.top = '0';
        canvas.style.left = '0';
        canvas.style.width = '100vw';
        canvas.style.height = '100vh';
        canvas.style.zIndex = '9999';
        // Canvas size remains 800x400, displayed stretched to full screen
        // Move button to body
        document.body.appendChild(fullscreenBtn);
        fullscreenBtn.style.position = 'fixed';
        fullscreenBtn.style.top = '20px';
        fullscreenBtn.style.right = '20px';
        fullscreenBtn.style.zIndex = '10000';
        // Hide other elements
        document.querySelector('.lg\\:p-8').style.display = 'none';
        document.body.style.overflow = 'hidden';
        this.innerHTML = '<i class="fas fa-compress mr-2"></i>Exit Full Screen';
        isFullscreen = true;
    } else {
        // Exit full screen
        originalParent.appendChild(canvas);
        canvas.style.position = '';
        canvas.style.top = '';
        canvas.style.left = '';
        canvas.style.width = '';
        canvas.style.height = '';
        canvas.style.zIndex = '';
        // Canvas size remains 800x400
        // Move button back
        originalBtnParent.appendChild(fullscreenBtn);
        fullscreenBtn.style.position = '';
        fullscreenBtn.style.top = '';
        fullscreenBtn.style.right = '';
        fullscreenBtn.style.zIndex = '';
        // Show other elements
        document.querySelector('.lg\\:p-8').style.display = '';
        document.body.style.overflow = '';
        this.innerHTML = '<i class="fas fa-expand mr-2"></i>Full Screen';
        isFullscreen = false;
    }
});

// Confirm save
document.getElementById('confirmSave').addEventListener('click', function() {
    var dataURL = document.getElementById('previewImg').src;
    var link = document.createElement('a');
    link.download = 'signature.png';
    link.href = dataURL;
    link.click();
    closeModal();
});
// Function to close the preview modal


// Cancel save
document.getElementById('cancelSave').addEventListener('click', function() {
    closeModal();
});

function closeModal() {
    var modal = document.getElementById('previewModal');
    var modalContent = document.getElementById('modalContent');
    modalContent.classList.remove('scale-100');
    modalContent.classList.add('scale-95');
    setTimeout(() => {
        modal.classList.add('hidden');
    }, 300);
}

// Keyboard shortcuts
document.addEventListener('keydown', function(e) {
    if (e.ctrlKey || e.metaKey) {
        switch(e.key) {
            case 'z':
                e.preventDefault();
                document.getElementById('undoBtn').click();
                break;
        }
    }
    if (e.key === 'Delete' || e.key === 'Backspace') {
        if (!drawing) {
            e.preventDefault();
            document.getElementById('clearBtn').click();
        }
    }
    if (e.key === 'Escape') {
        if (!document.getElementById('previewModal').classList.contains('hidden')) {
            closeModal();
        }
    }
});

// Initialize pen mode as active
document.getElementById('penMode').classList.add('bg-blue-700');
document.getElementById('penMode').classList.remove('bg-blue-600');