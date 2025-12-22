# SignMe - Digital Signature & Stamp Designer Suite

**Version 1.1**

A comprehensive web-based suite for digital signature capture and custom stamp design. Create professional signatures with HTML5 Canvas and design custom stamps with various shapes, text, and styling options. Perfect for businesses, legal documents, and creative projects.

## Overview

SignMe provides two powerful tools in a unified, user-friendly interface:
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

1. Upload all files to your web server
2. Ensure the server serves the files correctly (e.g., via Apache, Nginx, or any web hosting)
3. Open `index.html` in your web browser to start using SignMe

### Local Development Setup
For local testing, you can use any local server:
- Place the project folder in your web server's document root
- Access via your localhost URL

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
signme/
├── index.html                  # Main page - Document Signing tool
├── stamp-designer.html         # Stamp Designer tool
├── README.md                   # Project documentation
├── CHANGELOG.md                # Version history
├── LICENSE.txt                 # License information
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
└── documentation/             # User guides and installation docs
    ├── installation-guide.html
    └── user-guide.html
```

## Changelog

See [CHANGELOG.md](CHANGELOG.md) for version history and updates.

## License

This script is sold under the Regular License on CodeCanyon. See [LICENSE.txt](LICENSE.txt) for details.

## Support

For support, please use the CodeCanyon comment section or contact the author through Envato's messaging system.

## Credits

**Developed by Jaan Network © 2025**

Built with:
- HTML5 Canvas API
- Tailwind CSS
- Font Awesome Icons
- PDF.js & PDF-lib
- Vanilla JavaScript