import { useState, useCallback } from 'react';
import Cropper, { Area, Point } from 'react-easy-crop';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { X, Check, ZoomIn, ZoomOut } from 'lucide-react';

interface ImageCropperProps {
  imageSrc: string;
  onCropComplete: (croppedBlob: Blob) => void;
  onCancel: () => void;
}

// Create canvas element and extract cropped image
const createImage = (url: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener('load', () => resolve(image));
    image.addEventListener('error', (error) => reject(error));
    image.setAttribute('crossOrigin', 'anonymous');
    image.src = url;
  });

async function getCroppedImg(
  imageSrc: string,
  pixelCrop: Area,
  outputSize: number = 400
): Promise<Blob> {
  const image = await createImage(imageSrc);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('No 2d context');
  }

  // Set canvas size to desired output size (square)
  canvas.width = outputSize;
  canvas.height = outputSize;

  // Draw the cropped image
  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    outputSize,
    outputSize
  );

  // Return as blob
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('Canvas is empty'));
        }
      },
      'image/jpeg',
      0.9
    );
  });
}

export default function ImageCropper({ imageSrc, onCropComplete, onCancel }: ImageCropperProps) {
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [saving, setSaving] = useState(false);

  const onCropChange = useCallback((location: Point) => {
    setCrop(location);
  }, []);

  const onZoomChange = useCallback((value: number) => {
    setZoom(value);
  }, []);

  const onCropAreaComplete = useCallback((_: Area, croppedAreaPixels: Area) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleSave = async () => {
    if (!croppedAreaPixels) return;
    
    setSaving(true);
    try {
      const croppedBlob = await getCroppedImg(imageSrc, croppedAreaPixels);
      onCropComplete(croppedBlob);
    } catch (error) {
      console.error('Error cropping image:', error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/95 flex flex-col touch-none">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-background/10 backdrop-blur-sm">
        <Button
          variant="ghost"
          size="icon"
          onClick={onCancel}
          className="text-white hover:bg-white/10"
        >
          <X className="h-5 w-5" />
        </Button>
        <h2 className="text-white font-medium text-lg">Adjust Photo</h2>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleSave}
          disabled={saving}
          className="text-white hover:bg-white/10"
        >
          <Check className="h-5 w-5" />
        </Button>
      </div>

      {/* Cropper Area */}
      <div className="flex-1 relative">
        <Cropper
          image={imageSrc}
          crop={crop}
          zoom={zoom}
          aspect={1}
          cropShape="round"
          showGrid={false}
          onCropChange={onCropChange}
          onZoomChange={onZoomChange}
          onCropComplete={onCropAreaComplete}
          minZoom={1}
          maxZoom={3}
          objectFit="contain"
        />
      </div>

      {/* Controls */}
      <div className="p-4 sm:p-6 bg-background/10 backdrop-blur-sm space-y-4">
        {/* Zoom Slider */}
        <div className="flex items-center gap-3 max-w-md mx-auto">
          <ZoomOut className="h-4 w-4 text-white/70 flex-shrink-0" />
          <Slider
            value={[zoom]}
            min={1}
            max={3}
            step={0.01}
            onValueChange={([value]) => setZoom(value)}
            className="flex-1"
          />
          <ZoomIn className="h-4 w-4 text-white/70 flex-shrink-0" />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 max-w-md mx-auto">
          <Button
            variant="outline"
            onClick={onCancel}
            className="flex-1 min-h-[48px] bg-transparent border-white/30 text-white hover:bg-white/10"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 min-h-[48px] bg-primary hover:bg-primary/90"
          >
            {saving ? 'Saving...' : 'Save Avatar'}
          </Button>
        </div>

        <p className="text-center text-xs text-white/60">
          Pinch or use slider to zoom • Drag to reposition
        </p>
      </div>
    </div>
  );
}
