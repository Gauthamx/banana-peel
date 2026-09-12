import React, { useState, forwardRef, useRef } from 'react';
import Webcam from 'react-webcam';

const ImageInput = forwardRef(({ onModeChange }, ref) => {
  const [mode, setMode] = useState('upload');
  const [previewSrc, setPreviewSrc] = useState(null);
  const [dragging, setDragging] = useState(false);
  const fileInputRef = useRef(null);

  const handleModeSwitch = (newMode) => {
    setMode(newMode);
    setPreviewSrc(null);
    onModeChange(newMode === 'webcam');
  };

  const loadFile = (file) => {
    if (!file || !file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = (e) => setPreviewSrc(e.target.result);
    reader.readAsDataURL(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    loadFile(e.dataTransfer.files[0]);
  };

  return (
    <div className="input-wrap">
      {/* Mode selector */}
      <div className="seg-control">
        <button
          className={`seg-btn ${mode === 'upload' ? 'seg-active' : ''}`}
          onClick={() => handleModeSwitch('upload')}
        >
          <i className="bx bx-image-add" /> Upload
        </button>
        <button
          className={`seg-btn ${mode === 'webcam' ? 'seg-active' : ''}`}
          onClick={() => handleModeSwitch('webcam')}
        >
          <i className="bx bx-video" /> Camera
        </button>
      </div>

      {/* Upload zone */}
      {mode === 'upload' && (
        <div
          className={`drop-zone ${dragging ? 'dz-active' : ''} ${previewSrc ? 'dz-has-img' : ''}`}
          onClick={() => !previewSrc && fileInputRef.current.click()}
          onDrop={handleDrop}
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={(e) => loadFile(e.target.files[0])}
          />

          {previewSrc ? (
            <div className="preview-wrap">
              <img
                src={previewSrc}
                alt="Banana"
                ref={ref}
                crossOrigin="anonymous"
                className="preview-img"
              />
              <button
                className="btn-ghost btn-sm"
                onClick={(e) => {
                  e.stopPropagation();
                  setPreviewSrc(null);
                  fileInputRef.current.click();
                }}
              >
                <i className="bx bx-refresh" /> Replace
              </button>
            </div>
          ) : (
            <div className="dz-placeholder">
              <div className="dz-icon-wrap">
                <i className={`bx ${dragging ? 'bx-check-circle' : 'bx-cloud-upload'} dz-icon`} />
              </div>
              <p className="dz-title">{dragging ? 'Release to drop' : 'Drag & drop your banana'}</p>
              <p className="dz-sub">or click to browse — JPG, PNG, WEBP</p>
            </div>
          )}
        </div>
      )}

      {/* Webcam */}
      {mode === 'webcam' && (
        <div className="webcam-wrap">
          <Webcam
            audio={false}
            ref={ref}
            screenshotFormat="image/jpeg"
            className="webcam-feed"
          />
          <div className="scan-overlay">
            <div className="scan-bracket tl" />
            <div className="scan-bracket tr" />
            <div className="scan-bracket bl" />
            <div className="scan-bracket br" />
            <div className="scan-laser" />
          </div>
          <p className="webcam-hint">
            <i className="bx bx-target-lock" /> Point one end at the camera
          </p>
        </div>
      )}
    </div>
  );
});

export default ImageInput;
