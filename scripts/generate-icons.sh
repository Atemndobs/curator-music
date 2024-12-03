#!/bin/bash

# Check if ImageMagick is installed
if ! command -v convert &> /dev/null; then
    echo "ImageMagick is required but not installed. Please install it first."
    exit 1
fi

# Source image (you'll need to provide a high-resolution source image)
SOURCE="public/icons/icon-512x512.png"

# Create various sizes
convert "$SOURCE" -resize 32x32 "public/icon.png"
convert "$SOURCE" -resize 64x64 "public/favicon.ico"
convert "$SOURCE" -resize 192x192 "public/icons/icon-192x192.png"

echo "Icons generated successfully!"
