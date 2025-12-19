# Digital Tools Suite

A comprehensive web-based suite for digital signature capture and custom stamp design. Create professional signatures with HTML5 Canvas and design custom stamps with various shapes, text, and styling options. Powered by Jaan Network.

## Overview

This project provides two main tools accessible through a unified interface:
- **Document Signing**: Professional signature capture and creation tool
- **Stamp Designer**: Custom stamp design tool with multiple shapes and enhancement options

## Features

### Document Signing
- **Interactive Canvas Drawing**: Draw signatures using mouse or touch input with smooth, responsive line rendering
- **Drawing Tools**:
  - Pen mode with customizable thickness and color
  - Eraser mode for precise corrections
  - Multiple pen thickness presets (thin, medium, bold, thick)
- **Canvas Controls**:
  - Undo last stroke (Ctrl+Z or button)
  - Clear entire canvas (Delete key or button)
  - Fullscreen mode for detailed work
  - Signature enhancement for smoother appearance
- **Export Options**:
  - Preview signature before saving
  - Export as transparent PNG
  - High-quality output suitable for documents
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices
- **Keyboard Shortcuts**: 
  - Ctrl+Z: Undo
  - Del/Backspace: Clear canvas
  - Esc: Close modal
  - Shift+Drag: Continuous drawing mode

### Stamp Designer
- **Shape Options**: Circle, rectangle, oval, and triangle stamp shapes
- **Size Customization**: Adjust width and height from 20mm to 350mm
- **Color Controls**: 
  - Fill color selection
  - Border color and thickness adjustment
  - Hollow or filled shape styles
- **Text Features**:
  - Add multiple text layers
  - Various font options
  - Adjustable size, color, and curve effects
  - Text positioning and rotation
- **Layer Management**: 
  - Organize elements with move up/down functionality
  - Delete individual layers
  - Real-time preview of all changes
- **Enhancement Styles**:
  - **Original**: Clean, standard stamp design
  - **Vintage**: Authentic aged appearance with paper texture, ink fading, and weathering effects
  - **Fadeout**: Realistic worn stamp effect from repeated use
- **Export Workflow**: Preview enhancement options before final PNG export

## Technologies Used

- **HTML5 Canvas**: For signature drawing and stamp rendering
- **Tailwind CSS**: For responsive styling and UI components
- **Font Awesome**: For icons and visual elements
- **Vanilla JavaScript**: For canvas interaction and functionality
- **PDF.js & PDF-lib**: For PDF handling capabilities

## Requirements

- Modern web browser with HTML5 Canvas support (Chrome, Firefox, Safari, Edge)
- Internet connection for CDN resources (Tailwind CSS, Font Awesome)

## Installation

1. Clone or download the project files to your web server directory
2. Ensure the server serves the files correctly (e.g., via Apache, Nginx, or MAMP)
3. Open `index.html` in your web browser

For local development with MAMP:
- Place the project folder in `/Applications/MAMP/htdocs/`
- Start MAMP servers
- Access via `http://localhost/signature/`

## Getting Started

### Quick Start
1. Open [index.html](index.html) in your web browser to access Document Signing
2. Or click "Stamp Designer" in the navigation to switch to stamp creation
3. Both tools are accessible through the unified header navigation

### Document Signing Usage
1. **Start Drawing**: Click and drag on the white canvas to draw your signature
2. **Adjust Pen**: 
   - Select pen thickness using the preset buttons (thin/medium/bold/thick)
   - Choose pen color using the color picker
3. **Use Tools**:
   - Switch to eraser mode to correct mistakes
   - Click undo to remove the last stroke
   - Use clear to reset the entire canvas
   - Enable fullscreen for more drawing space
4. **Enhance**: Click the enhance button to smooth your signature
5. **Save**: Click "Save Signature" to preview, then download as transparent PNG

### Stamp Designer Usage
1. **Select Shape**: Choose from circle, rectangle, oval, or triangle
2. **Configure Dimensions**: 
   - Adjust width and height using sliders (20-350mm)
   - Toggle between filled and hollow shapes
3. **Style the Stamp**:
   - Select fill color
   - Set border thickness for hollow shapes
   - Choose border color
4. **Add Text**:
   - Enter your text content
   - Select font style
   - Adjust size, color, and curve level
   - Click "Add Text" to place it on the stamp
5. **Manage Elements**:
   - Select layers in the sidebar
   - Use move up/down buttons to adjust layering
   - Delete unwanted elements
6. **Export**:
   - Click "Export PNG" to open the enhancement preview
   - Choose style: Original, Vintage, or Fadeout
   - Click "Export Selected" to download your stamp

## Browser Support

- Chrome 60+
- Firefox 55+
- Safari 11+
- Edge 79+
- Mobile browsers (iOS Safari, Chrome Mobile)

## Project Structure

```
signature/
├── index.html                  # Main page - Document Signing tool
├── stamp-designer.html         # Stamp Designer tool
├── README.md                   # Project documentation
├── js/
│   ├── script.js              # Signature capture functionality
│   └── stamp-designer.js      # Stamp design functionality
├── assets/
│   ├── logo.svg               # Application logo
│   ├── pen-icon.svg           # Pen tool icon
│   ├── eraser-icon.svg        # Eraser tool icon
│   ├── undo-icon.svg          # Undo action icon
│   ├── clear-icon.svg         # Clear canvas icon
│   ├── enhance-iconTwo.svg    # Signature enhancement icon
│   ├── fullScreen-icon.svg    # Fullscreen mode icon
│   ├── export-icon.svg        # Export icon
│   ├── thin-icon.svg          # Thin pen preset
│   ├── medium-icon.svg        # Medium pen preset
│   ├── bold-icon.svg          # Bold pen preset
│   ├── thick-icon.svg         # Thick pen preset
│   └── stamp/                 # Stamp-related assets
└── v1/                        # Previous version files
    ├── index.html
    └── stamp-designer.html
```

## Development

### Key Components
- **Canvas API**: Used extensively for signature drawing and stamp rendering
- **Event Listeners**: Mouse and touch event handling for cross-device compatibility
- **Layer System**: Custom implementation for managing stamp design elements
- **Image Processing**: Real-time canvas manipulation for enhancement effects

### Enhancement Algorithms
The stamp enhancement feature uses canvas pixel manipulation to create realistic effects:
- **Vintage**: Applies paper texture, ink fading, aging spots, and weathering
- **Fadeout**: Creates worn areas and ink degradation patterns
- Both effects use randomization for authentic appearance

## Version History

- **Current Version**: Modern UI with Tailwind CSS, enhanced features, and improved UX
- **v1/**: Previous version maintained for reference (accessible in v1 folder)

## Contributing

Contributions are welcome! If you'd like to improve this project:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/improvement`)
3. Make your changes
4. Test thoroughly across different browsers and devices
5. Submit a pull request with a clear description of changes

## Known Issues & Limitations

- Enhancement effects are applied at export time and cannot be reversed
- Very large canvas sizes may impact performance on older devices
- Some fonts may not render consistently across all browsers

## License

This project is open source and available for use and modification.

## Support

For issues, questions, or feature requests, please contact Jaan Network.

## Credits

**Powered by Jaan Network © 2025**

Built with:
- HTML5 Canvas API
- Tailwind CSS
- Font Awesome Icons
- PDF.js & PDF-lib
- Vanilla JavaScript