// Configure PDF.js
if (typeof pdfjsLib === 'undefined') {
    console.error('PDF.js library not loaded. Please check your internet connection.');
    alert('PDF.js library failed to load. PDF import functionality may not work.');
} else {
    pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
}

var canvas = document.getElementById('signatureCanvas');
if (!canvas) {
    console.error('Canvas element not found!');
    alert('Canvas element not found. Please refresh the page.');
} else {
    var ctx = canvas.getContext('2d');
}
var drawing = false;
var hasStarted = false;
var undoStack = [];
var currentMode = 'pen'; // 'pen' or 'eraser'
let lastX = 0;
let lastY = 0;
let lastTime = 0;
let baseWidth = 5;
let backgroundImage = null; // Store the imported document
let isDocumentLoaded = false;
let pdfDocument = null; // Store the PDF document for multi-page navigation
let currentPageNum = 1;
let renderScale = 1; // Scale factor for rendering (1 for images, 2 for PDFs)
let originalPdfData = null; // Store original PDF bytes for saving
let originalDimensions = {}; // Store original dimensions of each page before scaling
let canvasScaleRatio = 1; // Ratio between display canvas and original document

// Separate signature storage per page
let pageSignatures = {}; // Will store signature ImageData per page

// Zoom variables
let zoomLevel = 1.0;
let minZoom = 0.5;
let maxZoom = 3.0;
let zoomStep = 0.25;
let canvasContainer = document.getElementById('canvasContainer');
let isPanning = false;
let panStartX = 0;
let panStartY = 0;
let scrollLeft = 0;
let scrollTop = 0;
let isSpacePressed = false;

// Touch zoom and pan variables
let initialPinchDistance = 0;
let initialZoomLevel = 1.0;
let isPinching = false;
let lastTouchX = 0;
let lastTouchY = 0;
let touchScrollLeft = 0;
let touchScrollTop = 0;
let lastDistance = 0; // Track previous distance to detect pinch vs pan

// Set drawing properties
ctx.strokeStyle = '#000000';
ctx.lineWidth = baseWidth * renderScale;
ctx.lineCap = 'round';
ctx.lineJoin = 'round';

// Import document functionality
document.getElementById('importBtn').addEventListener('click', function() {
    console.log('Import button clicked');
    document.getElementById('fileInput').click();
});

document.getElementById('fileInput').addEventListener('change', function(e) {
    console.log('File input changed', e.target.files);
    const file = e.target.files[0];
    if (file) {
        console.log('File selected:', file.name, file.type, file.size);
        // Show loading state
        const importBtn = document.getElementById('importBtn');
        const originalText = importBtn.innerHTML;
        importBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Loading...';
        importBtn.disabled = true;
        
        handleFileImport(file).finally(() => {
            // Reset button state
            importBtn.innerHTML = originalText;
            importBtn.disabled = false;
            // Reset file input to allow selecting the same file again
            e.target.value = '';
        });
    } else {
        console.log('No file selected');
    }
});

// Function to handle file import
async function handleFileImport(file) {
    try {
        // Validate file size (max 10MB)
        if (file.size > 10 * 1024 * 1024) {
            alert('File size too large. Please select a file smaller than 10MB.');
            return;
        }

        const fileType = file.type;
        
        if (fileType === 'application/pdf') {
            await loadPDF(file);
        } else if (fileType.startsWith('image/')) {
            pdfDocument = null; // Not a PDF
            currentPageNum = 1;
            pageSignatures = {};
            renderScale = 1; // Normal scale for images
            await loadImage(file);
        } else {
            alert('Please select a PDF or image file (PNG, JPG, JPEG).');
            return;
        }
        
        isDocumentLoaded = true;
        // Clear any existing signature when loading a new document
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        if (backgroundImage) {
            ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);
        }
        undoStack = [];
        
        // Update line width - since we draw at full res, scale the line width
        const displayScale = (canvas.width / parseFloat(canvas.style.width || canvas.width)) * zoomLevel;
        ctx.lineWidth = baseWidth * displayScale;
        
        // Show zoom controls when document is loaded
        document.getElementById('zoomControls').classList.remove('hidden');
        document.getElementById('zoomControls').classList.add('flex');
        
        // Update page navigation
        updatePageNavigation();
        
        console.log('Document loaded successfully');
    } catch (error) {
        console.error('Error loading document:', error);
        alert('Error loading document. Please try again with a valid PDF or image file.');
        // Reset file input
        document.getElementById('fileInput').value = '';
    }
}

