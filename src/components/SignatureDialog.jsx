import { useState, useRef, useEffect } from 'react';
import './SignatureDialog.css';

function SignatureDialog({ onSave, onClose, onRemove, hasSavedSignature }) {
  const [activeTab, setActiveTab] = useState('draw'); // 'draw' or 'upload'
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [uploadedImage, setUploadedImage] = useState(null);
  const [isCanvasDirty, setIsCanvasDirty] = useState(false);

  // Initialize canvas drawing context
  useEffect(() => {
    if (activeTab === 'draw' && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      // Set actual resolution based on container size
      const rect = canvas.parentElement.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = 200;
      
      // Clear canvas (transparent by default)
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Drawing styles (black stroke)
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 3;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
    }
  }, [activeTab]);

  const startDrawing = (e) => {
    setIsDrawing(true);
    setIsCanvasDirty(true);
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX || e.touches[0].clientX) - rect.left;
    const y = (e.clientY || e.touches[0].clientY) - rect.top;
    
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    e.preventDefault(); // Prevent scrolling on touch
    setIsCanvasDirty(true);
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX || e.touches[0].clientX) - rect.left;
    const y = (e.clientY || e.touches[0].clientY) - rect.top;
    
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      setIsCanvasDirty(false);
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        // Compress image using canvas before storing
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          
          // Max dimensions
          const MAX_WIDTH = 500;
          const MAX_HEIGHT = 200;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;
          
          ctx.clearRect(0, 0, width, height);
          ctx.drawImage(img, 0, 0, width, height);
          
          // Export as PNG to preserve transparency
          const dataUrl = canvas.toDataURL('image/png');
          setUploadedImage(dataUrl);
        };
        img.src = event.target.result;
      };
      reader.readAsDataURL(file);
    }
  };

  const removeUploadedImage = () => {
    setUploadedImage(null);
  };

  const handleSave = () => {
    let signatureData = null;
    let type = activeTab;

    if (activeTab === 'draw' && canvasRef.current) {
      // Export drawn canvas as PNG to preserve transparency
      signatureData = canvasRef.current.toDataURL('image/png');
    } else if (activeTab === 'upload' && uploadedImage) {
      signatureData = uploadedImage;
    }

    if (signatureData) {
      onSave({
        type,
        dataUrl: signatureData
      });
    } else {
      onClose(); // Just close if nothing to save
    }
  };

  return (
    <div className="signature-dialog-overlay" onClick={(e) => {
      if (e.target.classList.contains('signature-dialog-overlay')) onClose();
    }}>
      <div className="signature-dialog">
        <div className="signature-dialog-header">
          <h3>Add Signature</h3>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </div>
        
        <div className="signature-tabs">
          <button 
            className={`tab-btn ${activeTab === 'draw' ? 'active' : ''}`}
            onClick={() => setActiveTab('draw')}
          >
            Draw Signature
          </button>
          <button 
            className={`tab-btn ${activeTab === 'upload' ? 'active' : ''}`}
            onClick={() => setActiveTab('upload')}
          >
            Upload Image
          </button>
        </div>

        <div className="signature-content">
          {activeTab === 'draw' ? (
            <div className="canvas-container">
              <canvas
                ref={canvasRef}
                className="signature-canvas"
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                onTouchStart={startDrawing}
                onTouchMove={draw}
                onTouchEnd={stopDrawing}
              />
            </div>
          ) : (
            <div className="upload-container">
              {!uploadedImage ? (
                <>
                  <label htmlFor="signature-upload" className="upload-btn">
                    Choose Image
                  </label>
                  <input 
                    id="signature-upload"
                    type="file" 
                    accept="image/*" 
                    onChange={handleFileUpload} 
                  />
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '10px' }}>
                    Upload a picture of your signature
                  </p>
                </>
              ) : (
                <div className="preview-container">
                  <img src={uploadedImage} alt="Signature Preview" className="preview-image" />
                  <button className="remove-btn" onClick={removeUploadedImage}>Remove</button>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="signature-dialog-footer">
          <div className="footer-left-actions">
            {activeTab === 'draw' && (
              <button className="clear-btn" onClick={clearCanvas}>Clear</button>
            )}
            {hasSavedSignature && (
              <button className="remove-sig-btn" onClick={onRemove}>Remove Signature</button>
            )}
          </div>
          <button className="cancel-btn" onClick={onClose}>Cancel</button>
          <button 
            className="save-btn" 
            onClick={handleSave}
            disabled={activeTab === 'draw' ? !isCanvasDirty : !uploadedImage}
          >
            Add Signature
          </button>
        </div>
      </div>
    </div>
  );
}

export default SignatureDialog;
