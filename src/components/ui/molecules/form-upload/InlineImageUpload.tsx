import { Button } from "@/components/ui/atoms/button";
import { useState, useEffect, useRef } from "react";
import Dropzone from "react-dropzone";
import ImageCropContent from "../modals/image-upload/image-crop/ImageCropModal";
import { FiLoader } from "react-icons/fi";

interface InlineImageUploadProps {
  onUpload?: (file: File) => Promise<void> | void;
}

const InlineImageUpload = ({ onUpload }: InlineImageUploadProps) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isCropOpen, setIsCropOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // 🔒 Instant lock to prevent multiple clicks
  const uploadLockRef = useRef(false);

  useEffect(() => {
    if (!selectedFile) {
      setPreviewUrl(null);
      return;
    }

    const url = URL.createObjectURL(selectedFile);
    setPreviewUrl(url);

    return () => URL.revokeObjectURL(url);
  }, [selectedFile]);

  const handleCropComplete = (croppedBlob: Blob) => {
    const croppedFile = new File(
      [croppedBlob],
      selectedFile?.name || "cropped.jpg",
      { type: "image/jpeg" },
    );
    setSelectedFile(croppedFile);
    setIsCropOpen(false);
  };

  const handleUpload = async () => {
    if (!selectedFile || !onUpload) return;

    if (uploadLockRef.current) return;
    uploadLockRef.current = true;

    try {
      setIsUploading(true);
      await onUpload(selectedFile);
      setSelectedFile(null);
      setPreviewUrl(null);
      setIsCropOpen(false);
      setIsUploading(false);
      uploadLockRef.current = false;
    } catch (error) {
      console.error("Error uploading image:", error);
    } finally {
      setIsUploading(false);
      uploadLockRef.current = false;
    }
  };

  return (
    <div className="space-y-4">
      {isCropOpen && selectedFile ? (
        <ImageCropContent
          imageSrc={previewUrl!}
          onBack={() => setIsCropOpen(false)}
          onCropComplete={handleCropComplete}
        />
      ) : (
        <>
          {!selectedFile ? (
            <Dropzone
              accept={{ "image/*": [] }}
              multiple={false}
              onDrop={(acceptedFiles) => {
                if (acceptedFiles && acceptedFiles.length > 0) {
                  setSelectedFile(acceptedFiles[0]);
                }
              }}
            >
              {({ getRootProps, getInputProps }) => (
                <section>
                  <div
                    {...getRootProps()}
                    className="border border-dashed bg-[#FAFAFA] dark:bg-sidebar-secondary h-32 hover:border-gray-400 dark:hover:border-gray-500 transition-colors rounded-lg p-6 flex items-center justify-center cursor-pointer mb-4"
                  >
                    <input {...getInputProps()} />
                    <p>Drag & drop an image here, or click to select</p>
                  </div>
                </section>
              )}
            </Dropzone>
          ) : (
            <div className="flex flex-col gap-3">
              {/* Preview */}
              <div className="rounded-lg border border-gray-200 overflow-hidden bg-gray-50">
                <img
                  src={previewUrl!}
                  alt="preview"
                  className="w-full h-48 object-cover"
                />
              </div>

              {/* File info + actions */}
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-medium text-gray-700 truncate flex-1 min-w-0">
                  {selectedFile?.name}
                </p>

                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => setIsCropOpen(true)}
                    className="bg-[#A51C21] text-white hover:bg-[#A51C21]/90 transition-colors"
                    disabled={isUploading}
                  >
                    Crop
                  </Button>

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setSelectedFile(null)}
                    disabled={isUploading}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-end">
            <Button
              variant="default"
              className="bg-[#A51C21] w-full py-6 font-medium dark:text-white hover:bg-[#A51C21]/90"
              onClick={handleUpload}
              disabled={!selectedFile || isUploading}
            >
              {isUploading && <FiLoader className="h-4 w-4 animate-spin" />}
              {isUploading ? "Uploading..." : "Upload"}
            </Button>
          </div>
        </>
      )}
    </div>
  );
};

export default InlineImageUpload;