// Function to update page navigation UI
function updatePageNavigation() {
    const pageNav = document.getElementById('pageNav');
    const pageIndicator = document.getElementById('pageIndicator');
    const prevBtn = document.getElementById('prevPageBtn');
    const nextBtn = document.getElementById('nextPageBtn');
    
    if (isDocumentLoaded) {
        if (pdfDocument && pdfDocument.numPages > 1) {
            pageNav.classList.remove('hidden');
            pageIndicator.textContent = `Page ${currentPageNum} of ${pdfDocument.numPages}`;
            prevBtn.disabled = currentPageNum <= 1;
            nextBtn.disabled = currentPageNum >= pdfDocument.numPages;
        } else {
            pageNav.classList.add('hidden');
            pageIndicator.textContent = 'Page 1';
        }
    } else {
        pageNav.classList.add('hidden');
        pageIndicator.textContent = '';
    }
}

// Page navigation event listeners
document.getElementById('prevPageBtn').addEventListener('click', async function() {
    if (currentPageNum > 1) {
        // Save current page signature
        pageSignatures[currentPageNum] = ctx.getImageData(0, 0, canvas.width, canvas.height);
        
        currentPageNum--;
        await loadPage(currentPageNum);
        updatePageNavigation();
        undoStack = [];
    }
});

document.getElementById('nextPageBtn').addEventListener('click', async function() {
    if (currentPageNum < pdfDocument.numPages) {
        // Save current page signature
        pageSignatures[currentPageNum] = ctx.getImageData(0, 0, canvas.width, canvas.height);
        
        currentPageNum++;
        await loadPage(currentPageNum);
        updatePageNavigation();
        undoStack = [];
    }
});

// Function to load PDF
async function loadPDF(file) {
    try {
        const arrayBuffer = await file.arrayBuffer();
        // Make a copy of the ArrayBuffer to prevent detachment
        const copy = new ArrayBuffer(arrayBuffer.byteLength);
        new Uint8Array(copy).set(new Uint8Array(arrayBuffer));
        originalPdfData = copy;
        renderScale = 2; // Higher scale for PDFs
        pdfDocument = await pdfjsLib.getDocument({data: arrayBuffer}).promise;
        
        // Check if PDF has pages
        if (pdfDocument.numPages === 0) {
            throw new Error('PDF has no pages');
        }
        
        currentPageNum = 1;
        pageSignatures = {};
        
        await loadPage(currentPageNum);
    } catch (error) {
        console.error('Error loading PDF:', error);
        throw new Error('Failed to load PDF. Please ensure it\'s a valid PDF file.');
    }
}

// Function to load a specific page
async function loadPage(pageNum) {
    try {
        const page = await pdfDocument.getPage(pageNum);
        const scale = 2; // Higher scale for better quality
        const viewport = page.getViewport({scale: scale});
        
        // Store original dimensions and set canvas to full resolution
        originalDimensions[pageNum] = {
            width: viewport.width,
            height: viewport.height
        };
        
        // Always set canvas to FULL original resolution
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        
        // Initialize signature canvas with same dimensions
        signatureCanvas = document.createElement('canvas');
        signatureCanvas.width = viewport.width;
        signatureCanvas.height = viewport.height;
        signatureCtx = signatureCanvas.getContext('2d');
        signatureCtx.strokeStyle = '#000000';
        signatureCtx.lineWidth = baseWidth;
        signatureCtx.lineCap = 'round';
        signatureCtx.lineJoin = 'round';
        
        // Calculate display width for CSS scaling - responsive for mobile
        const containerWidth = canvasContainer.clientWidth || 800;
        const maxDisplayWidth = Math.min(800, containerWidth - 20); // 20px padding
        let displayWidth = viewport.width;
        let displayHeight = viewport.height;
        
        if (viewport.width > maxDisplayWidth) {
            const ratio = maxDisplayWidth / viewport.width;
            displayWidth = maxDisplayWidth;
            displayHeight = viewport.height * ratio;
        }
        
        // Apply CSS scaling for display only
        canvas.style.width = displayWidth + 'px';
        canvas.style.height = displayHeight + 'px';
        
        // Scale ratio is 1 since we draw at full resolution
        canvasScaleRatio = 1;
        
        const renderContext = {
            canvasContext: ctx,
            viewport: viewport
        };
        
        await page.render(renderContext).promise;
        
        // Create image from canvas for background
        backgroundImage = new Image();
        backgroundImage.src = canvas.toDataURL();
        
        return new Promise((resolve, reject) => {
            backgroundImage.onload = () => {
                // Clear and redraw background
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                ctx.drawImage(backgroundImage, 0, 0);

                // Restore signature if exists
                if (pageSignatures[pageNum]) {
                    ctx.putImageData(pageSignatures[pageNum], 0, 0);
                }
                resolve();
            };
            backgroundImage.onerror = () => {
                reject(new Error('Failed to load PDF page image'));
            };
        });
    } catch (error) {
        console.error('Error loading page:', error);
        throw error;
    }
}

