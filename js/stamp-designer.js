class StampDesigner {
    constructor() {
        this.canvas = document.getElementById('stampCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.shapes = []; // Array to store multiple shapes
        this.selectedShape = null;
        this.textElements = [];
        this.selectedElement = null;
        this.isDragging = false;
        this.dragOffset = { x: 0, y: 0 };
        this.scale = 1; // Scale factor for rendering

        this.init();
        this.bindEvents();
        this.drawStamp();
    }

    init() {
        // Set canvas size to match design area
        this.canvas.width = 400;
        this.canvas.height = 400;
    }

    bindEvents() {
        // Shape buttons - now add new shapes
        document.querySelectorAll('.shape-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const shapeType = btn.dataset.shape;
                this.addShape(shapeType);
            });
        });

        // Size sliders - apply to selected shape
        document.getElementById('widthSlider').addEventListener('input', (e) => {
            if (this.selectedShape !== null) {
                this.shapes[this.selectedShape].width = parseInt(e.target.value);
                document.getElementById('widthValue').textContent = this.shapes[this.selectedShape].width + 'mm';
                this.updateSizeDisplay();
                this.drawStamp();
            }
        });

        document.getElementById('heightSlider').addEventListener('input', (e) => {
            if (this.selectedShape !== null) {
                this.shapes[this.selectedShape].height = parseInt(e.target.value);
                document.getElementById('heightValue').textContent = this.shapes[this.selectedShape].height + 'mm';
                this.updateSizeDisplay();
                this.drawStamp();
            }
        });

        // Color picker - apply to selected shape
        document.getElementById('stampColor').addEventListener('input', (e) => {
            if (this.selectedShape !== null) {
                this.shapes[this.selectedShape].color = e.target.value;
                this.drawStamp();
            }
        });

        // Fill/Hollow toggle - apply to selected shape
        document.getElementById('fillToggle').addEventListener('change', (e) => {
            if (this.selectedShape !== null) {
                this.shapes[this.selectedShape].isFilled = e.target.checked;
                this.drawStamp();
            }
        });

        // Font family selector
        document.getElementById('fontFamily').addEventListener('change', (e) => {
            // Update existing text elements with new font family
            this.textElements.forEach(textElement => {
                textElement.fontFamily = e.target.value;
            });
            this.drawStamp();
        });

        // Add text button
        document.getElementById('addTextBtn').addEventListener('click', () => {
            this.addText();
        });

        // Curve slider
        document.getElementById('curveSlider').addEventListener('input', (e) => {
            if (this.selectedElement && this.selectedElement.text) {
                this.selectedElement.curve = parseInt(e.target.value);
                document.getElementById('curveValue').textContent = this.selectedElement.curve;
                this.drawStamp();
            }
        });

        // Text color picker
        document.getElementById('textColor').addEventListener('input', (e) => {
            if (this.selectedElement && this.selectedElement.text) {
                this.selectedElement.color = e.target.value;
                this.drawStamp();
            }
        });

        // Export button
        document.getElementById('exportPNG').addEventListener('click', () => {
            this.exportStamp('png');
        });

        // Clear design button
        document.getElementById('clearDesign').addEventListener('click', () => {
            this.clearDesign();
        });

        // Canvas mouse events for dragging
        this.canvas.addEventListener('mousedown', (e) => this.handleMouseDown(e));
        this.canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        this.canvas.addEventListener('mouseup', (e) => this.handleMouseUp(e));
        this.canvas.addEventListener('mouseleave', (e) => this.handleMouseUp(e));

        // Keyboard events for deletion
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Delete' || e.key === 'Backspace') {
                this.deleteSelectedElement();
            }
        });

        // Layer management buttons
        document.getElementById('moveUpBtn').addEventListener('click', () => {
            this.moveLayerUp();
        });

        document.getElementById('moveDownBtn').addEventListener('click', () => {
            this.moveLayerDown();
        });

        document.getElementById('deleteLayerBtn').addEventListener('click', () => {
            this.deleteLayer();
        });
    }

    updateSizeDisplay() {
        const display = document.getElementById('sizeDisplay');
        if (this.selectedShape !== null) {
            const shape = this.shapes[this.selectedShape];
            if (shape.type === 'circle') {
                display.textContent = shape.width + 'mm diameter';
            } else {
                display.textContent = shape.width + 'mm x ' + shape.height + 'mm';
            }
        } else {
            display.textContent = 'No shape selected';
        }
    }

    addShape(shapeType) {
        const newShape = {
            type: shapeType,
            width: 300,  
            height: 300, 
            color: '#000000', // Black color for stamp designs
            isFilled: true,
            x: this.canvas.width / 2 + (this.shapes.length * 80), // Increased offset for larger shapes
            y: this.canvas.height / 2 + (this.shapes.length * 80)
        };
        this.shapes.push(newShape);
        this.selectedShape = this.shapes.length - 1; // Select the newly added shape
        this.selectedElement = 'shape';
        this.updateUIForSelectedShape();
        this.drawStamp();
    }

    updateUIForSelectedShape() {
        if (this.selectedShape !== null) {
            const shape = this.shapes[this.selectedShape];
            document.getElementById('widthSlider').value = shape.width;
            document.getElementById('heightSlider').value = shape.height;
            document.getElementById('widthValue').textContent = shape.width + 'mm';
            document.getElementById('heightValue').textContent = shape.height + 'mm';
            document.getElementById('stampColor').value = shape.color;
            document.getElementById('fillToggle').checked = shape.isFilled;
            
            // Enable shape controls
            document.getElementById('widthSlider').disabled = false;
            document.getElementById('heightSlider').disabled = false;
            document.getElementById('stampColor').disabled = false;
            document.getElementById('fillToggle').disabled = false;
            
            // Disable text controls
            document.getElementById('curveSlider').disabled = true;
        } else if (this.selectedElement && this.selectedElement.text) {
            // Text element selected
            document.getElementById('curveSlider').value = this.selectedElement.curve || 0;
            document.getElementById('curveValue').textContent = this.selectedElement.curve || 0;
            document.getElementById('textColor').value = this.selectedElement.color || '#000000';
            
            // Enable text controls
            document.getElementById('curveSlider').disabled = false;
            document.getElementById('textColor').disabled = false;
            
            // Disable shape controls
            document.getElementById('widthSlider').disabled = true;
            document.getElementById('heightSlider').disabled = true;
            document.getElementById('stampColor').disabled = true;
            document.getElementById('fillToggle').disabled = true;
        } else {
            // Disable all controls when nothing is selected
            document.getElementById('widthSlider').disabled = true;
            document.getElementById('heightSlider').disabled = true;
            document.getElementById('stampColor').disabled = true;
            document.getElementById('fillToggle').disabled = true;
            document.getElementById('curveSlider').disabled = true;
            document.getElementById('textColor').disabled = true;
        }
        this.updateSizeDisplay();
    }

    drawStamp() {
        this.clearCanvas();

        // Draw all shapes in reverse order (last added on top)
        for (let i = this.shapes.length - 1; i >= 0; i--) {
            const shape = this.shapes[i];
            const pixelWidth = shape.width * this.scale;
            const pixelHeight = shape.height * this.scale;

            this.ctx.fillStyle = shape.color;
            this.ctx.strokeStyle = shape.color;
            this.ctx.lineWidth = 2;

            switch (shape.type) {
                case 'circle':
                    const radius = pixelWidth / 2;
                    this.ctx.beginPath();
                    this.ctx.arc(shape.x, shape.y, radius, 0, 2 * Math.PI);
                    if (shape.isFilled) {
                        this.ctx.fill();
                    } else {
                        this.ctx.stroke();
                    }
                    break;

                case 'rectangle':
                    const rectX = shape.x - pixelWidth / 2;
                    const rectY = shape.y - pixelHeight / 2;
                    if (shape.isFilled) {
                        this.ctx.fillRect(rectX, rectY, pixelWidth, pixelHeight);
                    } else {
                        this.ctx.strokeRect(rectX, rectY, pixelWidth, pixelHeight);
                    }
                    break;

                case 'oval':
                    this.ctx.beginPath();
                    this.ctx.ellipse(shape.x, shape.y, pixelWidth / 2, pixelHeight / 2, 0, 0, 2 * Math.PI);
                    if (shape.isFilled) {
                        this.ctx.fill();
                    } else {
                        this.ctx.stroke();
                    }
                    break;

                case 'triangle':
                    this.ctx.beginPath();
                    this.ctx.moveTo(shape.x, shape.y - pixelHeight / 2);
                    this.ctx.lineTo(shape.x - pixelWidth / 2, shape.y + pixelHeight / 2);
                    this.ctx.lineTo(shape.x + pixelWidth / 2, shape.y + pixelHeight / 2);
                    this.ctx.closePath();
                    if (shape.isFilled) {
                        this.ctx.fill();
                    } else {
                        this.ctx.stroke();
                    }
                    break;
            }

            // Draw selection border if this shape is selected
            if (this.selectedShape === i) {
                this.ctx.strokeStyle = '#fbbf24';
                this.ctx.lineWidth = 2;
                this.ctx.strokeRect(shape.x - pixelWidth / 2 - 2, shape.y - pixelHeight / 2 - 2, pixelWidth + 4, pixelHeight + 4);
            }
        }

        // Draw text elements in reverse order (last added on top)
        for (let i = this.textElements.length - 1; i >= 0; i--) {
            const textElement = this.textElements[i];
            this.ctx.fillStyle = textElement.color || '#000000';
            this.ctx.font = `16px ${textElement.fontFamily}`;
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';

            const x = textElement.x || this.canvas.width / 2;
            const y = textElement.y || (this.canvas.height / 2 + (i * 30));

            if (textElement.curve && textElement.curve !== 0) {
                this.drawCurvedText(textElement.text, x, y, textElement.curve);
            } else {
                this.ctx.fillText(textElement.text, x, y);
            }

            // Draw selection border if selected
            if (this.selectedElement === textElement && (!textElement.curve || textElement.curve === 0)) {
                const metrics = this.ctx.measureText(textElement.text);
                const height = 16;
                this.ctx.strokeStyle = '#fbbf24';
                this.ctx.lineWidth = 2;
                this.ctx.strokeRect(x - metrics.width / 2 - 2, y - height / 2 - 2, metrics.width + 4, height + 4);
            }
        }

        this.updateLayerList();
    }

    drawCurvedText(text, centerX, centerY, curveLevel) {
        if (curveLevel === 0) {
            this.ctx.fillText(text, centerX, centerY);
            return;
        }

        const radius = Math.abs(curveLevel) * 2; // Adjusted multiplier
        const totalAngle = Math.PI; // Spread across 180 degrees
        const angleStep = totalAngle / (text.length - 1);
        const startAngle = curveLevel > 0 ? Math.PI - totalAngle / 2 : totalAngle / 2;

        for (let i = 0; i < text.length; i++) {
            const angle = startAngle + (i * angleStep * (curveLevel > 0 ? -1 : 1));
            const x = centerX + Math.cos(angle) * radius;
            const y = centerY + Math.sin(angle) * radius;

            this.ctx.save();
            this.ctx.translate(x, y);
            this.ctx.rotate(angle + Math.PI / 2);
            this.ctx.fillText(text[i], 0, 0);
            this.ctx.restore();
        }
    }

    addText() {
        const textInput = document.getElementById('textInput');
        const fontFamily = document.getElementById('fontFamily').value;
        const textColor = document.getElementById('textColor').value;

        if (textInput.value.trim()) {
            let x, y;
            if (this.selectedShape !== null) {
                // Position text near the selected shape
                x = this.shapes[this.selectedShape].x;
                y = this.shapes[this.selectedShape].y + (this.textElements.length * 20);
            } else {
                // Position text in center if no shape selected
                x = this.canvas.width / 2;
                y = this.canvas.height / 2 + (this.textElements.length * 20);
            }

            const textElement = {
                text: textInput.value,
                fontFamily: fontFamily,
                color: textColor,
                x: x,
                y: y,
                curve: 0 // Curve level (-100 to 100)
            };

            this.textElements.push(textElement);
            this.selectedElement = textElement;
            this.selectedShape = null;
            textInput.value = '';
            this.drawStamp();
        }
    }

    isPointInShape(x, y, shape) {
        const centerX = shape.x;
        const centerY = shape.y;
        const pixelWidth = shape.width * this.scale;
        const pixelHeight = shape.height * this.scale;

        switch (shape.type) {
            case 'circle':
                const radius = pixelWidth / 2;
                const distance = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2);
                return distance <= radius;

            case 'rectangle':
                return x >= centerX - pixelWidth / 2 && x <= centerX + pixelWidth / 2 &&
                       y >= centerY - pixelHeight / 2 && y <= centerY + pixelHeight / 2;

            case 'oval':
                const normalizedX = (x - centerX) / (pixelWidth / 2);
                const normalizedY = (y - centerY) / (pixelHeight / 2);
                return (normalizedX ** 2 + normalizedY ** 2) <= 1;

            case 'triangle':
                // Simple triangle bounds check - could be more precise
                return x >= centerX - pixelWidth / 2 && x <= centerX + pixelWidth / 2 &&
                       y >= centerY - pixelHeight / 2 && y <= centerY + pixelHeight / 2;

            default:
                return false;
        }
    }

    handleMouseDown(e) {
        const rect = this.canvas.getBoundingClientRect();
        const scaleX = this.canvas.width / rect.width;
        const scaleY = this.canvas.height / rect.height;
        const x = (e.clientX - rect.left) * scaleX;
        const y = (e.clientY - rect.top) * scaleY;

        // If we have a selected shape, prioritize dragging it
        if (this.selectedElement === 'shape' && this.selectedShape !== null) {
            const selectedShape = this.shapes[this.selectedShape];
            if (this.isPointInShape(x, y, selectedShape)) {
                this.isDragging = true;
                this.dragOffset.x = x - selectedShape.x;
                this.dragOffset.y = y - selectedShape.y;
                this.drawStamp();
                return;
            }
        }

        // If we have selected text, prioritize dragging it
        if (this.selectedElement && this.selectedElement !== 'shape') {
            const textElement = this.selectedElement;
            this.ctx.font = `16px ${textElement.fontFamily}`;
            const metrics = this.ctx.measureText(textElement.text);
            if (x >= textElement.x - metrics.width / 2 && x <= textElement.x + metrics.width / 2 &&
                y >= textElement.y - 8 && y <= textElement.y + 8) {
                this.isDragging = true;
                this.dragOffset.x = x - textElement.x;
                this.dragOffset.y = y - textElement.y;
                this.drawStamp();
                return;
            }
        }

        // Check if clicking on shapes (in reverse order so top shapes are selected first)
        for (let i = this.shapes.length - 1; i >= 0; i--) {
            const shape = this.shapes[i];
            if (this.isPointInShape(x, y, shape)) {
                this.selectedShape = i;
                this.selectedElement = 'shape';
                this.isDragging = true;
                this.dragOffset.x = x - shape.x;
                this.dragOffset.y = y - shape.y;
                this.updateUIForSelectedShape();
                this.updateLayerList();
                this.drawStamp();
                return;
            }
        }

        // Check if clicking on text elements
        for (let textElement of this.textElements) {
            // Set the font to match how it's drawn
            this.ctx.font = `16px ${textElement.fontFamily}`;
            const metrics = this.ctx.measureText(textElement.text);
            if (x >= textElement.x - metrics.width / 2 && x <= textElement.x + metrics.width / 2 &&
                y >= textElement.y - 8 && y <= textElement.y + 8) {
                this.selectedElement = textElement;
                this.selectedShape = null;
                this.isDragging = true;
                this.dragOffset.x = x - textElement.x;
                this.dragOffset.y = y - textElement.y;
                this.updateUIForSelectedShape();
                this.updateLayerList();
                this.drawStamp();
                return;
            }
        }

        // Deselect if clicking elsewhere
        this.selectedElement = null;
        this.selectedShape = null;
        this.updateUIForSelectedShape();
        this.updateLayerList();
        this.drawStamp();
    }

    handleMouseMove(e) {
        if (!this.isDragging || !this.selectedElement) return;

        const rect = this.canvas.getBoundingClientRect();
        const scaleX = this.canvas.width / rect.width;
        const scaleY = this.canvas.height / rect.height;
        const x = (e.clientX - rect.left) * scaleX;
        const y = (e.clientY - rect.top) * scaleY;

        if (this.selectedElement === 'shape' && this.selectedShape !== null) {
            this.shapes[this.selectedShape].x = x - this.dragOffset.x;
            this.shapes[this.selectedShape].y = y - this.dragOffset.y;
        } else if (this.selectedElement) {
            this.selectedElement.x = x - this.dragOffset.x;
            this.selectedElement.y = y - this.dragOffset.y;
        }
        this.drawStamp();
    }

    handleMouseUp() {
        this.isDragging = false;
    }

    deleteSelectedElement() {
        if (this.selectedElement === 'shape' && this.selectedShape !== null) {
            this.shapes.splice(this.selectedShape, 1);
            this.selectedShape = null;
            this.selectedElement = null;
            this.updateUIForSelectedShape();
            this.drawStamp();
        } else if (this.selectedElement && this.selectedElement !== 'shape') {
            this.textElements = this.textElements.filter(el => el !== this.selectedElement);
            this.selectedElement = null;
            this.updateUIForSelectedShape();
            this.drawStamp();
        }
    }

    updateLayerList() {
        const layerList = document.getElementById('layerList');
        layerList.innerHTML = '';

        // Add shapes to layer list (in reverse order since last added is on top)
        for (let i = this.shapes.length - 1; i >= 0; i--) {
            const shape = this.shapes[i];
            const layerItem = document.createElement('div');
            layerItem.className = `flex items-center justify-between p-2 rounded cursor-pointer transition-colors ${
                this.selectedShape === i && this.selectedElement === 'shape' ? 'bg-purple-600' : 'bg-gray-700 hover:bg-gray-600'
            }`;
            layerItem.dataset.layerIndex = i;
            layerItem.dataset.layerType = 'shape';

            layerItem.innerHTML = `
                <div class="flex items-center">
                    <i class="fas fa-${shape.type === 'circle' ? 'circle' : shape.type === 'rectangle' ? 'square' : shape.type === 'oval' ? 'ellipsis-h' : 'play'} mr-2 text-purple-400"></i>
                    <span class="text-sm text-gray-200 capitalize">${shape.type} ${i + 1}</span>
                </div>
                <div class="text-xs text-gray-400">${shape.width}×${shape.height}</div>
            `;

            layerItem.addEventListener('click', () => this.selectLayer(i, 'shape'));
            layerList.appendChild(layerItem);
        }

        // Add text elements to layer list (in reverse order since last added is on top)
        for (let i = this.textElements.length - 1; i >= 0; i--) {
            const textElement = this.textElements[i];
            const layerItem = document.createElement('div');
            layerItem.className = `flex items-center justify-between p-2 rounded cursor-pointer transition-colors ${
                this.selectedElement === textElement ? 'bg-yellow-600' : 'bg-gray-700 hover:bg-gray-600'
            }`;
            layerItem.dataset.layerIndex = i;
            layerItem.dataset.layerType = 'text';

            layerItem.innerHTML = `
                <div class="flex items-center">
                    <i class="fas fa-font mr-2 text-yellow-400"></i>
                    <span class="text-sm text-gray-200 truncate max-w-24">${textElement.text}</span>
                </div>
                <div class="text-xs text-gray-400">Text</div>
            `;

            layerItem.addEventListener('click', () => this.selectLayer(i, 'text'));
            layerList.appendChild(layerItem);
        }

        this.updateLayerButtons();
    }

    selectLayer(index, type) {
        if (type === 'shape') {
            this.selectedShape = index;
            this.selectedElement = 'shape';
        } else if (type === 'text') {
            this.selectedElement = this.textElements[index];
            this.selectedShape = null;
        }
        this.updateUIForSelectedShape();
        this.updateLayerList();
        this.drawStamp();
    }

    moveLayerUp() {
        if (this.selectedElement === 'shape' && this.selectedShape !== null && this.selectedShape < this.shapes.length - 1) {
            // Move shape up in the array (which moves it down in visual stacking since we draw in reverse)
            [this.shapes[this.selectedShape], this.shapes[this.selectedShape + 1]] = [this.shapes[this.selectedShape + 1], this.shapes[this.selectedShape]];
            this.selectedShape++;
            this.updateLayerList();
            this.drawStamp();
        } else if (this.selectedElement && this.selectedElement !== 'shape') {
            const index = this.textElements.indexOf(this.selectedElement);
            if (index < this.textElements.length - 1) {
                [this.textElements[index], this.textElements[index + 1]] = [this.textElements[index + 1], this.textElements[index]];
                this.selectedElement = this.textElements[index + 1];
                this.updateLayerList();
                this.drawStamp();
            }
        }
    }

    moveLayerDown() {
        if (this.selectedElement === 'shape' && this.selectedShape !== null && this.selectedShape > 0) {
            // Move shape down in the array (which moves it up in visual stacking)
            [this.shapes[this.selectedShape], this.shapes[this.selectedShape - 1]] = [this.shapes[this.selectedShape - 1], this.shapes[this.selectedShape]];
            this.selectedShape--;
            this.updateLayerList();
            this.drawStamp();
        } else if (this.selectedElement && this.selectedElement !== 'shape') {
            const index = this.textElements.indexOf(this.selectedElement);
            if (index > 0) {
                [this.textElements[index], this.textElements[index - 1]] = [this.textElements[index - 1], this.textElements[index]];
                this.selectedElement = this.textElements[index - 1];
                this.updateLayerList();
                this.drawStamp();
            }
        }
    }

    deleteLayer() {
        if (this.selectedElement === 'shape' && this.selectedShape !== null) {
            this.shapes.splice(this.selectedShape, 1);
            this.selectedShape = null;
            this.selectedElement = null;
        } else if (this.selectedElement && this.selectedElement !== 'shape') {
            this.textElements = this.textElements.filter(el => el !== this.selectedElement);
            this.selectedElement = null;
        }
        this.updateUIForSelectedShape();
        this.updateLayerList();
        this.drawStamp();
    }

    updateLayerButtons() {
        const moveUpBtn = document.getElementById('moveUpBtn');
        const moveDownBtn = document.getElementById('moveDownBtn');
        const deleteLayerBtn = document.getElementById('deleteLayerBtn');

        const hasSelection = this.selectedElement !== null;

        if (hasSelection) {
            if (this.selectedElement === 'shape' && this.selectedShape !== null) {
                // Shape selected
                moveUpBtn.disabled = this.selectedShape >= this.shapes.length - 1;
                moveDownBtn.disabled = this.selectedShape <= 0;
            } else if (this.selectedElement !== 'shape') {
                // Text selected
                const index = this.textElements.indexOf(this.selectedElement);
                moveUpBtn.disabled = index >= this.textElements.length - 1;
                moveDownBtn.disabled = index <= 0;
            }
            deleteLayerBtn.disabled = false;
        } else {
            moveUpBtn.disabled = true;
            moveDownBtn.disabled = true;
            deleteLayerBtn.disabled = true;
        }
    }

    clearCanvas() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    exportStamp(format = 'png') {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        // Create high-resolution export canvas (4x resolution for high quality)
        const scale = 4;
        canvas.width = this.canvas.width * scale;
        canvas.height = this.canvas.height * scale;
        ctx.scale(scale, scale);

        // Draw white background
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw the stamp design
        this.renderToContext(ctx);

        // Download the image
        this.downloadCanvas(canvas, `stamp-design.${format}`, `image/${format}`);
    }

    renderToContext(ctx) {
        // Draw all shapes in reverse order (last added on top)
        for (let i = this.shapes.length - 1; i >= 0; i--) {
            const shape = this.shapes[i];
            const pixelWidth = shape.width * this.scale;
            const pixelHeight = shape.height * this.scale;

            ctx.fillStyle = shape.color;
            ctx.strokeStyle = shape.color;
            ctx.lineWidth = 2;

            switch (shape.type) {
                case 'circle':
                    const radius = pixelWidth / 2;
                    ctx.beginPath();
                    ctx.arc(shape.x, shape.y, radius, 0, 2 * Math.PI);
                    if (shape.isFilled) {
                        ctx.fill();
                    } else {
                        ctx.stroke();
                    }
                    break;

                case 'rectangle':
                    const rectX = shape.x - pixelWidth / 2;
                    const rectY = shape.y - pixelHeight / 2;
                    if (shape.isFilled) {
                        ctx.fillRect(rectX, rectY, pixelWidth, pixelHeight);
                    } else {
                        ctx.strokeRect(rectX, rectY, pixelWidth, pixelHeight);
                    }
                    break;

                case 'oval':
                    ctx.beginPath();
                    ctx.ellipse(shape.x, shape.y, pixelWidth / 2, pixelHeight / 2, 0, 0, 2 * Math.PI);
                    if (shape.isFilled) {
                        ctx.fill();
                    } else {
                        ctx.stroke();
                    }
                    break;

                case 'triangle':
                    ctx.beginPath();
                    ctx.moveTo(shape.x, shape.y - pixelHeight / 2);
                    ctx.lineTo(shape.x - pixelWidth / 2, shape.y + pixelHeight / 2);
                    ctx.lineTo(shape.x + pixelWidth / 2, shape.y + pixelHeight / 2);
                    ctx.closePath();
                    if (shape.isFilled) {
                        ctx.fill();
                    } else {
                        ctx.stroke();
                    }
                    break;
            }
        }

        // Draw text elements in reverse order (last added on top)
        for (let i = this.textElements.length - 1; i >= 0; i--) {
            const textElement = this.textElements[i];
            ctx.fillStyle = textElement.color || '#000000';
            ctx.font = `16px ${textElement.fontFamily}`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(textElement.text, textElement.x, textElement.y);
        }
    }

    downloadCanvas(canvas, filename, mimeType) {
        const link = document.createElement('a');
        link.download = filename;
        link.href = canvas.toDataURL(mimeType);
        link.click();
    }

    clearDesign() {
        this.shapes = [];
        this.textElements = [];
        this.selectedShape = null;
        this.selectedElement = null;
        this.updateUIForSelectedShape();
        this.drawStamp();
    }

}

// Initialize the stamp designer when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new StampDesigner();
});