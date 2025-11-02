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
          {selectedFile && (
            <div className="text-center h-32 p-3 w-full items-center flex justify-start gap-x-2">
              <img
                src={URL.createObjectURL(selectedFile)}
                alt={selectedFile.name}
                className="rounded-lg h-full border w-32 object-cover"
              />
              <div className="flex text-start flex-col gap-2 w-xs">
                <p className="text-ellipsis overflow-hidden whitespace-nowrap">
                  {selectedFile?.name}
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="default"
                    onClick={() => {
                      setIsCropOpen(true);
                    }}
                    className="px-5 py-2 bg-[#A51C21] text-white rounded cursor-pointer hover:bg-[#A51C21]/90 transition-colors"
                  >
                    Crop
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setSelectedFile(null)}
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
          </div>
        </>
      )}
    </div>
  );
};

export default ImageContentData;
