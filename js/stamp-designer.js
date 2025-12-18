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
        this.clickX = 0;
        this.clickY = 0;
        this.scale = 1; // Scale factor for rendering
        this.clipboard = null; // Store copied element
        this.currentEnhancement = 'original'; // Track current enhancement for CSS filters

        this.init();
        this.bindEvents();
        this.drawStamp();
    }

    init() {
        // Set canvas size to match design area
        this.canvas.width = 400;
        this.canvas.height = 400;
        
        // Force initial canvas background to be visible
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw initial grid
        this.drawGrid();
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
                document.getElementById('widthDisplay').querySelector('h3').textContent = this.shapes[this.selectedShape].width + 'mm';
                this.updateSizeDisplay();
                this.drawStamp();
            }
        });

        document.getElementById('heightSlider').addEventListener('input', (e) => {
            if (this.selectedShape !== null) {
                this.shapes[this.selectedShape].height = parseInt(e.target.value);
                document.getElementById('heightDisplay').querySelector('h3').textContent = this.shapes[this.selectedShape].height + 'mm';
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
                this.updateUIForSelectedShape(); // Update UI to show/hide border controls
                this.drawStamp();
            }
        });

        // Fill pattern selector
        document.getElementById('fillPattern').addEventListener('change', (e) => {
            if (this.selectedShape !== null) {
                this.shapes[this.selectedShape].fillPattern = e.target.value;
                this.updatePatternControls();
                this.drawStamp();
            }
        });

        // Border pattern selector
        document.getElementById('borderPattern').addEventListener('change', (e) => {
            if (this.selectedShape !== null) {
                this.shapes[this.selectedShape].borderPattern = e.target.value;
                this.drawStamp();
            }
        });

        // Pattern size slider
        document.getElementById('patternSize').addEventListener('input', (e) => {
            if (this.selectedShape !== null) {
                this.shapes[this.selectedShape].patternSize = parseInt(e.target.value);
                document.getElementById('patternSizeValue').textContent = e.target.value + 'px';
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

        // Allow adding text by pressing Enter in the text input
        document.getElementById('textInput').addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                this.addText();
            }
        });

        // Curve slider
        document.getElementById('curveSlider').addEventListener('input', (e) => {
            if (this.selectedElement && this.selectedElement.text) {
                this.selectedElement.curve = parseInt(e.target.value);
                document.getElementById('curveDisplay').querySelector('h3').textContent = this.selectedElement.curve + 'px';
                this.drawStamp();
            }
        });

        // Text style buttons
        document.getElementById('boldBtn').addEventListener('click', (e) => {
            e.preventDefault();
            e.target.classList.toggle('bg-[#DBEAFE]');
            e.target.classList.toggle('bg-[#FFFFFF]');
            if (this.selectedElement && this.selectedElement.text) {
                this.selectedElement.bold = e.target.classList.contains('bg-[#DBEAFE]');
                this.drawStamp();
            }
        });

        document.getElementById('italicBtn').addEventListener('click', (e) => {
            e.preventDefault();
            e.target.classList.toggle('bg-[#DBEAFE]');
            e.target.classList.toggle('bg-[#FFFFFF]');
            if (this.selectedElement && this.selectedElement.text) {
                this.selectedElement.italic = e.target.classList.contains('bg-[#DBEAFE]');
                this.drawStamp();
            }
        });

        // Text effect buttons
        document.getElementById('textOutlineBtn').addEventListener('click', (e) => {
            e.preventDefault();
            e.target.classList.toggle('bg-[#DBEAFE]');
            e.target.classList.toggle('bg-[#FFFFFF]');
            if (this.selectedElement && this.selectedElement.text) {
                this.selectedElement.outline = e.target.classList.contains('bg-[#DBEAFE]');
                this.updateOutlineControls();
                this.drawStamp();
            }
        });

        document.getElementById('textShadowBtn').addEventListener('click', (e) => {
            e.preventDefault();
            e.target.classList.toggle('bg-[#DBEAFE]');
            e.target.classList.toggle('bg-[#FFFFFF]');
            if (this.selectedElement && this.selectedElement.text) {
                this.selectedElement.shadow = e.target.classList.contains('bg-[#DBEAFE]');
                this.drawStamp();
            }
        });

        // Outline color picker
        document.getElementById('outlineColor').addEventListener('input', (e) => {
            if (this.selectedElement && this.selectedElement.text) {
                this.selectedElement.outlineColor = e.target.value;
                this.drawStamp();
            }
        });



        // Text rotation slider
        document.getElementById('textRotation').addEventListener('input', (e) => {
            const rotation = parseInt(e.target.value);
            document.getElementById('rotationValue').textContent = rotation + '°';
            if (this.selectedElement && this.selectedElement.text) {
                this.selectedElement.rotation = rotation;
                this.drawStamp();
            }
        });

        // Letter spacing slider
        document.getElementById('letterSpacingSlider').addEventListener('input', (e) => {
            if (this.selectedElement && this.selectedElement.text) {
                this.selectedElement.letterSpacing = parseInt(e.target.value);
                document.getElementById('letterSpacingDisplay').querySelector('h3').textContent = this.selectedElement.letterSpacing + 'px';
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

        // Font size controls
        document.getElementById('fontSize').addEventListener('input', (e) => {
            if (this.selectedElement && this.selectedElement.text) {
                this.selectedElement.fontSize = parseInt(e.target.value);
                document.getElementById('fontSizeDisplay').querySelector('h3').textContent = this.selectedElement.fontSize + 'px';
                this.drawStamp();
            }
        });

        // Border thickness controls
        document.getElementById('borderThickness').addEventListener('input', (e) => {
            if (this.selectedShape !== null) {
                this.shapes[this.selectedShape].borderThickness = parseInt(e.target.value);
                this.drawStamp();
            }
        });

        // Export button - now shows enhancement modal
        document.getElementById('exportBtn').addEventListener('click', () => {
            const transparent = document.getElementById('transparentBackground').checked;
            this.showEnhancementModal(transparent);
        });

        // Clear design button
        document.getElementById('clearDesignBtn').addEventListener('click', () => {
            this.clearDesign();
        });

        // Canvas mouse events for dragging
        this.canvas.addEventListener('mousedown', (e) => this.handleMouseDown(e));
        this.canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        this.canvas.addEventListener('mouseup', (e) => this.handleMouseUp(e));
        this.canvas.addEventListener('mouseleave', (e) => this.handleMouseUp(e));

        // Keyboard events for deletion, copy, and paste
        document.addEventListener('keydown', (e) => {
            // Don't handle deletion if user is typing in an input field
            if (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'TEXTAREA') {
                return;
            }
            if (e.key === 'Delete' || e.key === 'Backspace') {
                this.deleteSelectedElement();
            } else if ((e.ctrlKey || e.metaKey) && e.key === 'c') {
                // Copy (Ctrl+C or Cmd+C)
                e.preventDefault();
                this.copySelectedElement();
            } else if ((e.ctrlKey || e.metaKey) && e.key === 'v') {
                // Paste (Ctrl+V or Cmd+V)
                e.preventDefault();
                this.pasteElement();
            }
        });
    }

    updateOutlineControls() {
        const outlineSection = document.getElementById('outlineColorSection');
        const textOutlineBtn = document.getElementById('textOutlineBtn');
        if (this.selectedElement && this.selectedElement.text && this.selectedElement.outline) {
            outlineSection.style.display = 'block';
        } else {
            outlineSection.style.display = 'none';
        }
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
            borderThickness: 2,
            fillPattern: 'solid', // Default to solid fill
            patternSize: 20, // Default pattern size
            borderPattern: 'solid', // Default to solid border
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
            document.getElementById('widthDisplay').querySelector('h3').textContent = shape.width + 'mm';
            document.getElementById('heightDisplay').querySelector('h3').textContent = shape.height + 'mm';
            document.getElementById('stampColor').value = shape.color;
            document.getElementById('fillToggle').checked = shape.isFilled;
            document.getElementById('borderThickness').value = shape.borderThickness || 2;
            
            // Enable shape controls
            document.getElementById('widthSlider').disabled = false;
            document.getElementById('heightSlider').disabled = false;
            document.getElementById('stampColor').disabled = false;
            document.getElementById('fillToggle').disabled = false;
            document.getElementById('fillPattern').disabled = false;
            
            // Border thickness controls - only enabled for hollow shapes
            if (shape.isFilled) {
                document.getElementById('borderThickness').disabled = true;
                document.getElementById('borderPatternSection').style.display = 'none';
                document.getElementById('borderPattern').disabled = true;
            } else {
                document.getElementById('borderThickness').disabled = false;
                document.getElementById('borderPatternSection').style.display = 'block';
                document.getElementById('borderPattern').disabled = false;
                document.getElementById('borderPattern').value = shape.borderPattern || 'solid';
            }

            // Update pattern controls
            document.getElementById('fillPattern').value = shape.fillPattern || 'solid';
            document.getElementById('patternSize').value = shape.patternSize || 20;
            document.getElementById('patternSizeValue').textContent = (shape.patternSize || 20) + 'px';
            this.updatePatternControls();
            
            // Disable text controls
            document.getElementById('curveSlider').disabled = true;
        } else if (this.selectedElement && this.selectedElement.text) {
            // Text element selected
            document.getElementById('curveSlider').value = this.selectedElement.curve || 0;
            document.getElementById('curveDisplay').querySelector('h3').textContent = (this.selectedElement.curve || 0) + 'px';
            document.getElementById('letterSpacingSlider').value = this.selectedElement.letterSpacing || 0;
            document.getElementById('letterSpacingDisplay').querySelector('h3').textContent = (this.selectedElement.letterSpacing || 0) + 'px';
            document.getElementById('textColor').value = this.selectedElement.color || '#000000';
            document.getElementById('fontSize').value = this.selectedElement.fontSize || 16;
            document.getElementById('fontSizeDisplay').querySelector('h3').textContent = (this.selectedElement.fontSize || 16) + 'px';
            document.getElementById('textRotation').value = this.selectedElement.rotation || 0;
            document.getElementById('rotationValue').textContent = (this.selectedElement.rotation || 0) + '°';
            document.getElementById('outlineColor').value = this.selectedElement.outlineColor || '#ffffff';

            // Update text effect buttons
            const textOutlineBtn = document.getElementById('textOutlineBtn');
            const textShadowBtn = document.getElementById('textShadowBtn');
            if (this.selectedElement.outline) {
                textOutlineBtn.classList.add('bg-[#DBEAFE]');
                textOutlineBtn.classList.remove('bg-[#FFFFFF]');
            } else {
                textOutlineBtn.classList.remove('bg-[#DBEAFE]');
                textOutlineBtn.classList.add('bg-[#FFFFFF]');
            }
            if (this.selectedElement.shadow) {
                textShadowBtn.classList.add('bg-[#DBEAFE]');
                textShadowBtn.classList.remove('bg-[#FFFFFF]');
            } else {
                textShadowBtn.classList.remove('bg-[#DBEAFE]');
                textShadowBtn.classList.add('bg-[#FFFFFF]');
            }

            // Update bold/italic buttons
            const boldBtn = document.getElementById('boldBtn');
            const italicBtn = document.getElementById('italicBtn');
            if (this.selectedElement.bold) {
                boldBtn.classList.add('bg-[#DBEAFE]');
                boldBtn.classList.remove('bg-[#FFFFFF]');
            } else {
                boldBtn.classList.remove('bg-[#DBEAFE]');
                boldBtn.classList.add('bg-[#FFFFFF]');
            }
            if (this.selectedElement.italic) {
                italicBtn.classList.add('bg-[#DBEAFE]');
                italicBtn.classList.remove('bg-[#FFFFFF]');
            } else {
                italicBtn.classList.remove('bg-[#DBEAFE]');
                italicBtn.classList.add('bg-[#FFFFFF]');
            }

            // Update alignment buttons
            document.querySelectorAll('.align-btn').forEach(btn => {
                btn.classList.remove('bg-[#FEFCE8]', 'border-[#D08700]');
                btn.classList.add('bg-[#F9FAFB]', 'border-[#E5E7EB]');
            });
            const alignBtn = document.querySelector(`.align-btn[data-align="${this.selectedElement.alignment || 'center'}"]`);
            if (alignBtn) {
                alignBtn.classList.remove('bg-[#F9FAFB]', 'border-[#E5E7EB]');
                alignBtn.classList.add('bg-[#FEFCE8]', 'border-[#D08700]');
            }

            // Show text controls
            document.getElementById('curveControl').style.display = 'block';
            document.getElementById('letterSpacingControl').style.display = 'block';
            document.getElementById('rotationControl').style.display = 'block';
            this.updateOutlineControls();
            
            // Enable text controls
            document.getElementById('curveSlider').disabled = false;
            document.getElementById('letterSpacingSlider').disabled = false;
            document.getElementById('textRotation').disabled = false;
            document.getElementById('textColor').disabled = false;
            document.getElementById('fontSize').disabled = false;
            
            // Disable shape controls
            document.getElementById('widthSlider').disabled = true;
            document.getElementById('heightSlider').disabled = true;
            document.getElementById('stampColor').disabled = true;
            document.getElementById('fillToggle').disabled = true;
            document.getElementById('borderThickness').disabled = true;
        } else {
            // Disable all controls when nothing is selected
            document.getElementById('widthSlider').disabled = true;
            document.getElementById('heightSlider').disabled = true;
            document.getElementById('stampColor').disabled = true;
            document.getElementById('fillToggle').disabled = true;
            document.getElementById('fillPattern').disabled = true;
            document.getElementById('patternSize').disabled = true;
            document.getElementById('borderThickness').disabled = true;
            document.getElementById('borderPattern').disabled = true;
            document.getElementById('borderPatternSection').style.display = 'none';
            
            // Hide text controls
            document.getElementById('curveControl').style.display = 'none';
            document.getElementById('letterSpacingControl').style.display = 'none';
            document.getElementById('rotationControl').style.display = 'none';
            document.getElementById('curveSlider').disabled = true;
            document.getElementById('letterSpacingSlider').disabled = true;
            document.getElementById('textRotation').disabled = true;
            document.getElementById('textColor').disabled = true;
            document.getElementById('fontSize').disabled = true;
        }
        this.updateSizeDisplay();
    }

    updatePatternControls() {
        const patternSelect = document.getElementById('fillPattern');
        const patternControls = document.getElementById('patternControls');
        
        if (patternSelect.value === 'solid') {
            patternControls.style.display = 'none';
            document.getElementById('patternSize').disabled = true;
        } else {
            patternControls.style.display = 'block';
            document.getElementById('patternSize').disabled = false;
        }
    }

    createPattern(patternType, color, size) {
        const patternCanvas = document.createElement('canvas');
        const patternCtx = patternCanvas.getContext('2d');
        patternCanvas.width = size * 2;
        patternCanvas.height = size * 2;

        patternCtx.fillStyle = color;
        patternCtx.strokeStyle = color;

        switch (patternType) {
            case 'dots':
                patternCtx.beginPath();
                patternCtx.arc(size / 2, size / 2, size / 4, 0, 2 * Math.PI);
                patternCtx.fill();
                break;

            case 'stripes':
                patternCtx.lineWidth = size / 4;
                patternCtx.beginPath();
                patternCtx.moveTo(0, 0);
                patternCtx.lineTo(size * 2, size * 2);
                patternCtx.stroke();
                patternCtx.beginPath();
                patternCtx.moveTo(size * 2, 0);
                patternCtx.lineTo(0, size * 2);
                patternCtx.stroke();
                break;

            case 'checks':
                // Draw checkerboard pattern
                patternCtx.fillRect(0, 0, size, size);
                patternCtx.fillRect(size, size, size, size);
                break;
        }

        return this.ctx.createPattern(patternCanvas, 'repeat');
    }

    createPatternForContext(ctx, patternType, color, size) {
        const patternCanvas = document.createElement('canvas');
        const patternCtx = patternCanvas.getContext('2d');
        patternCanvas.width = size * 2;
        patternCanvas.height = size * 2;

        patternCtx.fillStyle = color;
        patternCtx.strokeStyle = color;

        switch (patternType) {
            case 'dots':
                patternCtx.beginPath();
                patternCtx.arc(size / 2, size / 2, size / 4, 0, 2 * Math.PI);
                patternCtx.fill();
                break;

            case 'stripes':
                patternCtx.lineWidth = size / 4;
                patternCtx.beginPath();
                patternCtx.moveTo(0, 0);
                patternCtx.lineTo(size * 2, size * 2);
                patternCtx.stroke();
                patternCtx.beginPath();
                patternCtx.moveTo(size * 2, 0);
                patternCtx.lineTo(0, size * 2);
                patternCtx.stroke();
                break;

            case 'checks':
                // Draw checkerboard pattern
                patternCtx.fillRect(0, 0, size, size);
                patternCtx.fillRect(size, size, size, size);
                break;
        }

        return ctx.createPattern(patternCanvas, 'repeat');
    }

    setBorderPattern(ctx, patternType, thickness) {
        switch (patternType) {
            case 'solid':
                ctx.setLineDash([]);
                break;
            case 'dashed':
                ctx.setLineDash([thickness * 3, thickness * 2]);
                break;
            case 'dotted':
                ctx.setLineDash([thickness, thickness * 2]);
                break;
            case 'dashdot':
                ctx.setLineDash([thickness * 3, thickness, thickness, thickness]);
                break;
            default:
                ctx.setLineDash([]);
        }
    }

    drawStamp() {
        this.clearCanvas();
        this.drawGrid();

        // Draw all shapes in reverse order (last added on top)
        for (let i = this.shapes.length - 1; i >= 0; i--) {
            const shape = this.shapes[i];
            const pixelWidth = shape.width * this.scale;
            const pixelHeight = shape.height * this.scale;

            // Set fill style - use pattern if not solid
            if (shape.fillPattern && shape.fillPattern !== 'solid') {
                this.ctx.fillStyle = this.createPattern(shape.fillPattern, shape.color, shape.patternSize || 20);
            } else {
                this.ctx.fillStyle = shape.color;
            }
            this.ctx.strokeStyle = shape.color;
            this.ctx.lineWidth = shape.borderThickness || 2;
            this.setBorderPattern(this.ctx, shape.borderPattern || 'solid', shape.borderThickness || 2);

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

            // Build font string with bold and italic
            let fontWeight = '';
            if (textElement.bold) fontWeight += 'bold ';
            if (textElement.italic) fontWeight += 'italic ';
            this.ctx.font = `${fontWeight}${textElement.fontSize || 16}px ${textElement.fontFamily}`;

            // Set text alignment
            this.ctx.textAlign = textElement.alignment || 'center';
            this.ctx.textBaseline = 'middle';

            const x = textElement.x || this.canvas.width / 2;
            const y = textElement.y || (this.canvas.height / 2 + (i * 30));

            // Save context for rotation
            this.ctx.save();

            // Apply rotation if needed
            if (textElement.rotation && textElement.rotation !== 0) {
                this.ctx.translate(x, y);
                this.ctx.rotate((textElement.rotation * Math.PI) / 180);
                this.ctx.translate(-x, -y);
            }

            // Draw text with effects
            if (textElement.curve && textElement.curve !== 0) {
                // Curved text with effects
                this.drawCurvedTextWithEffects(textElement, x, y);
            } else {
                // Regular text with effects
                this.drawTextWithEffects(textElement, x, y);
            }

            this.ctx.restore();

            // Draw selection border if selected
            if (this.selectedElement === textElement) {
                const metrics = this.ctx.measureText(textElement.text);
                const height = textElement.fontSize || 16;
                this.ctx.strokeStyle = '#fbbf24';
                this.ctx.lineWidth = 2;
                this.ctx.strokeRect(x - metrics.width / 2 - 2, y - height / 2 - 2, metrics.width + 4, height + 4);
            }
        }

        // Apply CSS filters for enhancement effects
        this.applyEnhancementFilters();

        this.updateLayerList();
    }

    applyEnhancementFilters() {
        // Remove existing enhancement classes
        this.canvas.classList.remove('canvas-vintage', 'canvas-fadeout');
        
        // Apply current enhancement filter
        if (this.currentEnhancement !== 'original') {
            this.canvas.classList.add(`canvas-${this.currentEnhancement}`);
        }
    }

    drawCurvedText(text, centerX, centerY, curveLevel, letterSpacing = 0) {
        if (curveLevel === 0) {
            this.ctx.fillText(text, centerX, centerY);
            return;
        }

        const radius = Math.abs(curveLevel) * 2; // Adjusted multiplier
        const totalAngle = 2 * Math.PI; // Spread across 360 degrees
        const baseAngleStep = totalAngle / text.length;
        const angleStep = baseAngleStep + (letterSpacing * Math.PI / 180); // Convert letter spacing to radians
        const startAngle = curveLevel > 0 ? Math.PI : 0; // Start from bottom for positive curve, top for negative

        for (let i = 0; i < text.length; i++) {
            const angle = startAngle + (i * angleStep * (curveLevel > 0 ? 1 : -1));
            const x = centerX + Math.cos(angle) * radius;
            const y = centerY + Math.sin(angle) * radius;

            this.ctx.save();
            this.ctx.translate(x, y);
            this.ctx.rotate(angle + Math.PI / 2);
            this.ctx.fillText(text[i], 0, 0);
            this.ctx.restore();
        }
    }

    drawCurvedTextToContext(ctx, text, centerX, centerY, curveLevel, letterSpacing = 0) {
        if (curveLevel === 0) {
            ctx.fillText(text, centerX, centerY);
            return;
        }

        const radius = Math.abs(curveLevel) * 2; // Adjusted multiplier
        const totalAngle = 2 * Math.PI; // Spread across 360 degrees
        const baseAngleStep = totalAngle / text.length;
        const angleStep = baseAngleStep + (letterSpacing * Math.PI / 180); // Convert letter spacing to radians
        const startAngle = curveLevel > 0 ? Math.PI : 0; // Start from bottom for positive curve, top for negative

        for (let i = 0; i < text.length; i++) {
            const angle = startAngle + (i * angleStep * (curveLevel > 0 ? 1 : -1));
            const x = centerX + Math.cos(angle) * radius;
            const y = centerY + Math.sin(angle) * radius;

            ctx.save();
            ctx.translate(x, y);
            ctx.rotate(angle + Math.PI / 2);
            ctx.fillText(text[i], 0, 0);
            ctx.restore();
        }
    }

    drawTextWithEffects(textElement, x, y) {
        const text = textElement.text;
        const color = textElement.color || '#000000';

        // Draw shadow first (if enabled)
        if (textElement.shadow) {
            this.ctx.save();
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
            this.ctx.fillText(text, x + 2, y + 2);
            this.ctx.restore();
        }

        // Draw outline (if enabled)
        if (textElement.outline) {
            this.ctx.save();
            this.ctx.strokeStyle = textElement.outlineColor || '#ffffff';
            this.ctx.lineWidth = 2;
            this.ctx.strokeText(text, x, y);
            this.ctx.restore();
        }

        // Draw main text
        this.ctx.fillStyle = color;
        this.ctx.fillText(text, x, y);
    }

    drawCurvedTextWithEffects(textElement, centerX, centerY) {
        if (textElement.curve === 0) {
            this.drawTextWithEffects(textElement, centerX, centerY);
            return;
        }

        const text = textElement.text;
        const color = textElement.color || '#000000';
        const radius = Math.abs(textElement.curve) * 2;
        const totalAngle = 2 * Math.PI;
        const baseAngleStep = totalAngle / text.length;
        const angleStep = baseAngleStep + ((textElement.letterSpacing || 0) * Math.PI / 180);
        const startAngle = textElement.curve > 0 ? Math.PI : 0;

        // Draw shadow for curved text (if enabled)
        if (textElement.shadow) {
            this.ctx.save();
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
            for (let i = 0; i < text.length; i++) {
                const angle = startAngle + (i * angleStep * (textElement.curve > 0 ? 1 : -1));
                const x = centerX + Math.cos(angle) * radius + 2;
                const y = centerY + Math.sin(angle) * radius + 2;

                this.ctx.save();
                this.ctx.translate(x, y);
                this.ctx.rotate(angle + Math.PI / 2);
                this.ctx.fillText(text[i], 0, 0);
                this.ctx.restore();
            }
            this.ctx.restore();
        }

        // Draw outline for curved text (if enabled)
        if (textElement.outline) {
            this.ctx.save();
            this.ctx.strokeStyle = textElement.outlineColor || '#ffffff';
            this.ctx.lineWidth = 2;
            for (let i = 0; i < text.length; i++) {
                const angle = startAngle + (i * angleStep * (textElement.curve > 0 ? 1 : -1));
                const x = centerX + Math.cos(angle) * radius;
                const y = centerY + Math.sin(angle) * radius;

                this.ctx.save();
                this.ctx.translate(x, y);
                this.ctx.rotate(angle + Math.PI / 2);
                this.ctx.strokeText(text[i], 0, 0);
                this.ctx.restore();
            }
            this.ctx.restore();
        }

        // Draw main curved text
        this.ctx.fillStyle = color;
        for (let i = 0; i < text.length; i++) {
            const angle = startAngle + (i * angleStep * (textElement.curve > 0 ? 1 : -1));
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
        const fontSize = parseInt(document.getElementById('fontSize').value);
        const boldBtn = document.getElementById('boldBtn');
        const italicBtn = document.getElementById('italicBtn');
        const textOutline = document.getElementById('textOutlineBtn').classList.contains('bg-[#DBEAFE]');
        const textShadow = document.getElementById('textShadowBtn').classList.contains('bg-[#DBEAFE]');
        const outlineColor = document.getElementById('outlineColor').value;
        const textRotation = parseInt(document.getElementById('textRotation').value) || 0;

        if (textInput.value.trim()) {
            let x, y;
            if (this.selectedShape !== null) {
                // Position text near the selected shape
                x = this.shapes[this.selectedShape].x;
                y = this.shapes[this.selectedShape].y + (this.textElements.length * 20);
            } else {
                // Position text in the top-left corner if no shape selected
                x = 100;
                y = 100 + (this.textElements.length * 20);
            }

            const textElement = {
                text: textInput.value,
                fontFamily: fontFamily,
                color: textColor,
                fontSize: fontSize,
                bold: boldBtn.classList.contains('bg-[#DBEAFE]'),
                italic: italicBtn.classList.contains('bg-[#DBEAFE]'),
                outline: textOutline,
                shadow: textShadow,
                outlineColor: outlineColor,
                rotation: textRotation,
                alignment: 'center',
                x: x,
                y: y,
                curve: 0, // Curve level (-100 to 100)
                letterSpacing: 0 // Letter spacing (-50 to 50)
            };

            this.textElements.push(textElement);
            this.selectedElement = textElement;
            this.selectedShape = null;
            textInput.value = '';
            this.updateUIForSelectedShape();
            this.updateLayerList();
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
            this.ctx.font = `${textElement.fontSize || 16}px ${textElement.fontFamily}`;
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
                this.updateUIForSelectedShape();
                this.updateLayerList();
                this.drawStamp();
                return;
            }
        }

        // Check if clicking on text elements (in reverse order so top text is selected first)
        for (let i = this.textElements.length - 1; i >= 0; i--) {
            const textElement = this.textElements[i];
            // Set the font to match how it's drawn
            this.ctx.font = `${textElement.fontSize || 16}px ${textElement.fontFamily}`;
            const metrics = this.ctx.measureText(textElement.text);
            if (x >= textElement.x - metrics.width / 2 && x <= textElement.x + metrics.width / 2 &&
                y >= textElement.y - 8 && y <= textElement.y + 8) {
                this.selectedElement = textElement;
                this.selectedShape = null;
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

    copySelectedElement() {
        if (this.selectedElement === 'shape' && this.selectedShape !== null) {
            // Copy shape
            this.clipboard = {
                type: 'shape',
                data: JSON.parse(JSON.stringify(this.shapes[this.selectedShape]))
            };
        } else if (this.selectedElement && this.selectedElement !== 'shape') {
            // Copy text element
            this.clipboard = {
                type: 'text',
                data: JSON.parse(JSON.stringify(this.selectedElement))
            };
        }
    }

    pasteElement() {
        if (!this.clipboard) return;

        if (this.clipboard.type === 'shape') {
            // Paste shape with slight offset
            const newShape = JSON.parse(JSON.stringify(this.clipboard.data));
            newShape.x += 20; // Offset by 20 pixels
            newShape.y += 20;
            this.shapes.push(newShape);
            this.selectedShape = this.shapes.length - 1;
            this.selectedElement = 'shape';
        } else if (this.clipboard.type === 'text') {
            // Paste text element with slight offset
            const newTextElement = JSON.parse(JSON.stringify(this.clipboard.data));
            newTextElement.x += 20; // Offset by 20 pixels
            newTextElement.y += 20;
            this.textElements.push(newTextElement);
            this.selectedElement = newTextElement;
            this.selectedShape = null;
        }

        this.updateUIForSelectedShape();
        this.updateLayerList();
        this.drawStamp();
    }

    updateLayerList() {
        const layerList = document.getElementById('layerList');

        // Check if there are any layers
        const hasLayers = this.shapes.length > 0 || this.textElements.length > 0;

        if (!hasLayers) {
            // Show "No layers added yet" message
            layerList.innerHTML = '<h3 class="text-[14px] text-[#6A7282]">No layers added yet</h3>';
            layerList.className = 'bg-[#F9FAFB] border-[1.5px] rounded-[10px] border-[#E5E7EB] flex justify-center items-center p-5';
            return;
        }

        // There are layers, show them in a column
        layerList.innerHTML = '';
        layerList.className = 'bg-[#F9FAFB] border-[1.5px] rounded-[10px] border-[#E5E7EB] flex flex-col p-2 space-y-1 max-h-48 overflow-y-auto';

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
            this.updateUIForSelectedShape();
            this.drawStamp();
        } else if (this.selectedElement && this.selectedElement !== 'shape') {
            const index = this.textElements.indexOf(this.selectedElement);
            if (index < this.textElements.length - 1) {
                [this.textElements[index], this.textElements[index + 1]] = [this.textElements[index + 1], this.textElements[index]];
                this.selectedElement = this.textElements[index + 1];
                this.updateLayerList();
                this.updateUIForSelectedShape();
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
            this.updateUIForSelectedShape();
            this.drawStamp();
        } else if (this.selectedElement && this.selectedElement !== 'shape') {
            const index = this.textElements.indexOf(this.selectedElement);
            if (index > 0) {
                [this.textElements[index], this.textElements[index - 1]] = [this.textElements[index - 1], this.textElements[index]];
                this.selectedElement = this.textElements[index - 1];
                this.updateLayerList();
                this.updateUIForSelectedShape();
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
        if (!moveUpBtn) return; // Skip if button doesn't exist

        const hasSelection = this.selectedElement !== null;

        if (hasSelection) {
            if (this.selectedElement === 'shape' && this.selectedShape !== null) {
                // Shape selected
                moveUpBtn.disabled = this.selectedShape >= this.shapes.length - 1;
            } else if (this.selectedElement !== 'shape') {
                // Text selected
                const index = this.textElements.indexOf(this.selectedElement);
                moveUpBtn.disabled = index >= this.textElements.length - 1;
            }
        } else {
            moveUpBtn.disabled = true;
        }
    }

    clearCanvas() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        // Fill with white background so canvas is always visible
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    drawGrid() {
        this.ctx.save(); // Save current context state
        
        const gridSize = 20; // Size of each grid cell
        this.ctx.strokeStyle = '#e5e7eb'; // Light gray color for grid lines
        this.ctx.lineWidth = 0.5;

        // Draw vertical lines
        for (let x = 0; x <= this.canvas.width; x += gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, this.canvas.height);
            this.ctx.stroke();
        }

        // Draw horizontal lines
        for (let y = 0; y <= this.canvas.height; y += gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(this.canvas.width, y);
            this.ctx.stroke();
        }
        
        this.ctx.restore(); // Restore context state
    }

    drawTextWithEffectsToContext(ctx, textElement, x, y) {
        const text = textElement.text;
        const color = textElement.color || '#000000';

        // Draw shadow first (if enabled)
        if (textElement.shadow) {
            ctx.save();
            ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
            ctx.fillText(text, x + 2, y + 2);
            ctx.restore();
        }

        // Draw outline (if enabled)
        if (textElement.outline) {
            ctx.save();
            ctx.strokeStyle = textElement.outlineColor || '#ffffff';
            ctx.lineWidth = 2;
            ctx.strokeText(text, x, y);
            ctx.restore();
        }

        // Draw main text
        ctx.fillStyle = color;
        ctx.fillText(text, x, y);
    }

    drawCurvedTextWithEffectsToContext(ctx, textElement, centerX, centerY) {
        if (textElement.curve === 0) {
            this.drawTextWithEffectsToContext(ctx, textElement, centerX, centerY);
            return;
        }

        const text = textElement.text;
        const color = textElement.color || '#000000';
        const radius = Math.abs(textElement.curve) * 2;
        const totalAngle = 2 * Math.PI;
        const baseAngleStep = totalAngle / text.length;
        const angleStep = baseAngleStep + ((textElement.letterSpacing || 0) * Math.PI / 180);
        const startAngle = textElement.curve > 0 ? Math.PI : 0;

        // Draw shadow for curved text (if enabled)
        if (textElement.shadow) {
            ctx.save();
            ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
            for (let i = 0; i < text.length; i++) {
                const angle = startAngle + (i * angleStep * (textElement.curve > 0 ? 1 : -1));
                const x = centerX + Math.cos(angle) * radius + 2;
                const y = centerY + Math.sin(angle) * radius + 2;

                ctx.save();
                ctx.translate(x, y);
                ctx.rotate(angle + Math.PI / 2);
                ctx.fillText(text[i], 0, 0);
                ctx.restore();
            }
            ctx.restore();
        }

        // Draw outline for curved text (if enabled)
        if (textElement.outline) {
            ctx.save();
            ctx.strokeStyle = textElement.outlineColor || '#ffffff';
            ctx.lineWidth = 2;
            for (let i = 0; i < text.length; i++) {
                const angle = startAngle + (i * angleStep * (textElement.curve > 0 ? 1 : -1));
                const x = centerX + Math.cos(angle) * radius;
                const y = centerY + Math.sin(angle) * radius;

                ctx.save();
                ctx.translate(x, y);
                ctx.rotate(angle + Math.PI / 2);
                ctx.strokeText(text[i], 0, 0);
                ctx.restore();
            }
            ctx.restore();
        }

        // Draw main curved text
        ctx.fillStyle = color;
        for (let i = 0; i < text.length; i++) {
            const angle = startAngle + (i * angleStep * (textElement.curve > 0 ? 1 : -1));
            const x = centerX + Math.cos(angle) * radius;
            const y = centerY + Math.sin(angle) * radius;

            ctx.save();
            ctx.translate(x, y);
            ctx.rotate(angle + Math.PI / 2);
            ctx.fillText(text[i], 0, 0);
            ctx.restore();
        }
    }

    showEnhancementModal(transparent) {
        const modal = document.getElementById('enhancementModal');
        const grid = document.getElementById('enhancementGrid');
        
        // Clear previous content
        grid.innerHTML = '';
        
        // Define enhancement options
        const enhancements = [
            { id: 'original', name: 'Original', description: 'Standard stamp design' },
            { id: 'vintage', name: 'Vintage', description: 'Aged stamp with faded ink' },
            { id: 'fadeout', name: 'Fadeout', description: 'Stamp with faded areas from repeated use' }
        ];
        
        enhancements.forEach(enhancement => {
            const card = document.createElement('div');
            card.className = 'enhancement-card bg-slate-700 rounded-lg p-4 cursor-pointer border-2 border-transparent hover:border-blue-400 transition duration-300';
            card.innerHTML = `
                <div class="text-center mb-2">
                    <canvas class="enhancement-preview border border-slate-600 rounded mx-auto" width="120" height="120"></canvas>
                </div>
                <h3 class="text-lg font-semibold text-gray-200 mb-1">${enhancement.name}</h3>
                <p class="text-sm text-gray-400">${enhancement.description}</p>
            `;
            
            card.addEventListener('click', () => {
                // Remove selection from all cards
                document.querySelectorAll('.enhancement-card').forEach(c => {
                    c.classList.remove('border-blue-400');
                    c.classList.add('border-transparent');
                });
                
                // Select this card
                card.classList.remove('border-transparent');
                card.classList.add('border-blue-400');
                
                // Store selection in modal
                modal.dataset.selectedEnhancement = enhancement.id;
                document.getElementById('confirmExport').disabled = false;
            });
            
            grid.appendChild(card);
            
            // Generate preview
            const previewCanvas = card.querySelector('.enhancement-preview');
            this.generateEnhancementPreview(previewCanvas, enhancement.id, transparent);
        });
        
        // Store selected enhancement in modal data
        modal.dataset.selectedEnhancement = '';
        
        // Disable confirm button initially
        document.getElementById('confirmExport').disabled = true;
        
        // Modal event listeners - use event delegation
        const handleModalClick = (e) => {
            const target = e.target;
            
            if (target.id === 'closeModal' || target.id === 'cancelExport') {
                modal.classList.add('hidden');
                modal.removeEventListener('click', handleModalClick);
                document.removeEventListener('keydown', escapeHandler);
            } else if (target.id === 'confirmExport') {
                const selected = modal.dataset.selectedEnhancement;
                if (selected) {
                    this.exportStamp('png', transparent, selected);
                    modal.classList.add('hidden');
                    modal.removeEventListener('click', handleModalClick);
                    document.removeEventListener('keydown', escapeHandler);
                }
            }
        };
        
        modal.addEventListener('click', handleModalClick);
        
        // Show modal
        modal.classList.remove('hidden');
        
        // Add escape key listener
        const escapeHandler = (e) => {
            if (e.key === 'Escape') {
                modal.classList.add('hidden');
                document.removeEventListener('keydown', escapeHandler);
            }
        };
        document.addEventListener('keydown', escapeHandler);
        
        // Add click outside to close
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.add('hidden');
            }
        });
    }
    
    generateEnhancementPreview(canvas, enhancement, transparent) {
        const ctx = canvas.getContext('2d');
        const scale = canvas.width / this.canvas.width;
        
        ctx.scale(scale, scale);
        
        // Clear canvas
        ctx.clearRect(0, 0, canvas.width / scale, canvas.height / scale);
        
        // Fill background
        if (!transparent) {
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, canvas.width / scale, canvas.height / scale);
        }
        
        // Apply enhancement
        this.renderWithEnhancement(ctx, enhancement);
        
        // Apply CSS filters for vintage enhancement
        if (enhancement === 'vintage') {
            canvas.classList.add('canvas-vintage');
        } else {
            canvas.classList.remove('canvas-vintage');
        }
    }
    
    renderWithEnhancement(ctx, enhancement) {
        switch (enhancement) {
            case 'original':
                this.renderToContext(ctx);
                break;
            case 'vintage':
                this.renderVintage(ctx);
                break;
            case 'fadeout':
                this.renderFadeout(ctx);
                break;
        }
    }
    
    renderVintage(ctx) {
        // Create highly realistic vintage stamp effect
        ctx.save();

        // Render the stamp design normally first
        this.renderToContext(ctx);

        // Apply vintage effects only to the stamp areas using mask detection
        this.applyVintageEffectsToStamp(ctx);

        ctx.restore();
    }

    applyVintageEffectsToStamp(ctx) {
        // Create a mask of the stamp design
        const maskCanvas = document.createElement('canvas');
        maskCanvas.width = this.canvas.width;
        maskCanvas.height = this.canvas.height;
        const maskCtx = maskCanvas.getContext('2d');

        // Render stamp in solid color for mask
        maskCtx.fillStyle = '#000000';
        this.renderToContext(maskCtx);

        // Get mask data to check stamp areas
        const maskImageData = maskCtx.getImageData(0, 0, this.canvas.width, this.canvas.height);
        const maskData = maskImageData.data;

        // Apply stronger ink bleeding effect only on stamp edges
        ctx.shadowColor = 'rgba(0,0,0,0.2)';
        ctx.shadowBlur = 4;
        this.renderToContext(ctx);
        ctx.shadowBlur = 0;

        // Apply stronger ink fading effects only on stamp areas
        const inkGradient = ctx.createRadialGradient(
            this.canvas.width * 0.3, this.canvas.height * 0.3, 0,
            this.canvas.width / 2, this.canvas.height / 2, Math.max(this.canvas.width, this.canvas.height) * 0.8
        );
        inkGradient.addColorStop(0, 'rgba(255,255,255,0.12)');
        inkGradient.addColorStop(0.4, 'rgba(255,255,255,0.35)');
        inkGradient.addColorStop(0.7, 'rgba(255,255,255,0.55)');
        inkGradient.addColorStop(1, 'rgba(255,255,255,0.8)');

        ctx.globalCompositeOperation = 'screen';
        ctx.fillStyle = inkGradient;

        // Only apply fading where stamp exists by using the mask
        for (let y = 0; y < this.canvas.height; y++) {
            for (let x = 0; x < this.canvas.width; x++) {
                const pixelIndex = (y * this.canvas.width + x) * 4;
                if (maskData[pixelIndex + 3] > 0) { // If stamp pixel exists
                    const alpha = maskData[pixelIndex + 3] / 255;
                    ctx.globalAlpha = alpha * 0.8; // Stronger fade based on stamp opacity
                    ctx.fillRect(x, y, 1, 1);
                }
            }
        }

        ctx.globalCompositeOperation = 'source-over';
        ctx.globalAlpha = 1;

        // Add realistic edge wear - remove one side of the stamp
        ctx.globalCompositeOperation = 'destination-out';

        // Choose which side to damage (randomly select one edge)
        const sides = ['top', 'right', 'bottom', 'left'];
        const damagedSide = sides[Math.floor(Math.random() * sides.length)];

        // Create a larger missing area on the chosen side
        ctx.fillStyle = 'rgba(0,0,0,1)'; // Complete removal

        if (damagedSide === 'top') {
            // Remove top edge - irregular curved shape
            ctx.beginPath();
            ctx.moveTo(0, 0);
            for (let x = 0; x <= this.canvas.width; x += 5) {
                const y = Math.sin(x * 0.1) * 8 + Math.random() * 15 + 5;
                ctx.lineTo(x, y);
            }
            ctx.lineTo(this.canvas.width, 0);
            ctx.closePath();
            ctx.fill();
        } else if (damagedSide === 'bottom') {
            // Remove bottom edge - irregular curved shape
            ctx.beginPath();
            ctx.moveTo(0, this.canvas.height);
            for (let x = 0; x <= this.canvas.width; x += 5) {
                const y = this.canvas.height - (Math.sin(x * 0.1) * 8 + Math.random() * 15 + 5);
                ctx.lineTo(x, y);
            }
            ctx.lineTo(this.canvas.width, this.canvas.height);
            ctx.closePath();
            ctx.fill();
        } else if (damagedSide === 'left') {
            // Remove left edge - irregular curved shape
            ctx.beginPath();
            ctx.moveTo(0, 0);
            for (let y = 0; y <= this.canvas.height; y += 5) {
                const x = Math.sin(y * 0.1) * 8 + Math.random() * 15 + 5;
                ctx.lineTo(x, y);
            }
            ctx.lineTo(0, this.canvas.height);
            ctx.closePath();
            ctx.fill();
        } else if (damagedSide === 'right') {
            // Remove right edge - irregular curved shape
            ctx.beginPath();
            ctx.moveTo(this.canvas.width, 0);
            for (let y = 0; y <= this.canvas.height; y += 5) {
                const x = this.canvas.width - (Math.sin(y * 0.1) * 8 + Math.random() * 15 + 5);
                ctx.lineTo(x, y);
            }
            ctx.lineTo(this.canvas.width, this.canvas.height);
            ctx.closePath();
            ctx.fill();
        }

        ctx.globalCompositeOperation = 'source-over';

        // Add subtle color desaturation for aged look only on remaining stamp areas
        ctx.globalCompositeOperation = 'saturation';
        ctx.fillStyle = 'rgba(200,200,200,0.15)'; // Slight desaturation

        // Get updated canvas data after edge wear effects
        const updatedImageData = ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
        const updatedData = updatedImageData.data;

        // Only apply desaturation where stamp still exists (not worn away)
        for (let y = 0; y < this.canvas.height; y++) {
            for (let x = 0; x < this.canvas.width; x++) {
                const pixelIndex = (y * this.canvas.width + x) * 4;
                if (updatedData[pixelIndex + 3] > 0) { // If stamp pixel still exists after wear
                    const alpha = updatedData[pixelIndex + 3] / 255;
                    ctx.globalAlpha = alpha * 0.15; // Subtle desaturation based on stamp opacity
                    ctx.fillRect(x, y, 1, 1);
                }
            }
        }

        ctx.globalCompositeOperation = 'source-over';
        ctx.globalAlpha = 1;
    }


    

    

    

    

    
    renderFadeout(ctx) {
        // Create fadeout stamp effect like a real stamp that's been used many times
        ctx.save();

        // First, create a mask of the stamp design
        const maskCanvas = document.createElement('canvas');
        maskCanvas.width = this.canvas.width;
        maskCanvas.height = this.canvas.height;
        const maskCtx = maskCanvas.getContext('2d');

        // Render stamp in solid color for mask
        maskCtx.fillStyle = '#000000';
        this.renderToContext(maskCtx);

        // Render the stamp design normally
        this.renderToContext(ctx);

        // Apply fading effects only where stamp exists using destination-out to remove ink
        ctx.globalCompositeOperation = 'destination-out';

        // Get mask data to check stamp areas
        const maskImageData = maskCtx.getImageData(0, 0, this.canvas.width, this.canvas.height);
        const maskData = maskImageData.data;

        // Create realistic irregular wear patterns
        for (let i = 0; i < 35; i++) {
            let attempts = 0;
            let x, y, pixelIndex;

            // Find a position where stamp exists (not transparent background)
            do {
                x = Math.floor(Math.random() * this.canvas.width);
                y = Math.floor(Math.random() * this.canvas.height);
                pixelIndex = (y * this.canvas.width + x) * 4;
                attempts++;
            } while (maskData[pixelIndex + 3] === 0 && attempts < 50); // Transparent pixel = background

            if (attempts < 50) { // Found a stamp pixel
                const opacity = Math.random() * 0.8 + 0.3; // 0.3-1.1 opacity for ink removal
                ctx.fillStyle = `rgba(0,0,0,${opacity})`;

                // Create irregular wear pattern instead of perfect circle
                this.createIrregularWearPattern(ctx, x, y);
            }
        }

        ctx.restore();
    }

    createIrregularWearPattern(ctx, centerX, centerY) {
        // Create realistic irregular wear patterns like real stamp damage
        const wearType = Math.random();

        if (wearType < 0.4) {
            // Irregular blotch - connected arcs for organic shape
            ctx.beginPath();
            const points = 6 + Math.floor(Math.random() * 4); // 6-9 points
            const baseRadius = Math.random() * 8 + 4; // 4-12 pixels

            for (let i = 0; i < points; i++) {
                const angle = (i / points) * Math.PI * 2;
                const radius = baseRadius * (0.7 + Math.random() * 0.6); // 70%-130% variation
                const x = centerX + Math.cos(angle) * radius;
                const y = centerY + Math.sin(angle) * radius;

                if (i === 0) {
                    ctx.moveTo(x, y);
                } else {
                    // Create curved connections between points
                    const prevAngle = ((i - 1) / points) * Math.PI * 2;
                    const prevRadius = baseRadius * (0.7 + Math.random() * 0.6);
                    const prevX = centerX + Math.cos(prevAngle) * prevRadius;
                    const prevY = centerY + Math.sin(prevAngle) * prevRadius;

                    const cp1x = prevX + (x - prevX) * 0.3 + (Math.random() - 0.5) * 4;
                    const cp1y = prevY + (y - prevY) * 0.3 + (Math.random() - 0.5) * 4;
                    const cp2x = prevX + (x - prevX) * 0.7 + (Math.random() - 0.5) * 4;
                    const cp2y = prevY + (y - prevY) * 0.7 + (Math.random() - 0.5) * 4;

                    ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, x, y);
                }
            }
            ctx.closePath();
            ctx.fill();

        } else if (wearType < 0.7) {
            // Scratch-like wear - thin irregular line
            ctx.beginPath();
            const length = Math.random() * 15 + 8; // 8-23 pixels
            const angle = Math.random() * Math.PI * 2;
            const segments = 3 + Math.floor(Math.random() * 3); // 3-5 segments

            ctx.moveTo(centerX, centerY);

            for (let i = 1; i <= segments; i++) {
                const segmentAngle = angle + (Math.random() - 0.5) * 0.8; // Slight angle variation
                const segmentLength = length / segments * (0.8 + Math.random() * 0.4); // Length variation
                const endX = centerX + Math.cos(segmentAngle) * segmentLength * i / segments;
                const endY = centerY + Math.sin(segmentAngle) * segmentLength * i / segments;

                // Add slight curve to the segment
                const midX = (centerX + endX) / 2 + (Math.random() - 0.5) * 3;
                const midY = (centerY + endY) / 2 + (Math.random() - 0.5) * 3;

                if (i === 1) {
                    ctx.quadraticCurveTo(midX, midY, endX, endY);
                } else {
                    ctx.lineTo(endX, endY);
                }
            }

            ctx.stroke();

        } else {
            // Small irregular chip - tiny irregular polygon
            ctx.beginPath();
            const sides = 3 + Math.floor(Math.random() * 3); // 3-5 sides
            const radius = Math.random() * 4 + 2; // 2-6 pixels

            for (let i = 0; i < sides; i++) {
                const angle = (i / sides) * Math.PI * 2 + Math.random() * 0.5; // Slight angle variation
                const r = radius * (0.6 + Math.random() * 0.8); // Size variation
                const x = centerX + Math.cos(angle) * r;
                const y = centerY + Math.sin(angle) * r;

                if (i === 0) {
                    ctx.moveTo(x, y);
                } else {
                    ctx.lineTo(x, y);
                }
            }
            ctx.closePath();
            ctx.fill();
        }
    }
    


    exportStamp(format = 'png', transparent = false, enhancement = 'original') {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        // Create high-resolution export canvas (4x resolution for high quality)
        const scale = 4;
        canvas.width = this.canvas.width * scale;
        canvas.height = this.canvas.height * scale;
        ctx.scale(scale, scale);

        // Ensure canvas is transparent
        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Fill with white background unless transparent is requested
        if (!transparent) {
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        }

        // Draw the stamp design with enhancement
        this.renderWithEnhancement(ctx, enhancement);

        // Download the image
        this.downloadCanvas(canvas, `stamp-design.${format}`, `image/${format}`);
    }

    renderToContext(ctx) {
        // Draw all shapes in reverse order (last added on top)
        for (let i = this.shapes.length - 1; i >= 0; i--) {
            const shape = this.shapes[i];
            const pixelWidth = shape.width * this.scale;
            const pixelHeight = shape.height * this.scale;

            // Set fill style - use pattern if not solid
            if (shape.fillPattern && shape.fillPattern !== 'solid') {
                ctx.fillStyle = this.createPatternForContext(ctx, shape.fillPattern, shape.color, shape.patternSize || 20);
            } else {
                ctx.fillStyle = shape.color;
            }
            ctx.strokeStyle = shape.color;
            ctx.lineWidth = shape.borderThickness || 2;
            this.setBorderPattern(ctx, shape.borderPattern || 'solid', shape.borderThickness || 2);

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

            // Build font string with bold and italic
            let fontWeight = '';
            if (textElement.bold) fontWeight += 'bold ';
            if (textElement.italic) fontWeight += 'italic ';
            ctx.font = `${fontWeight}${textElement.fontSize || 16}px ${textElement.fontFamily}`;

            // Set text alignment
            ctx.textAlign = textElement.alignment || 'center';
            ctx.textBaseline = 'middle';

            const x = textElement.x || this.canvas.width / 2;
            const y = textElement.y || (this.canvas.height / 2 + (i * 30));

            // Save context for rotation
            ctx.save();

            // Apply rotation if needed
            if (textElement.rotation && textElement.rotation !== 0) {
                ctx.translate(x, y);
                ctx.rotate((textElement.rotation * Math.PI) / 180);
                ctx.translate(-x, -y);
            }

            // Draw text with effects
            if (textElement.curve && textElement.curve !== 0) {
                // Curved text with effects
                this.drawCurvedTextWithEffectsToContext(ctx, textElement, x, y);
            } else {
                // Regular text with effects
                this.drawTextWithEffectsToContext(ctx, textElement, x, y);
            }

            ctx.restore();
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
        this.clipboard = null; // Clear clipboard
        this.updateUIForSelectedShape();
        this.drawStamp();
    }
}

// Initialize the stamp designer when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new StampDesigner();
});