const fs = require('fs');
const { createCanvas } = require('canvas');

function generateIcon(size) {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');

  // Fill background
  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, size, size);

  // Draw text
  ctx.fillStyle = '#ffffff';
  ctx.font = `${size/4}px Arial`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('C', size/2, size/2);

  return canvas.toBuffer();
}

// Generate icons
const sizes = [192, 512];
sizes.forEach(size => {
  const buffer = generateIcon(size);
  fs.writeFileSync(`public/icons/icon-${size}x${size}.png`, buffer);
  console.log(`Generated ${size}x${size} icon`);
});
