#!/bin/bash

# Test Cloudinary upload configuration

echo "================================"
echo "Cloudinary Upload Test"
echo "================================"
echo ""

# Configuration
CLOUD_NAME="dhkccnvyn"
UPLOAD_PRESET="howmuch_preset"

echo "Cloud Name: $CLOUD_NAME"
echo "Upload Preset: $UPLOAD_PRESET"
echo ""

# Test with a small test image (base64 encoded 1x1 pixel PNG)
TEST_IMAGE="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="

echo "Testing upload endpoint..."
echo ""

# Test the upload
curl -X POST "https://api.cloudinary.com/v1_1/$CLOUD_NAME/image/upload" \
  -F "file=$TEST_IMAGE" \
  -F "upload_preset=$UPLOAD_PRESET" \
  -w "\n\nHTTP Status: %{http_code}\n" \
  2>&1 | head -50

echo ""
echo "================================"
echo ""
echo "If you see a JSON response with 'secure_url', uploads are working!"
echo "If you see an error, check:"
echo "  1. Cloud name is correct: $CLOUD_NAME"
echo "  2. Upload preset exists and is unsigned"
echo "  3. Upload preset name is correct: $UPLOAD_PRESET"
echo ""
echo "To fix upload preset issues:"
echo "  1. Go to: https://cloudinary.com/console"
echo "  2. Settings > Upload > Upload presets"
echo "  3. Create/verify 'howmuch_preset' exists"
echo "  4. Make sure it's set to 'Unsigned'"
