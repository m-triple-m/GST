import React, { useState, useEffect, useRef } from 'react';
import { X, ZoomIn, ZoomOut, RotateCw, RefreshCw, Check, Loader2 } from 'lucide-react';

export default function ImageCropModal({ isOpen, imageSrc, onCancel, onSave }) {
  if (!isOpen) return null;

  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [saving, setSaving] = useState(false);
  const [imgDimensions, setImgDimensions] = useState({ width: 0, height: 0 });

  const containerRef = useRef(null);
  const imageRef = useRef(null);
  
  const containerSize = 320; // crop display box is 320x320
  const cropSize = 256;      // crop circle is 256x256

  // Reset states when a new image is loaded
  useEffect(() => {
    setZoom(1);
    setRotation(0);
    setOffset({ x: 0, y: 0 });
    setIsDragging(false);
  }, [imageSrc]);

  const handleImageLoad = (e) => {
    const { naturalWidth, naturalHeight } = e.target;
    const aspect = naturalWidth / naturalHeight;
    
    let w = containerSize;
    let h = containerSize;
    
    if (aspect > 1) {
      w = containerSize * aspect;
    } else {
      h = containerSize / aspect;
    }
    
    setImgDimensions({ width: w, height: h });
  };

  const handleMouseDown = (e) => {
    e.preventDefault();
    setIsDragging(true);
    setDragStart({ x: e.clientX - offset.x, y: e.clientY - offset.y });
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    setOffset({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
  };

  const handleMouseUpOrLeave = () => {
    setIsDragging(false);
  };

  const handleTouchStart = (e) => {
    const touch = e.touches[0];
    setIsDragging(true);
    setDragStart({ x: touch.clientX - offset.x, y: touch.clientY - offset.y });
  };

  const handleTouchMove = (e) => {
    if (!isDragging) return;
    const touch = e.touches[0];
    setOffset({ x: touch.clientX - dragStart.x, y: touch.clientY - dragStart.y });
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  const handleReset = () => {
    setZoom(1);
    setRotation(0);
    setOffset({ x: 0, y: 0 });
  };

  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  const handleSave = async () => {
    if (saving) return;
    setSaving(true);
    try {
      const canvas = document.createElement('canvas');
      canvas.width = 400;
      canvas.height = 400;
      const ctx = canvas.getContext('2d');

      // Clear background
      ctx.clearRect(0, 0, 400, 400);

      // Translate to canvas center
      ctx.translate(200, 200);

      // Apply rotation
      ctx.rotate((rotation * Math.PI) / 180);

      // Apply zoom
      ctx.scale(zoom, zoom);

      // Calculate translation relative to crop circle center
      const scaleFactor = 400 / cropSize;
      const drawWidth = imgDimensions.width * scaleFactor;
      const drawHeight = imgDimensions.height * scaleFactor;
      const drawX = (offset.x * scaleFactor) - (drawWidth / 2);
      const drawY = (offset.y * scaleFactor) - (drawHeight / 2);

      // Draw the image
      ctx.drawImage(imageRef.current, drawX, drawY, drawWidth, drawHeight);

      // Export canvas to blob
      canvas.toBlob((blob) => {
        if (blob) {
          onSave(blob);
        }
        setSaving(false);
      }, 'image/jpeg', 0.95);
    } catch (err) {
      console.error('Failed to crop and save image:', err);
      setSaving(false);
    }
  };

  // Calculations for real-time preview
  const previewSize = 80;
  const scalePreview = previewSize / cropSize;
  const previewImgWidth = imgDimensions.width * scalePreview;
  const previewImgHeight = imgDimensions.height * scalePreview;
  const previewX = offset.x * scalePreview;
  const previewY = offset.y * scalePreview;

  return (
    <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl border border-slate-100 flex flex-col animate-fade-in-up">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-lg font-black text-slate-800 uppercase tracking-tight">Crop Profile Picture</h2>
          <button 
            onClick={onCancel} 
            className="p-1.5 rounded-lg hover:bg-slate-50 text-slate-400 hover:text-slate-600 transition-colors"
            disabled={saving}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 flex flex-col items-center gap-6">
          
          {/* Interactive Crop Frame */}
          <div 
            ref={containerRef}
            className="w-[320px] h-[320px] bg-slate-50 rounded-2xl overflow-hidden relative cursor-move border border-slate-200 select-none touch-none"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUpOrLeave}
            onMouseLeave={handleMouseUpOrLeave}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            {/* Image Wrapper */}
            <div 
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: `translate(-50%, -50%) translate(${offset.x}px, ${offset.y}px) rotate(${rotation}deg) scale(${zoom})`,
                width: imgDimensions.width || '100%',
                height: imgDimensions.height || '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <img
                ref={imageRef}
                src={imageSrc}
                alt="Source Crop"
                onLoad={handleImageLoad}
                className="pointer-events-none select-none max-w-none"
                style={{
                  width: imgDimensions.width || 'auto',
                  height: imgDimensions.height || 'auto',
                }}
              />
            </div>

            {/* Circular Crop Overlay Mask */}
            <div 
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full pointer-events-none border-2 border-dashed border-teal-500"
              style={{
                width: `${cropSize}px`,
                height: `${cropSize}px`,
                boxShadow: '0 0 0 9999px rgba(10, 15, 30, 0.4)',
              }}
            />
          </div>

          {/* Controls Panel */}
          <div className="w-full space-y-4">
            
            {/* Zoom Slider */}
            <div className="flex items-center gap-3">
              <ZoomOut className="w-4 h-4 text-slate-400" />
              <input
                type="range"
                min="1"
                max="3"
                step="0.01"
                value={zoom}
                onChange={(e) => setZoom(parseFloat(e.target.value))}
                className="flex-1 accent-teal-500 h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer"
                disabled={saving}
              />
              <ZoomIn className="w-4 h-4 text-slate-400" />
            </div>

            {/* Buttons: Rotate & Reset & Real-time preview */}
            <div className="flex items-center justify-between border-t border-slate-100 pt-4">
              <div className="flex gap-2">
                <button
                  onClick={handleRotate}
                  className="flex items-center gap-1.5 px-3 py-2 border border-slate-200 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors uppercase tracking-wider"
                  disabled={saving}
                  title="Rotate image clockwise"
                >
                  <RotateCw className="w-3.5 h-3.5" />
                  <span>Rotate</span>
                </button>
                <button
                  onClick={handleReset}
                  className="flex items-center gap-1.5 px-3 py-2 border border-slate-200 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors uppercase tracking-wider"
                  disabled={saving}
                  title="Reset positions"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Reset</span>
                </button>
              </div>

              {/* Preview Avatar circle */}
              <div className="flex items-center gap-3">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Preview:</span>
                <div 
                  className="rounded-full border border-slate-200 overflow-hidden relative bg-slate-50"
                  style={{ width: `${previewSize}px`, height: `${previewSize}px` }}
                >
                  <div
                    style={{
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      transform: `translate(-50%, -50%) translate(${previewX}px, ${previewY}px) rotate(${rotation}deg) scale(${zoom * scalePreview})`,
                      width: previewImgWidth || '100%',
                      height: previewImgHeight || '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <img
                      src={imageSrc}
                      alt="Crop preview thumbnail"
                      className="pointer-events-none select-none max-w-none"
                      style={{
                        width: previewImgWidth || 'auto',
                        height: previewImgHeight || 'auto',
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex gap-3 justify-end">
          <button
            onClick={onCancel}
            className="px-4 py-2.5 border border-slate-200 rounded-xl text-xs font-bold text-slate-500 uppercase tracking-widest hover:bg-slate-50 transition-colors"
            disabled={saving}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-5 py-2.5 bg-teal-500 hover:bg-teal-600 text-white rounded-xl text-xs font-bold uppercase tracking-widest transition-colors flex items-center gap-2"
            disabled={saving}
          >
            {saving ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Save Crop</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
