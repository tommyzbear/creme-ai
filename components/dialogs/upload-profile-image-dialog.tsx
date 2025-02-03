"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { useToast } from "@/hooks/use-toast";
import { Upload, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { useUserStore } from "@/stores/use-user-store";

interface UploadProfileImageDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function UploadProfileImageDialog({ open, onOpenChange }: UploadProfileImageDialogProps) {
    const [isUploading, setIsUploading] = useState(false);
    const [preview, setPreview] = useState<string | null>(null);
    const { uploadProfileImage } = useUserStore();
    const { toast } = useToast();

    const onDrop = useCallback(async (acceptedFiles: File[]) => {
        const file = acceptedFiles[0];
        if (!file) return;

        // Create preview
        const objectUrl = URL.createObjectURL(file);
        setPreview(objectUrl);

        setIsUploading(true);
        try {
            await uploadProfileImage(file);

            toast({
                title: "Success",
                description: "Profile image updated successfully",
            });
            onOpenChange(false);
        } catch (error) {
            console.error('Upload failed:', error);
            toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to upload image. Please try again.",
            });
        } finally {
            setIsUploading(false);
            URL.revokeObjectURL(preview || '');
        }
    }, [toast, onOpenChange, preview, uploadProfileImage]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'image/*': ['.jpeg', '.jpg', '.png', '.gif']
        },
        maxFiles: 1,
        multiple: false
    });

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md rounded-3xl">
                <DialogHeader>
                    <DialogTitle>Upload Profile Picture</DialogTitle>
                </DialogHeader>

                <div
                    {...getRootProps()}
                    className={`
                        mt-4 p-8 border-2 border-dashed rounded-lg 
                        transition-colors duration-200 ease-in-out cursor-pointer
                        ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}
                    `}
                >
                    <input {...getInputProps()} />
                    <div className="flex flex-col items-center justify-center space-y-4">
                        <AnimatePresence mode="wait">
                            {isUploading ? (
                                <motion.div
                                    key="uploading"
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.8 }}
                                    className="flex flex-col items-center space-y-2"
                                >
                                    <Loader2 className="h-10 w-10 text-blue-500 animate-spin" />
                                    <p className="text-sm text-muted-foreground">Uploading...</p>
                                </motion.div>
                            ) : preview ? (
                                <motion.div
                                    key="preview"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="relative w-32 h-32"
                                >
                                    <Image
                                        src={preview}
                                        alt="Preview"
                                        fill
                                        className="rounded-full object-cover"
                                    />
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="upload"
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.8 }}
                                    className="flex flex-col items-center space-y-2"
                                >
                                    <Upload className="h-10 w-10 text-blue-500" />
                                    <p className="text-sm text-center text-muted-foreground">
                                        Drag & drop an image here, or click to select
                                    </p>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
} 