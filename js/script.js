var canvas = document.getElementById('signatureCanvas');
var ctx = canvas.getContext('2d');
var drawing = false;
var undoStack = [];

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

// Mouse events
canvas.addEventListener('mousedown', startDrawing);
document.addEventListener('mousemove', draw);

// Touch events for mobile
canvas.addEventListener('touchstart', function(e) {
    e.preventDefault();
    startDrawing(e);
});
document.addEventListener('touchmove', function(e) {
    e.preventDefault();
    draw(e);
});

function startDrawing(e) {
    if (!drawing) {
        undoStack.push(ctx.getImageData(0, 0, canvas.width, canvas.height));
        drawing = true;
        ctx.beginPath();
        ctx.moveTo(getX(e), getY(e));
    } else {
        drawing = false;
    }
}

function draw(e) {
    if (!drawing) return;
    ctx.lineTo(getX(e), getY(e));
    ctx.stroke();
}

function stopDrawing() {
    drawing = false;
}

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

// Confirm save
document.getElementById('confirmSave').addEventListener('click', function() {
    var dataURL = document.getElementById('previewImg').src;
    var link = document.createElement('a');
    link.download = 'signature.png';
    link.href = dataURL;
    link.click();
    closeModal();
});

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