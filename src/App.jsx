import React, { useState, useCallback } from 'react';
import { FileText, Copy, Camera, Sparkles } from 'lucide-react';


const toBase64 = file => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result.split(',')[1]);
    reader.onerror = error => reject(error);
});

      export default function App() {
          const [imageFile, setImageFile] = useState(null);
          const [imagePreview, setImagePreview] = useState(null);
          const [caption, setCaption] = useState('');
          const [isLoading, setIsLoading] = useState(false);
          const [error, setError] = useState('');
          const [copySuccess, setCopySuccess] = useState('');
          const [showResult, setShowResult] = useState(false);

          const handleImageChange = (e) => {
              const file = e.target.files[0];
              if (file) {
                  if (file.size > 2 * 1024 * 1024) {
                      setError('Please select an image smaller than 2MB.');
                      return;
                  }
                  setError('');
                  setCaption('');
                  setCopySuccess('');
                  setShowResult(false);
                  setImageFile(file);
                  setImagePreview(URL.createObjectURL(file));
              }
          };

          const generateCaption = useCallback(async () => {
        if (!imageFile) {
          setError("Please upload an image first.");
          return;
        }

        setIsLoading(true);
        setError("");
        setCaption("");
        setCopySuccess("");
        setShowResult(true);

        try {
          const formData = new FormData();
          formData.append("image", imageFile);

          const response = await fetch(`https://chrono-weave-backend.onrender.com/api/caption`, {
            method: "POST",
            body: formData,
            });




          if (!response.ok) {
            throw new Error(`API request failed with status ${response.status}`);
          }

          const result = await response.json();
          if (result.caption) {
            setCaption(result.caption);
          } else {
            setError("Caption generation failed.");
            setShowResult(false);
          }
        } catch (err) {
          console.error("Error generating caption:", err);
          setError("An error occurred while generating the caption. Please try again.");
          setShowResult(false);
        } finally {
          setIsLoading(false);
        }
      }, [imageFile]);


    const copyToClipboard = () => {
        if (!caption) return;
        
        const tempTextArea = document.createElement('textarea');
        tempTextArea.value = caption;
        document.body.appendChild(tempTextArea);
        tempTextArea.select();
        try {
            document.execCommand('copy');
            setCopySuccess('Copied!');
            setTimeout(() => setCopySuccess(''), 2000);
        } catch (err) {
            setCopySuccess('Failed to copy');
        }
        document.body.removeChild(tempTextArea);
    };

    return (
        <div className="min-h-screen w-full bg-slate-900 text-gray-200 flex items-center justify-center p-4">
            <div className="w-full max-w-md mx-auto">
                <header className="text-center mb-8">
                    <h1 className="text-5xl font-extrabold text-white">CaptionSense</h1>
                    <p className="text-slate-400 mt-2 text-lg">Your personal AI caption assistant.</p>
                </header>

                <main className="bg-slate-800/60 rounded-2xl p-6 border border-slate-700">
                    <div className="mb-6">
                        <label htmlFor="image-upload" className="cursor-pointer w-full h-52 border-2 border-dashed border-slate-600 rounded-xl flex flex-col items-center justify-center text-slate-400 hover:border-cyan-500">
                            {imagePreview ? (
                                <img src={imagePreview} alt="Selected preview" className="w-full h-full object-cover rounded-xl" />
                            ) : (
                                <>
                                    <Camera className="w-12 h-12 mb-3 text-slate-500" />
                                    <span>Click to upload an image</span>
                                    <span className="text-sm">PNG, JPG, WEBP (Max 2MB)</span>
                                </>
                            )}
                        </label>
                        <input id="image-upload" type="file" accept="image/png, image/jpeg, image/webp" className="hidden" onChange={handleImageChange} />
                    </div>

                    {imageFile && (
                        <button onClick={generateCaption} disabled={isLoading} className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold py-3 rounded-lg">
                            {isLoading ? "Generating..." : "Generate Caption"}
                        </button>
                    )}

                    {error && <p className="text-red-400 text-sm mt-4 text-center">{error}</p>}

                    {showResult && (
                        <div className="mt-8">
                            <h2 className="text-lg font-semibold text-slate-300 mb-3 text-center">Your AI Caption ✨</h2>
                            <div className="relative p-5 bg-slate-900/80 rounded-lg border border-slate-700">
                                {isLoading ? (
                                    <div className="text-slate-400">Thinking of the perfect words...</div>
                                ) : (
                                    <>
                                        <p className="text-white text-center text-xl font-medium">"{caption}"</p>
                                        <button onClick={copyToClipboard} className="absolute top-2 right-2 p-2 text-slate-400">Copy</button>
                                    </>
                                )}
                            </div>
                            {copySuccess && <p className="text-green-400 text-sm mt-2 text-right">{copySuccess}</p>}
                        </div>
                    )}
                </main>
              <footer style={{ textAlign: "center", padding: "1rem", fontSize: "0.9rem", color: "#777" }}>
                © 2025 <strong>CaptionSense</strong> · Built with ❤️ by <strong>Vaishnavi</strong>
              </footer>
            </div>
        </div>
    );
}