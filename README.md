# 🎵 Virtual Harmonica

A web-based virtual harmonica that you can play using your keyboard. Built with React, TypeScript, and HTML5 Canvas.

## ✨ Features

- **10-hole diatonic harmonica** simulation
- **Real-time audio synthesis** using Web Audio API
- **Visual feedback** with canvas-based harmonica display
- **Keyboard controls** (Q-P keys)
- **Blow and draw notes** (normal keys vs Shift+keys)
- **Note sustaining** (hold keys down)
- **Responsive design** that works on desktop and mobile

## 🎹 How to Play

### Controls
- **Q, W, E, R, T, Y, U, I, O, P** - Blow notes (exhale)
- **Shift + Q, W, E, R, T, Y, U, I, O, P** - Draw notes (inhale)
- **Hold keys** - Sustain notes for longer play
- **Adjacent holes only** - Like a real harmonica, you can only play holes next to each other (no gaps)

### Note Layout
The harmonica follows a standard 10-hole diatonic layout in the key of C:

| Hole | 1  | 2  | 3  | 4  | 5  | 6  | 7  | 8  | 9  | 10 |
|------|----|----|----|----|----|----|----|----|----|----|
| Key  | Q  | W  | E  | R  | T  | Y  | U  | I  | O  | P  |
| Blow | C4 | E4 | G4 | C5 | E5 | G5 | C6 | E6 | G6 | C7 |
| Draw | D4 | G4 | B4 | D5 | F5 | A5 | B5 | D6 | F6 | A6 |

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/error-magnet/eharmonica.git
cd eharmonica
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

### Building for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## 🛠️ Technology Stack

- **React 19** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **HTML5 Canvas** - Harmonica visualization
- **Web Audio API** - Real-time audio synthesis
- **CSS3** - Styling (shadcn/ui inspired)

## 🎵 Audio Implementation

The harmonica uses the Web Audio API to generate realistic harmonica sounds:

- **Sawtooth wave oscillators** for rich harmonic content
- **Envelope shaping** with attack and release phases
- **Real-time frequency modulation** based on note selection
- **Polyphonic playback** (multiple notes simultaneously)

## 🎨 Design

The interface features a clean, modern design inspired by shadcn/ui:
- Minimal color palette with subtle shadows
- Card-based layout for better organization
- Responsive design that works on all devices
- Canvas-based harmonica with square-like holes for visual clarity

## 📱 Browser Compatibility

- Modern browsers with Web Audio API support
- Chrome, Firefox, Safari, Edge (latest versions)
- Mobile browsers (iOS Safari, Chrome Mobile)

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

## 🐛 Issues

If you encounter any issues or have suggestions, please [open an issue](https://github.com/error-magnet/eharmonica/issues) on GitHub.

## 🎯 Future Enhancements

- [ ] Different harmonica keys (G, A, D, etc.)
- [ ] Recording functionality
- [ ] Song playback and tutorials
- [ ] Different waveforms and effects
- [ ] Chromatic harmonica support
- [ ] MIDI input support

---

Made with ❤️ by [error-magnet](https://github.com/error-magnet)
