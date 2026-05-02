import { Button } from "@/components/ui/atoms/button";
import { useState } from "react";
import Dropzone from "react-dropzone";
import ImageCropContent from "./image-crop/ImageCropModal";

interface ImageContentDataProps {
  onCropClick?: (file: File) => void;
  onUpload?: (file: File) => void;
}

const ImageContentData = ({ onCropClick, onUpload }: ImageContentDataProps) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isCropOpen, setIsCropOpen] = useState(false);

  const handleCropComplete = (croppedBlob: Blob) => {
    const croppedFile = new File(
      [croppedBlob],
      selectedFile?.name || "cropped.jpg",
      { type: "image/jpeg" },
    );
    setSelectedFile(croppedFile);
    setIsCropOpen(false);
    if (onCropClick) onCropClick(croppedFile);
  };

  return (
    <div className="space-y-4">
      {isCropOpen && selectedFile ? (
        <ImageCropContent
          imageSrc={URL.createObjectURL(selectedFile)}
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
                    className="border border-dashed border-gray-300 h-32 hover:border-gray-400 transition-colors rounded-lg p-6 flex items-center justify-center cursor-pointer mb-4"
                  >
                    <input {...getInputProps()} />
                    <p>Drag & drop an image here, or click to select</p>
                  </div>
                </section>
              )}
            </Dropzone>
          ) : (
            <div className="w-full flex flex-col gap-3">
              <div className="rounded-lg border border-gray-200 overflow-hidden bg-gray-50">
                <img
                  src={URL.createObjectURL(selectedFile)}
                  alt={selectedFile.name}
                  className="w-full h-48 object-cover"
                />
              </div>
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-medium text-gray-700 truncate flex-1 min-w-0">
                  {selectedFile?.name}
                </p>
                <div className="flex gap-2 shrink-0">
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => {
                      setIsCropOpen(true);
                    }}
                    className="bg-[#A51C21] text-white hover:bg-[#A51C21]/90 transition-colors"
                  >
                    Crop
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedFile(null)}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            </div>
          )}

          <Button
            variant="default"
            className=" bg-[#A51C21] w-full py-6 font-medium dark:text-white  hover:bg-[#A51C21]/90"
            onClick={() => {
              if (selectedFile && onUpload) {
                onUpload(selectedFile);
              }
            }}
            disabled={!selectedFile}
          >
            Upload
          </Button>
        </>
      )}
    </div>
  );
};

export default ImageContentData;