// Function to load image
async function loadImage(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = function(e) {
            backgroundImage = new Image();
            backgroundImage.onload = function() {
                // Store original dimensions
                originalDimensions[1] = {
                    width: backgroundImage.width,
                    height: backgroundImage.height
                };
                
                // Always set canvas to FULL original resolution
                canvas.width = backgroundImage.width;
                canvas.height = backgroundImage.height;
                
                // Calculate display dimensions for CSS scaling - responsive for mobile
                const containerWidth = canvasContainer.clientWidth || 800;
                const maxDisplayWidth = Math.min(800, containerWidth - 20); // 20px padding
                let displayWidth = backgroundImage.width;
                let displayHeight = backgroundImage.height;
                
                if (backgroundImage.width > maxDisplayWidth) {
                    const ratio = maxDisplayWidth / backgroundImage.width;
                    displayWidth = maxDisplayWidth;
                    displayHeight = backgroundImage.height * ratio;
                }
                
                // Apply CSS scaling for display only
                canvas.style.width = displayWidth + 'px';
                canvas.style.height = displayHeight + 'px';
                
                // Scale ratio is 1 since we draw at full resolution
                canvasScaleRatio = 1;
                
                // Draw the image at full resolution
                ctx.drawImage(backgroundImage, 0, 0, backgroundImage.width, backgroundImage.height);
                resolve();
            };
            backgroundImage.onerror = function() {
                reject(new Error('Failed to load image'));
            };
            backgroundImage.src = e.target.result;
        };
        reader.onerror = function() {
            reject(new Error('Failed to read file'));
        };
        reader.readAsDataURL(file);
    });
}

// Color selector
document.getElementById('colorPicker').addEventListener('input', function() {
    ctx.strokeStyle = this.value;
});

// Thickness selector
document.getElementById('thickness').addEventListener('input', function() {
    baseWidth = parseInt(this.value);
    const displayScale = (canvas.width / parseFloat(canvas.style.width || canvas.width)) * zoomLevel;
    ctx.lineWidth = baseWidth * displayScale;
    document.getElementById('thicknessValue').querySelector('h3').textContent = baseWidth + 'PX';
});

// Drawing mode selectors
document.getElementById('penMode').addEventListener('click', function() {
    currentMode = 'pen';
    ctx.globalCompositeOperation = 'source-over'; // Normal drawing
    // Set pen mode as selected
    this.classList.remove('border-[#E5E7EB]');
    this.classList.add('border-[#155DFC]');
    this.querySelector('h3').classList.remove('text-[#4A5565]');
    this.querySelector('h3').classList.add('text-[#155DFC]');
    // Set eraser mode as unselected
    document.getElementById('eraserMode').classList.remove('border-[#155DFC]');
    document.getElementById('eraserMode').classList.add('border-[#E5E7EB]');
    document.getElementById('eraserMode').querySelector('h3').classList.remove('text-[#155DFC]');
    document.getElementById('eraserMode').querySelector('h3').classList.add('text-[#4A5565]');
});

document.getElementById('eraserMode').addEventListener('click', function() {
    currentMode = 'eraser';
    ctx.globalCompositeOperation = 'destination-out'; // Erase mode
    // Set eraser mode as selected
    this.classList.remove('border-[#E5E7EB]');
    this.classList.add('border-[#155DFC]');
    this.querySelector('h3').classList.remove('text-[#4A5565]');
    this.querySelector('h3').classList.add('text-[#155DFC]');
    // Set pen mode as unselected
    document.getElementById('penMode').classList.remove('border-[#155DFC]');
    document.getElementById('penMode').classList.add('border-[#E5E7EB]');
    document.getElementById('penMode').querySelector('h3').classList.remove('text-[#155DFC]');
    document.getElementById('penMode').querySelector('h3').classList.add('text-[#4A5565]');
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
        // Save signature for current page
        if (pdfDocument) {
            pageSignatures[currentPageNum] = ctx.getImageData(0, 0, canvas.width, canvas.height);
        }
    }
});
document.addEventListener('mousemove', draw);

// Touch events for mobile
canvas.addEventListener('touchstart', function(e) {
    const touches = e.touches;

    if (touches.length === 2) {
        // Two fingers: start pinch zoom and pan
        isPinching = true;
        initialPinchDistance = getTouchDistance(touches);
        lastDistance = initialPinchDistance; // Initialize last distance
        initialZoomLevel = zoomLevel;
        // Also prepare for panning
        const center = getTouchCenter(touches);
        lastTouchX = center.x;
        lastTouchY = center.y;
        touchScrollLeft = canvasContainer.scrollLeft;
        touchScrollTop = canvasContainer.scrollTop;
    } else if (touches.length === 1) {
        // One finger: start drawing
        startDrawing(e);
    }
}, { passive: true });

