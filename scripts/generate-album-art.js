const fs = require('fs');
const { createCanvas } = require('canvas');

function generateDefaultAlbumArt() {
  const size = 400; // Large enough for good quality
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');

  // Create a radial gradient similar to the UI in the image
  const gradient = ctx.createRadialGradient(size/2, size/2, 0, size/2, size/2, size);
  gradient.addColorStop(0, '#2B1B54');    // Deep purple center
  gradient.addColorStop(0.6, '#4B2A84');  // Medium purple
  gradient.addColorStop(1, '#1E1A3F');    // Dark purple-blue edge
  
  // Fill background
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);

  // Add a subtle glow effect
  const glowGradient = ctx.createRadialGradient(size/2, size/2, size/4, size/2, size/2, size/2);
  glowGradient.addColorStop(0, 'rgba(255, 100, 255, 0.1)');
  glowGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = glowGradient;
  ctx.fillRect(0, 0, size, size);

  // Draw music note icon with a modern style
  ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
  ctx.font = `${size/3}px Arial`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('♪', size/2, size/2);

  return canvas.toBuffer();
}

// Generate default album art
const buffer = generateDefaultAlbumArt();
fs.writeFileSync('public/images/default-album-art.png', buffer);
console.log('Generated default album art with modern purple gradient');
