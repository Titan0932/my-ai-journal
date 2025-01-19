// @ts-nocheck comment at the top of a file
import React, { useState, useRef } from 'react';
import { Camera, Upload, Image as ImageIcon, X } from 'lucide-react';
import { useGlobalAction } from '@gadgetinc/react';
import { api } from '../api';

const ImageEmotionAnalysis = ({ onImageAnalysis }) => {
  const [image, setImage] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const fileInputRef = useRef(null);
  const [{ data: imageAnalysisData, error: imageAnalysisError, fetching: fetchingImageAnalysis }, imageAnalyzer] = useGlobalAction(api.imageAnalyzer)

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    // Create a preview URL
    const imageUrl = URL.createObjectURL(file);
    setImage(imageUrl);
    
    // Convert image to base64
    const reader = new FileReader();
    reader.onloadend = async () => {
      const fullBase64String = reader.result;  // Keep the full string for display
      const base64ForAnalysis = reader.result
        .replace('data:', '')
        .replace(/^.+,/, '');  // Stripped version for analysis
      
      // Use the stripped version for analysis
      await analyzeImage(base64ForAnalysis, fullBase64String);
    };
    reader.readAsDataURL(file);
  };
  
  const analyzeImage = async (base64Image, fullBase64String) => {
    setIsAnalyzing(true);
    try {
      // Call your GROQ API endpoint here
      const response = await imageAnalyzer({imageString: base64Image})
      onImageAnalysis(response.data, base64Image, fullBase64String);
    } catch (error) {
      console.error('Error analyzing image:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };
  
  const clearImage = () => {
    setImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="mb-4">
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept="image/*"
        onChange={handleImageUpload}
      />
      
      {!image ? (
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
          <div className="flex flex-col items-center">
            <ImageIcon className="h-12 w-12 text-gray-400 mb-3" />
            <div className="flex space-x-4">
              <span
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center px-4 py-2 bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100 transition-colors"
              >
                <Upload className="h-4 w-4 mr-2" />
                Upload Image
              </span>
              {/* <button
                onClick={async () => {
                  try {
                    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
                    // Handle camera stream
                    // You would need to implement the camera capture UI here
                  } catch (err) {
                    console.error('Error accessing camera:', err);
                  }
                }}
                className="flex items-center px-4 py-2 bg-gray-50 text-gray-600 rounded-md hover:bg-gray-100 transition-colors"
              >
                <Camera className="h-4 w-4 mr-2" />
                Take Photo
              </button> */}
            </div>
            <p className="mt-2 text-sm text-gray-500">
              Upload an image to analyze emotions
            </p>
          </div>
        </div>
      ) : (
        <div className="relative">
          <img
            src={image}
            alt="Uploaded"
            className="w-full h-48 object-cover rounded-lg"
          />
          <button
            onClick={clearImage}
            className="absolute top-2 right-2 p-1 bg-white rounded-full shadow-md hover:bg-gray-100"
          >
            <X className="h-4 w-4 text-gray-600" />
          </button>
          {isAnalyzing && (
            <div className="absolute inset-0 bg-black bg-opacity-50 rounded-lg flex items-center justify-center">
              <div className="text-white text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto"></div>
                <p className="mt-2">Analyzing image...</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ImageEmotionAnalysis;