canvas.addEventListener('touchend', function(e) {
    const touches = e.touches;

    if (touches.length === 0) {
        // End all touch interactions
        isPinching = false;
        isPanning = false;
        stopDrawing();
    }
});

document.addEventListener('touchmove', function(e) {
    const touches = e.touches;

    if (touches.length === 2 && isPinching) {
        e.preventDefault();
        // Two fingers: determine if pinch zoom or pan based on distance stability
        const currentDistance = getTouchDistance(touches);
        const distanceChange = Math.abs(currentDistance - lastDistance) / lastDistance;
        const center = getTouchCenter(touches);
        
        // If distance changed significantly (>5%), treat as pinch zoom
        if (distanceChange > 0.05) {
            // Handle pinch zoom
            const scale = currentDistance / initialPinchDistance;
            const newZoomLevel = Math.max(minZoom, Math.min(maxZoom, initialZoomLevel * scale));

            if (newZoomLevel !== zoomLevel) {
                zoomLevel = newZoomLevel;
                updateZoom();
            }
        } else if (zoomLevel > 1) {
            // Distance stable and zoomed: handle pan with two fingers
            const deltaX = center.x - lastTouchX;
            const deltaY = center.y - lastTouchY;

            canvasContainer.scrollLeft = touchScrollLeft - deltaX;
            canvasContainer.scrollTop = touchScrollTop - deltaY;
        }

        lastTouchX = center.x;
        lastTouchY = center.y;
        lastDistance = currentDistance;
    } else if (touches.length === 1 && drawing) {
        // One finger: handle drawing only
        draw(e);
    }
    // For other cases, allow default behavior
});

// Function to start drawing
function startDrawing(e) {
    // Only start drawing with single touch (one finger)
    if (e.touches && e.touches.length !== 1) return;
    // Don't start drawing if already pinching (two fingers)
    if (isPinching) return;

    undoStack.push(ctx.getImageData(0, 0, canvas.width, canvas.height));
    drawing = true;
    hasStarted = true;
    ctx.beginPath();
    let x = getX(e);
    let y = getY(e);
    ctx.moveTo(x, y);
    lastX = x;
    lastY = y;
    lastTime = Date.now();
}

function draw(e) {
    if (!drawing || isPanning) return;
    let x = getX(e);
    let y = getY(e);
    let currentTime = Date.now();
    let distance = Math.sqrt((x - lastX) ** 2 + (y - lastY) ** 2);
    let timeDiff = currentTime - lastTime;
    const displayScale = (canvas.width / parseFloat(canvas.style.width || canvas.width)) * zoomLevel;
    if (timeDiff > 0) {
        let speed = distance / timeDiff;
        let maxSpeed = 3; // Reduced for more variation
        let factor = Math.min(speed / maxSpeed, 1);
        if (currentMode === 'pen') {
            ctx.lineWidth = Math.max(baseWidth * displayScale * (1 - factor * 0.9), 1); // Increased factor for stronger effect
        } else {
            ctx.lineWidth = baseWidth * displayScale;
        }
    }
    if (!hasStarted) {
        ctx.beginPath();
        ctx.moveTo(x, y);
        hasStarted = true;
    } else {
        ctx.lineTo(x, y);
        ctx.stroke();
    }
    lastX = x;
    lastY = y;
    lastTime = currentTime;
}

// Function to stop drawing
function stopDrawing() {
    if (drawing && isDocumentLoaded) {
        // Save signature data for current page
        pageSignatures[currentPageNum] = ctx.getImageData(0, 0, canvas.width, canvas.height);
    }
    drawing = false;
}

// Helper function to get X coordinate from event

function getX(e) {
    var rect = canvas.getBoundingClientRect();
    // Account for CSS zoom scaling: rect dimensions are visual, canvas dimensions are actual pixels
    var visualScaleX = rect.width / canvas.offsetWidth; // CSS scaling factor
    var pixelScaleX = canvas.width / canvas.offsetWidth; // Base pixel ratio
    return ((e.clientX || e.touches[0].clientX) - rect.left) * (pixelScaleX / visualScaleX);
}

function getY(e) {
    var rect = canvas.getBoundingClientRect();
    // Account for CSS zoom scaling: rect dimensions are visual, canvas dimensions are actual pixels
    var visualScaleY = rect.height / canvas.offsetHeight; // CSS scaling factor
    var pixelScaleY = canvas.height / canvas.offsetHeight; // Base pixel ratio
    return ((e.clientY || e.touches[0].clientY) - rect.top) * (pixelScaleY / visualScaleY);
}

