# Signature Capture App

A modern, responsive web-based signature capture application built with HTML5 Canvas. Create digital signatures with customizable pen thickness and color, featuring undo functionality, eraser mode, smoothing, fullscreen, and transparent PNG export.

## Features

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

## Technologies Used

- **HTML5 Canvas**: For signature drawing and rendering
- **Tailwind CSS**: For responsive styling and UI components
- **Font Awesome**: For icons and visual elements
- **Vanilla JavaScript**: For canvas interaction and functionality

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

1. **Drawing**: Click and drag on the canvas to draw your signature (hold Shift for continuous mode)
2. **Erasing**: Switch to eraser mode to remove parts of the signature
3. **Customize**: Adjust pen thickness with the slider and select color with the picker
4. **Edit**: Use Undo to remove the last stroke, Clear to reset, or Enhance to smooth the signature
5. **Fullscreen**: Click fullscreen button for larger canvas area
6. **Save**: Click "Save Signature" to preview and download as PNG

## Browser Support

- Chrome 60+
- Firefox 55+
- Safari 11+
- Edge 79+
- Mobile browsers (iOS Safari, Chrome Mobile)

## Files Structure

- `index.html`: Main HTML page with UI and canvas
- `js/script.js`: JavaScript logic for drawing, controls, and export
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