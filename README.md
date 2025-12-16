# Digital Tools Suite

A comprehensive web-based suite for digital signature capture and custom stamp design. Create professional signatures with HTML5 Canvas and design custom stamps with various shapes, text, and styling options.

## Features

### Signature Capture
- **Interactive Canvas Drawing**: Draw signatures using mouse or touch input with pressure-sensitive line width
- **Pen and Eraser Modes**: Switch between drawing and erasing
- **Customizable Pen**: Adjust pen thickness (1-20px) and choose any color
- **Undo Functionality**: Remove the last stroke with undo button or Ctrl+Z
- **Clear Canvas**: Reset the entire canvas with the clear button or Delete key
- **Signature Enhancement**: Smooth and refine signatures with the enhance button
- **Fullscreen Mode**: Expand canvas to full screen for detailed work
- **Preview Modal**: Review signature before downloading
- **Transparent PNG Export**: Save signatures as high-quality PNG files with transparency
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices
- **Keyboard Shortcuts**: 
  - Ctrl+Z: Undo
  - Del/Backspace: Clear canvas
  - Esc: Close modal
  - Shift+Drag: Continuous drawing mode

### Stamp Designer
- **Multiple Shapes**: Choose from circle, rectangle, oval, and triangle stamp shapes
- **Customizable Size**: Adjust width and height from 20mm to 350mm
- **Color Options**: Select any color for stamp fill and border
- **Fill Styles**: Choose between filled shapes or hollow outlines with adjustable border thickness
- **Text Addition**: Add custom text with various fonts, sizes, colors, and curve effects
- **Layer Management**: Organize elements with move up/down and delete functionality
- **Real-time Preview**: See changes instantly on the canvas
- **PNG Export**: Save custom stamps as high-quality PNG files

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

## Usage

### Signature Capture
1. **Drawing**: Click and drag on the canvas to draw your signature (hold Shift for continuous mode)
2. **Erasing**: Switch to eraser mode to remove parts of the signature
3. **Customize**: Adjust pen thickness with the slider and select color with the picker
4. **Edit**: Use Undo to remove the last stroke, Clear to reset, or Enhance to smooth the signature
5. **Fullscreen**: Click fullscreen button for larger canvas area
6. **Save**: Click "Save Signature" to preview and download as PNG

### Stamp Designer
1. **Choose Shape**: Select from circle, rectangle, oval, or triangle shapes
2. **Adjust Size**: Use sliders to set width and height dimensions
3. **Select Colors**: Pick fill color and adjust border thickness (for hollow shapes)
4. **Add Text**: Enter text, choose font, size, color, and curve level, then click "Add Text"
5. **Manage Layers**: Select elements to move up/down or delete them
6. **Preview**: See real-time changes on the stamp canvas
7. **Export**: Click "Export PNG" to download your custom stamp design

## Browser Support

- Chrome 60+
- Firefox 55+
- Safari 11+
- Edge 79+
- Mobile browsers (iOS Safari, Chrome Mobile)

## Files Structure

- `index.html`: Main HTML page with navigation and signature capture tool
- `stamp-designer.html`: Stamp design tool interface
- `js/script.js`: JavaScript logic for signature capture functionality
- `js/stamp-designer.js`: JavaScript logic for stamp design functionality
- `README.md`: Project documentation

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is open source. Feel free to use and modify as needed.

## Credits

Powered by Jaan Network © 2025