// Clear button
document.getElementById('clearBtn').addEventListener('click', function() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (backgroundImage && isDocumentLoaded) {
        ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);
    }
    
    // Clear signature for current page
    if (isDocumentLoaded) {
        delete pageSignatures[currentPageNum];
    }
    
    undoStack = [];
});

// Undo button
document.getElementById('undoBtn').addEventListener('click', function() {
    if (undoStack.length > 0) {
        var imgData = undoStack.pop();
        ctx.putImageData(imgData, 0, 0);
    } else if (backgroundImage && isDocumentLoaded) {
        // If no undo history but document is loaded, restore document
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);
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
    if (pdfDocument) {
        // For PDFs, save directly without preview
        saveAsPDF();
    } else {
        // For images or no document, show preview
        var dataURL = canvas.toDataURL('image/png');
        document.getElementById('previewImg').src = dataURL;
        var modal = document.getElementById('previewModal');
        var modalContent = document.getElementById('modalContent');
        modal.classList.remove('hidden');
        setTimeout(() => {
            modalContent.classList.remove('scale-95');
            modalContent.classList.add('scale-100');
        }, 10);
    }
});

// Full screen button
var isFullscreen = false;
var originalParent = canvas.parentElement;
var fullscreenBtn = document.getElementById('fullscreenBtn');
var originalBtnParent = fullscreenBtn.parentElement;
var mainContainer = document.querySelector('.max-w-7xl');
var originalCanvasWidth = canvas.width;
var originalCanvasHeight = canvas.height;
document.getElementById('fullscreenBtn').addEventListener('click', function() {
    if (!isFullscreen) {
        // Enter full screen
        // Store original canvas size
        originalCanvasWidth = canvas.width;
        originalCanvasHeight = canvas.height;
        
        // Resize canvas to screen size
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        
        // Redraw content if document is loaded
        if (isDocumentLoaded && backgroundImage) {
            ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);
        }
        
        document.body.appendChild(canvas);
        canvas.style.position = 'fixed';
        canvas.style.top = '0';
        canvas.style.left = '0';
        canvas.style.width = '100vw';
        canvas.style.height = '100vh';
        canvas.style.zIndex = '9999';
        
        // Move button to body
        document.body.appendChild(fullscreenBtn);
        fullscreenBtn.style.position = 'fixed';
        fullscreenBtn.style.top = '20px';
        fullscreenBtn.style.right = '20px';
        fullscreenBtn.style.zIndex = '10000';
        fullscreenBtn.style.height = '48px'; // Increase height for longer text
        
        // Hide main container
        if (mainContainer) mainContainer.style.display = 'none';
        document.body.style.overflow = 'hidden';
        
        // Update button content
        fullscreenBtn.innerHTML = '<i class="fas fa-compress mr-2 text-[#0A0A0A]"></i><div class="text-[#0A0A0A]">Exit Full Screen</div>';
        isFullscreen = true;
    } else {
        // Exit full screen
        // Restore original canvas size
        canvas.width = originalCanvasWidth;
        canvas.height = originalCanvasHeight;
        
        // Redraw content if document is loaded
        if (isDocumentLoaded && backgroundImage) {
            ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);
        }
        
        originalParent.appendChild(canvas);
        canvas.style.position = '';
        canvas.style.top = '';
        canvas.style.left = '';
        canvas.style.width = '';
        canvas.style.height = '';
        canvas.style.zIndex = '';
        
        // Move button back
        originalBtnParent.appendChild(fullscreenBtn);
        fullscreenBtn.style.position = '';
        fullscreenBtn.style.top = '';
        fullscreenBtn.style.right = '';
        fullscreenBtn.style.zIndex = '';
        fullscreenBtn.style.height = ''; // Restore original height
        
        // Show main container
        if (mainContainer) mainContainer.style.display = '';
        document.body.style.overflow = '';
        
        // Update button content
        fullscreenBtn.innerHTML = '<img src="./assets/fullScreen-icon.svg" /><span class="text-[#0A0A0A]">Full Screen</span>';
        isFullscreen = false;
    }
});

// Helper functions for touch zoom
function getTouchDistance(touches) {
    const touch1 = touches[0];
    const touch2 = touches[1];
    return Math.sqrt(
        Math.pow(touch2.clientX - touch1.clientX, 2) + 
        Math.pow(touch2.clientY - touch1.clientY, 2)
    );
}

function getTouchCenter(touches) {
    const touch1 = touches[0];
    const touch2 = touches[1];
    return {
        x: (touch1.clientX + touch2.clientX) / 2,
        y: (touch1.clientY + touch2.clientY) / 2
    };
}

