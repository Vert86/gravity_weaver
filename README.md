# Gravity Weaver 🎮

A hyper-casual web-based game where you control a thread by flipping gravity to navigate through obstacles. Built with pure HTML5, CSS, and JavaScript - no frameworks or game engines required!

## 🎯 How to Play

1. **Objective**: Guide your thread through randomly generated obstacles
2. **Controls**:
   - **Desktop**: Click and hold to flip gravity upward, release to flip back down
   - **Mobile**: Tap and hold to flip gravity upward, release to flip back down
3. **Scoring**: Earn 1 point for each obstacle you pass
4. **Coins**: Earn coins equal to your score to unlock skins and trails

## 🚀 Getting Started

### Play Locally

1. Simply open `index.html` in any modern web browser
2. No build process or dependencies needed!

### Play on Mobile Browser

1. Open `index.html` on your mobile device's browser (Chrome, Safari, etc.)
2. For the best experience, add to home screen:
   - **iOS**: Tap Share → Add to Home Screen
   - **Android**: Tap Menu → Add to Home Screen

## ✨ Features

- **One-Touch Gravity Flip Mechanic**: Simple yet challenging gameplay
- **Endless Procedural Levels**: Randomly generated obstacles for infinite replayability
- **Progressive Difficulty**: Game speeds up as you score higher
- **Customization System**: Unlock unique thread skins and trail effects
- **Local Storage**: Your high scores, coins, and unlocks are saved automatically
- **Particle Effects**: Satisfying visual feedback
- **Sound Effects**: Procedural audio using Web Audio API
- **Responsive Design**: Works on desktop and mobile browsers
- **Share Scores**: Share your achievements on social media

## 🎨 Customization

Unlock skins and trails by earning coins (1 coin per point scored):

### Thread Skins
- Classic (Free)
- Lightning (50 coins)
- Fire (50 coins)
- Ice (50 coins)
- Toxic (75 coins)
- Galaxy (100 coins)

### Trail Effects
- None (Free)
- Spark (30 coins)
- Smoke (30 coins)
- Rainbow (50 coins)

## 📱 Converting to Mobile App

You can easily convert this web game to a native mobile app using these tools:

### Option 1: Capacitor (Recommended)

```bash
# Install Capacitor
npm install @capacitor/core @capacitor/cli
npm install @capacitor/ios @capacitor/android

# Initialize Capacitor
npx cap init

# Add platforms
npx cap add ios
npx cap add android

# Copy web files
npx cap copy

# Open in native IDE
npx cap open ios
npx cap open android
```

### Option 2: Cordova

```bash
# Install Cordova
npm install -g cordova

# Create Cordova project
cordova create GravityWeaver com.yourname.gravityweaver GravityWeaver

# Copy your files to www/ folder
# Add platforms
cordova platform add ios
cordova platform add android

# Build
cordova build
```

### Option 3: PWA (Progressive Web App)

Add a `manifest.json` and service worker to make it installable on mobile devices without app stores.

## 🏗️ Project Structure

```
gravity_weaver/
├── index.html          # Main HTML structure
├── styles.css          # All styles and responsive design
├── game.js            # Complete game logic
└── README.md          # This file
```

## 🎮 Game Architecture

### Core Components

1. **Player Class**: Handles the thread movement, gravity flip, and trail rendering
2. **Obstacle Class**: Procedurally generates and manages obstacles
3. **Particle Class**: Creates visual effects for gravity flips and collisions
4. **Game States**: Start, Playing, Game Over, Shop
5. **Customization System**: Skins and trails with localStorage persistence
6. **Sound System**: Web Audio API for procedural sound effects

### Game Loop

The game uses `requestAnimationFrame` for smooth 60 FPS gameplay:

1. Clear canvas
2. Update game objects (player, obstacles, particles)
3. Check collisions
4. Render everything
5. Repeat

## 🔧 Customization & Extension Ideas

Want to enhance the game? Here are some ideas:

- Add power-ups (shield, slow-mo, double coins)
- Implement daily challenges
- Add different obstacle types
- Create themed environments
- Add background music
- Implement leaderboards with a backend
- Add achievements system
- Create different game modes

## 📊 Technical Details

- **No dependencies**: Pure vanilla JavaScript
- **Canvas-based rendering**: HTML5 Canvas API
- **Responsive**: Automatically scales to any screen size
- **Touch-optimized**: Full mobile touch support
- **Local persistence**: localStorage for saves
- **Performant**: Optimized game loop with object pooling

## 🎯 Game Design Philosophy

Based on successful hyper-casual games like Flappy Bird and Subway Surfers:

- **Simple to learn**: One-touch control
- **Hard to master**: Requires timing and precision
- **Quick sessions**: Perfect for short play sessions
- **High replay value**: Always trying to beat your high score
- **Satisfying feedback**: Particles, sounds, and smooth animations

## 📝 License

Feel free to use, modify, and distribute this game for any purpose.

## 🙏 Credits

Inspired by the hyper-casual game design document for "Gravity Weaver" 
