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
            ctx.drawImage(backgroundImage, 0, 0);
        }
        undoStack = [];
        
        // Update line width for current scale
        ctx.lineWidth = baseWidth * renderScale;
        
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
    
    if (pdfDocument && pdfDocument.numPages > 1) {
        pageNav.classList.remove('hidden');
        pageIndicator.textContent = `Page ${currentPageNum} of ${pdfDocument.numPages}`;
        prevBtn.disabled = currentPageNum <= 1;
        nextBtn.disabled = currentPageNum >= pdfDocument.numPages;
    } else {
        pageNav.classList.add('hidden');
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
        
        // Set canvas to page size
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        
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
                // Set canvas to image size
                canvas.width = backgroundImage.width;
                canvas.height = backgroundImage.height;
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
    ctx.lineWidth = baseWidth * renderScale;
    document.getElementById('thicknessValue').textContent = baseWidth;
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
        // Save signature for current page
        if (pdfDocument) {
            pageSignatures[currentPageNum] = ctx.getImageData(0, 0, canvas.width, canvas.height);
        }
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
    let x = getX(e);
    let y = getY(e);
    ctx.moveTo(x, y);
    lastX = x;
    lastY = y;
    lastTime = Date.now();
}

function draw(e) {
    if (!drawing) return;
    let x = getX(e);
    let y = getY(e);
    let currentTime = Date.now();
    let distance = Math.sqrt((x - lastX) ** 2 + (y - lastY) ** 2);
    let timeDiff = currentTime - lastTime;
    if (timeDiff > 0) {
        let speed = distance / timeDiff;
        let maxSpeed = 3; // Reduced for more variation
        let factor = Math.min(speed / maxSpeed, 1);
        if (currentMode === 'pen') {
            ctx.lineWidth = Math.max(baseWidth * (1 - factor * 0.9), 1); // Increased factor for stronger effect
        } else {
            ctx.lineWidth = baseWidth;
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
    if (backgroundImage && isDocumentLoaded) {
        ctx.drawImage(backgroundImage, 0, 0);
    }
    undoStack = [];
    // Clear signature for current page
    if (pdfDocument) {
        delete pageSignatures[currentPageNum];
    }
});

// Undo button
document.getElementById('undoBtn').addEventListener('click', function() {
    if (undoStack.length > 0) {
        var imgData = undoStack.pop();
        ctx.putImageData(imgData, 0, 0);
    } else if (backgroundImage && isDocumentLoaded) {
        // If no undo history but document is loaded, restore document
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(backgroundImage, 0, 0);
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
document.getElementById('confirmSave').addEventListener('click', async function() {
    if (pdfDocument) {
        // Save as PDF
        await saveAsPDF();
    } else {
        // Save as PNG
        var dataURL = document.getElementById('previewImg').src;
        var link = document.createElement('a');
        var filename = isDocumentLoaded ? 'signed-document.png' : 'signature.png';
        link.download = filename;
        link.href = dataURL;
        link.click();
    }
    closeModal();
});

// Function to save signed PDF
async function saveAsPDF() {
    try {
        const pdfDoc = await PDFLib.PDFDocument.load(originalPdfData);
        const pages = pdfDoc.getPages();
        
        for (let i = 0; i < pages.length; i++) {
            const page = pages[i];
            const pageNum = i + 1;
            
            if (pageSignatures[pageNum]) {
                // Get signature only by subtracting background
                const sigImageData = await getSignatureImageData(pageNum);
                if (sigImageData) {
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
    
    // Render the background page at same scale
    const page = await pdfDocument.getPage(pageNum);
    const scale = 2;
    const viewport = page.getViewport({scale: scale});
    
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
    
    // Create signature ImageData by comparing pixels
    const sigData = new ImageData(signedData.width, signedData.height);
    const signedPixels = signedData.data;
    const bgPixels = bgData.data;
    const sigPixels = sigData.data;
    
    for (let i = 0; i < signedPixels.length; i += 4) {
        // If pixels differ, it's signature
        if (signedPixels[i] !== bgPixels[i] || signedPixels[i+1] !== bgPixels[i+1] || signedPixels[i+2] !== bgPixels[i+2] || signedPixels[i+3] !== bgPixels[i+3]) {
            sigPixels[i] = signedPixels[i];     // R
            sigPixels[i+1] = signedPixels[i+1]; // G
            sigPixels[i+2] = signedPixels[i+2]; // B
            sigPixels[i+3] = signedPixels[i+3]; // A
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