// Zoom functionality
function updateZoom() {
    canvas.style.transform = `scale(${zoomLevel})`;
    canvas.style.transformOrigin = 'top left';
    document.getElementById('zoomLevel').textContent = Math.round(zoomLevel * 100) + '%';
    
    // Keep canvas container at fixed size, only zoom the content
    // Container will scroll when zoomed content exceeds bounds due to overflow-auto
    if (zoomLevel > 1) {
        canvas.style.cursor = 'move';
    } else {
        canvas.style.cursor = 'crosshair';
    }
}

// Zoom In
document.getElementById('zoomInBtn').addEventListener('click', function() {
    if (zoomLevel < maxZoom) {
        zoomLevel = Math.min(zoomLevel + zoomStep, maxZoom);
        updateZoom();
    }
});

// Zoom Out
document.getElementById('zoomOutBtn').addEventListener('click', function() {
    if (zoomLevel > minZoom) {
        zoomLevel = Math.max(zoomLevel - zoomStep, minZoom);
        updateZoom();
    }
});

// Reset Zoom
document.getElementById('zoomResetBtn').addEventListener('click', function() {
    zoomLevel = 1.0;
    updateZoom();
    canvasContainer.scrollLeft = 0;
    canvasContainer.scrollTop = 0;
});

// Mouse wheel zoom
canvasContainer.addEventListener('wheel', function(e) {
    if (e.ctrlKey || e.metaKey) {
        const delta = e.deltaY > 0 ? -zoomStep : zoomStep;
        const newZoom = Math.max(minZoom, Math.min(maxZoom, zoomLevel + delta));
        
        if (newZoom !== zoomLevel) {
            // Calculate mouse position relative to canvas
            const rect = canvas.getBoundingClientRect();
            const mouseX = e.clientX - rect.left;
            const mouseY = e.clientY - rect.top;
            
            // Calculate scroll position to maintain mouse position
            const scrollX = (mouseX / zoomLevel) * newZoom - mouseX;
            const scrollY = (mouseY / zoomLevel) * newZoom - mouseY;
            
            zoomLevel = newZoom;
            updateZoom();
            
            canvasContainer.scrollLeft += scrollX;
            canvasContainer.scrollTop += scrollY;
        }
    }
}, { passive: true });

// Pan functionality when zoomed
canvasContainer.addEventListener('mousedown', function(e) {
    // Pan with middle mouse button or spacebar + left click when zoomed
    if (zoomLevel > 1 && (e.button === 1 || (e.button === 0 && isSpacePressed))) {
        isPanning = true;
        panStartX = e.clientX;
        panStartY = e.clientY;
        scrollLeft = canvasContainer.scrollLeft;
        scrollTop = canvasContainer.scrollTop;
        canvasContainer.style.cursor = 'grabbing';
    }
});

document.addEventListener('mousemove', function(e) {
    if (isPanning) {
        const deltaX = e.clientX - panStartX;
        const deltaY = e.clientY - panStartY;
        canvasContainer.scrollLeft = scrollLeft - deltaX;
        canvasContainer.scrollTop = scrollTop - deltaY;
    }
});

document.addEventListener('mouseup', function(e) {
    if (isPanning) {
        isPanning = false;
        canvasContainer.style.cursor = zoomLevel > 1 ? (isSpacePressed ? 'grab' : 'move') : '';
    }
});

// Spacebar for pan mode
document.addEventListener('keydown', function(e) {
    if (e.code === 'Space' && zoomLevel > 1 && !drawing) {
        e.preventDefault();
        isSpacePressed = true;
        canvasContainer.style.cursor = 'grab';
    }
});

document.addEventListener('keyup', function(e) {
    if (e.code === 'Space') {
        isSpacePressed = false;
        if (zoomLevel > 1 && !isPanning) {
            canvasContainer.style.cursor = 'move';
        }
    }
});

// Confirm save
document.getElementById('confirmSave').addEventListener('click', async function() {
    if (pdfDocument) {
        // Save as PDF
        await saveAsPDF();
    } else {
        // Save as PNG at original resolution
        const fullResCanvas = createFullResolutionCanvas();
        var dataURL = fullResCanvas.toDataURL('image/png');
        var link = document.createElement('a');
        var filename = isDocumentLoaded ? 'signed-document.png' : 'signature.png';
        link.download = filename;
        link.href = dataURL;
        link.click();
    }
    closeModal();
});

// Function to get full resolution canvas (canvas is already at full resolution)
function createFullResolutionCanvas() {
    // Canvas is already at full resolution, just return a copy
    const fullResCanvas = document.createElement('canvas');
    fullResCanvas.width = canvas.width;
    fullResCanvas.height = canvas.height;
    const fullResCtx = fullResCanvas.getContext('2d');
    
    // Copy the current canvas content
    fullResCtx.drawImage(canvas, 0, 0);
    
    return fullResCanvas;
}

