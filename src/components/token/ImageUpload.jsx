import React, { useState, useCallback } from 'react';
import { Upload, X } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function ImageUpload({ onImageUpload, existingImage }) {
    const [preview, setPreview] = useState(existingImage || null);
    const [dragActive, setDragActive] = useState(false);

    const validateAndUpload = useCallback((file) => {
        if (!file.type.startsWith('image/')) {
            toast.error('Please upload an image file');
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            toast.error('Image must be less than 5MB');
            return;
        }

        const reader = new FileReader();
        reader.onloadend = () => {
            setPreview(reader.result);
            onImageUpload(file);
        };
        reader.readAsDataURL(file);
    }, [onImageUpload]);

    const handleDrag = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    }, []);

    const handleDrop = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        const file = e.dataTransfer.files[0];
        if (file) {
            validateAndUpload(file);
        }
    }, [validateAndUpload]);

    const handleFileInput = (e) => {
        const file = e.target.files[0];
        if (file) {
            validateAndUpload(file);
        }
    };

    const removeImage = () => {
        setPreview(null);
        onImageUpload(null);
    };

    return (
        <div className="space-y-2">
            {!preview ? (
                <div
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                    className={`relative border-2 border-dashed rounded-2xl transition-all duration-300 ${
                        dragActive 
                            ? 'border-teal-400 bg-teal-50/50' 
                            : 'border-gray-200 bg-gray-50/50 hover:border-gray-300'
                    }`}
                >
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileInput}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <div className="flex flex-col items-center justify-center py-12 px-6">
                        <div className="w-16 h-16 mb-4 bg-white rounded-2xl shadow-sm flex items-center justify-center">
                            <Upload className="w-7 h-7 text-teal-500" />
                        </div>
                        <p className="text-sm font-medium text-gray-700 mb-1">
                            Drag and drop here to upload
                        </p>
                        <p className="text-xs text-gray-400">
                            png, jpg 1000x1000 px
                        </p>
                    </div>
                </div>
            ) : (
                <div className="relative rounded-2xl overflow-hidden bg-gray-50 border-2 border-gray-100">
                    <img 
                        src={preview} 
                        alt="Token preview" 
                        className="w-full h-64 object-cover"
                    />
                    <Button
                        onClick={removeImage}
                        size="icon"
                        variant="secondary"
                        className="absolute top-3 right-3 bg-white/90 hover:bg-white shadow-lg"
                    >
                        <X className="w-4 h-4" />
                    </Button>
                </div>
            )}
        </div>
    );
}