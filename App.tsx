
import React, { useState, useCallback } from 'react';
import { Header } from './components/Header';
import { ImageCard } from './components/ImageCard';
import { Loader } from './components/Loader';
import { ControlsPanel } from './components/ControlsPanel';
import type { GeneratedImage, AppSettings, ActiveTab } from './types';
import { generateImage, editImage } from './services/geminiService';
import { Toast } from './components/Toast';

const sampleImages: GeneratedImage[] = [
  { id: 'sample-1', url: 'https://picsum.photos/seed/ivony1/512', prompt: 'A futuristic cityscape at dusk, neon lights reflecting on wet streets.' },
  { id: 'sample-2', url: 'https://picsum.photos/seed/ivony2/512', prompt: 'An abstract painting of a roaring lion, rendered in fiery colors.' },
  { id: 'sample-3', url: 'https://picsum.photos/seed/ivony3/512', prompt: 'Anime character with silver hair and glowing red eyes, standing in a cherry blossom forest.' },
  { id: 'sample-4', url: 'https://picsum.photos/seed/ivony4/512', prompt: 'A hyper-realistic photo of a dew-covered spider web at sunrise.' },
];

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('generate');
  const [prompt, setPrompt] = useState<string>('');
  const [uploadedImage, setUploadedImage] = useState<{ file: File; dataUrl: string } | null>(null);
  const [settings, setSettings] = useState<AppSettings>({ style: 'Realistic', aspectRatio: '1:1' });
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleImageAction = useCallback(async () => {
    if (!prompt.trim()) {
      setError('Please enter a prompt.');
      return;
    }

    if (activeTab === 'edit' && !uploadedImage) {
      setError('Please upload an image to edit.');
      return;
    }
    
    setIsLoading(true);
    setError(null);

    try {
      let newImageBase64: string;
      if (activeTab === 'generate') {
        newImageBase64 = await generateImage(prompt, settings.style, settings.aspectRatio);
      } else if (activeTab === 'edit' && uploadedImage) {
        newImageBase64 = await editImage(prompt, uploadedImage.dataUrl);
      } else {
        throw new Error("Invalid state for image action.");
      }

      const newImage: GeneratedImage = {
        id: `img-${Date.now()}`,
        url: `data:image/png;base64,${newImageBase64}`,
        prompt: prompt,
      };
      setGeneratedImages(prev => [newImage, ...prev]);
      setPrompt('');

    } catch (err) {
      console.error(err);
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
      setError(`Failed to generate image. Please try again. Error: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  }, [prompt, settings.style, settings.aspectRatio, activeTab, uploadedImage]);
  
  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 3000);
  };

  return (
    <div className="min-h-screen bg-stone-950 text-stone-200 font-sans antialiased">
      <div className="absolute inset-0 z-0 overflow-hidden">
        <div className="absolute top-0 left-0 w-1/2 h-1/2 bg-gradient-to-br from-red-900/30 to-transparent blur-3xl opacity-50"></div>
        <div className="absolute bottom-0 right-0 w-1/2 h-1/2 bg-gradient-to-tl from-red-900/20 to-transparent blur-3xl opacity-40"></div>
      </div>
      
      <div className="relative z-10 flex flex-col min-h-screen">
        <Header />
        
        <main className="flex-grow container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-4">
              <ControlsPanel
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                prompt={prompt}
                setPrompt={setPrompt}
                settings={settings}
                setSettings={setSettings}
                isLoading={isLoading}
                onSubmit={handleImageAction}
                uploadedImage={uploadedImage}
                setUploadedImage={setUploadedImage}
                error={error}
                setError={setError}
              />
            </div>

            <div className="lg:col-span-8">
              <div className="bg-stone-900/50 rounded-lg p-6 min-h-[60vh] backdrop-blur-sm border border-stone-800">
                {isLoading && <Loader />}

                {!isLoading && generatedImages.length === 0 && (
                  <div className="text-center text-stone-400 flex flex-col justify-center items-center h-full">
                    <h2 className="text-2xl font-bold text-stone-200 mb-4">Welcome to Ivony</h2>
                    <p className="mb-8 max-w-lg">Your creative journey begins here. Generate a new image or edit your own using the controls on the left. Here are some samples for inspiration.</p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full">
                      {sampleImages.map(img => (
                        <div key={img.id} className="group relative rounded-lg overflow-hidden">
                          <img src={img.url} alt={img.prompt} className="aspect-square object-cover w-full h-full transition-transform duration-300 group-hover:scale-110" />
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-2">
                            <p className="text-xs text-white/90">{img.prompt}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {!isLoading && generatedImages.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                    {generatedImages.map(image => (
                      <ImageCard key={image.id} image={image} onCopy={() => showToast('Shareable link copied!')} />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
      {toastMessage && <Toast message={toastMessage} />}
    </div>
  );
}