// Function to save signed PDF
async function saveAsPDF() {
    try {
        const pdfDoc = await PDFLib.PDFDocument.load(originalPdfData);
        const pages = pdfDoc.getPages();
        
        for (let i = 0; i < pages.length; i++) {
            const page = pages[i];
            const pageNum = i + 1;
            
            // Check if there's signature data on the signature canvas
            const sigImageData = await getSignatureImageData(pageNum);
            if (sigImageData) {
                // Check if signature has any non-transparent pixels
                let hasSignature = false;
                const pixels = sigImageData.data;
                for (let j = 3; j < pixels.length; j += 4) {
                    if (pixels[j] > 0) { // Alpha channel > 0
                        hasSignature = true;
                        break;
                    }
                }
                
                if (hasSignature) {
                    // Convert to PNG
                    const sigCanvas = document.createElement('canvas');
                    sigCanvas.width = sigImageData.width;
                    sigCanvas.height = sigImageData.height;
                    const sigCtx = sigCanvas.getContext('2d');
                    sigCtx.putImageData(sigImageData, 0, 0);
                    
                    const sigPng = sigCanvas.toDataURL('image/png');
                    const sigImage = await pdfDoc.embedPng(sigPng);
                    
                    const { width, height } = page.getSize();
                    page.drawImage(sigImage, {
                        x: 0,
                        y: 0,
                        width: width,
                        height: height,
                    });
                }
            }
        }
        
        const pdfBytes = await pdfDoc.save();
        const blob = new Blob([pdfBytes], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'signed-document.pdf';
        link.click();
        URL.revokeObjectURL(url);
    } catch (error) {
        console.error('Error saving PDF:', error);
        alert('Error saving signed PDF. Please try again.');
    }
}

// Function to extract signature ImageData by subtracting background
async function getSignatureImageData(pageNum) {
    const signedData = pageSignatures[pageNum];
    if (!signedData) return null;

    // Get original dimensions
    const origDim = originalDimensions[pageNum];
    if (!origDim) return null;

    // Create signature ImageData by comparing with background
    // For reliability, we'll create a clean background and compare
    const page = await pdfDocument.getPage(pageNum);
    const viewport = page.getViewport({scale: 2});

    const bgCanvas = document.createElement('canvas');
    bgCanvas.width = viewport.width;
    bgCanvas.height = viewport.height;
    const bgCtx = bgCanvas.getContext('2d');

    const renderContext = {
        canvasContext: bgCtx,
        viewport: viewport
    };

    await page.render(renderContext).promise;
    const bgData = bgCtx.getImageData(0, 0, viewport.width, viewport.height);

    // Create signature ImageData
    const sigData = new ImageData(signedData.width, signedData.height);
    const signedPixels = signedData.data;
    const bgPixels = bgData.data;
    const sigPixels = sigData.data;

    // Simple difference check with some tolerance for rendering variations
    for (let i = 0; i < signedPixels.length; i += 4) {
        const rDiff = Math.abs(signedPixels[i] - bgPixels[i]);
        const gDiff = Math.abs(signedPixels[i+1] - bgPixels[i+1]);
        const bDiff = Math.abs(signedPixels[i+2] - bgPixels[i+2]);

        // If colors differ significantly, it's signature
        if (rDiff > 5 || gDiff > 5 || bDiff > 5) {
            sigPixels[i] = signedPixels[i];     // R
            sigPixels[i+1] = signedPixels[i+1]; // G
            sigPixels[i+2] = signedPixels[i+2]; // B
            sigPixels[i+3] = 255; // Opaque
        } else {
            sigPixels[i] = 0;
            sigPixels[i+1] = 0;
            sigPixels[i+2] = 0;
            sigPixels[i+3] = 0; // Transparent
        }
    }

    return sigData;
}
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

// Handle window resize for mobile responsiveness
function adjustCanvasDisplay() {
    if (isDocumentLoaded && canvas.width > 0) {
        const containerWidth = canvasContainer.clientWidth || 800;
        const maxDisplayWidth = Math.min(800, containerWidth - 20);
        const origWidth = canvas.width;
        const origHeight = canvas.height;
        
        let displayWidth = origWidth;
        let displayHeight = origHeight;
        
        if (origWidth > maxDisplayWidth) {
            const ratio = maxDisplayWidth / origWidth;
            displayWidth = maxDisplayWidth;
            displayHeight = origHeight * ratio;
        }
        
        canvas.style.width = displayWidth + 'px';
        canvas.style.height = displayHeight + 'px';
        
        // Update line width
        const displayScale = (canvas.width / parseFloat(canvas.style.width || canvas.width)) * zoomLevel;
        ctx.lineWidth = baseWidth * displayScale;
    }
}

// Debounce resize events
let resizeTimeout;
window.addEventListener('resize', function() {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(adjustCanvasDisplay, 250);
});

// Handle orientation change on mobile
window.addEventListener('orientationchange', function() {
    setTimeout(adjustCanvasDisplay, 300);
});

// Keyboard shortcuts
document.addEventListener('keydown', function(e) {
    if (e.ctrlKey || e.metaKey) {
        switch(e.key) {
            case 'z':
                document.getElementById('undoBtn').click();
                break;
        }
    }
    if (e.key === 'Delete' || e.key === 'Backspace') {
        if (!drawing) {
            document.getElementById('clearBtn').click();
        }
    }
    if (e.key === 'Escape') {
        if (!document.getElementById('previewModal').classList.contains('hidden')) {
            closeModal();
        } else if (isFullscreen) {
            document.getElementById('fullscreenBtn').click();
        }
    }
});

// Pen mode is already set as active in HTML with border-[#155DFC]

// Thickness options
function setThicknessButton(button) {
    // Remove selection from all thickness buttons
    document.querySelectorAll('[id$="Thickness"]').forEach(btn => {
        btn.classList.remove('border-[#155DFC]');
        btn.classList.add('border-[#E5E7EB]');
        btn.querySelector('h3').classList.remove('text-[#155DFC]');
        btn.querySelector('h3').classList.add('text-[#4A5565]');
    });
    // Set selected button
    button.classList.remove('border-[#E5E7EB]');
    button.classList.add('border-[#155DFC]');
    button.querySelector('h3').classList.remove('text-[#4A5565]');
    button.querySelector('h3').classList.add('text-[#155DFC]');
}

document.getElementById('thinThickness').addEventListener('click', function() {
    baseWidth = 2;
    ctx.lineWidth = baseWidth * renderScale;
    document.getElementById('thickness').value = baseWidth;
    document.getElementById('thicknessValue').querySelector('h3').textContent = baseWidth + 'PX';
    setThicknessButton(this);
});

document.getElementById('mediumThickness').addEventListener('click', function() {
    baseWidth = 5;
    ctx.lineWidth = baseWidth * renderScale;
    document.getElementById('thickness').value = baseWidth;
    document.getElementById('thicknessValue').querySelector('h3').textContent = baseWidth + 'PX';
    setThicknessButton(this);
});

document.getElementById('thickThickness').addEventListener('click', function() {
    baseWidth = 8;
    ctx.lineWidth = baseWidth * renderScale;
    document.getElementById('thickness').value = baseWidth;
    document.getElementById('thicknessValue').querySelector('h3').textContent = baseWidth + 'PX';
    setThicknessButton(this);
});

document.getElementById('boldThickness').addEventListener('click', function() {
    baseWidth = 12;
    ctx.lineWidth = baseWidth * renderScale;
    document.getElementById('thickness').value = baseWidth;
    document.getElementById('thicknessValue').querySelector('h3').textContent = baseWidth + 'PX';
    setThicknessButton(this);
});

// Color options
function setColorButton(button) {
    // Remove selection from all color buttons
    document.querySelectorAll('[id^="color"]').forEach(btn => {
        if (btn.id !== 'colorPicker') {
            btn.classList.remove('border-white', 'border-[#155DFC]');
            btn.classList.add('border-transparent');
        }
    });
    // Set selected button with white border (visible on all colors)
    button.classList.remove('border-transparent');
    button.classList.add('border-white');
}

document.getElementById('colorBlack').addEventListener('click', function() {
    document.getElementById('colorPicker').value = '#000000';
    ctx.strokeStyle = '#000000';
    setColorButton(this);
});

document.getElementById('colorBlue').addEventListener('click', function() {
    document.getElementById('colorPicker').value = '#2563EB';
    ctx.strokeStyle = '#2563EB';
    setColorButton(this);
});

document.getElementById('colorRed').addEventListener('click', function() {
    document.getElementById('colorPicker').value = '#DC2626';
    ctx.strokeStyle = '#DC2626';
    setColorButton(this);
});

document.getElementById('colorGreen').addEventListener('click', function() {
    document.getElementById('colorPicker').value = '#059669';
    ctx.strokeStyle = '#059669';
    setColorButton(this);
});

document.getElementById('colorPurple').addEventListener('click', function() {
    document.getElementById('colorPicker').value = '#7C3AED';
    ctx.strokeStyle = '#7C3AED';
    setColorButton(this);
});

document.getElementById('colorOrange').addEventListener('click', function() {
    document.getElementById('colorPicker').value = '#EA580C';
    ctx.strokeStyle = '#EA580C';
    setColorButton(this);
});

// Initialize zoom display
updateZoom();