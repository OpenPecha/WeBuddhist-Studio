import { Button } from "@/components/ui/atoms/button";
import { Input } from "@/components/ui/atoms/input";
import { useState, useCallback } from "react";
import Cropper from "react-easy-crop";

interface ImageCropContentProps {
  imageSrc: string;
  onBack: () => void;
  onCropComplete: (image: Blob) => void;
  isProfilePage?: boolean;
}

const createImage = (url: string) =>
  new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new window.Image();
    image.addEventListener("load", () => resolve(image));
    image.addEventListener("error", (error) =>
      reject(
        new Error(
          error instanceof ErrorEvent && error.message
            ? error.message
            : "Image load error",
        ),
      ),
    );
    image.setAttribute("crossOrigin", "anonymous");
    image.src = url;
  });

const getCroppedImg = async (imageSrc: string, pixelCrop: any) => {
  const image = await createImage(imageSrc);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;
  ctx.drawImage(
    image as CanvasImageSource,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height,
  );
  return new Promise<Blob | null>((resolve) => {
    canvas.toBlob((file) => {
      resolve(file);
    }, "image/jpeg");
  });
};

const CropContainer = ({
  imageSrc,
  crop,
  zoom,
  onCropChange,
  onCropComplete,
  onZoomChange,
  isProfilePage,
}: {
  imageSrc: string;
  crop: { x: number; y: number };
  zoom: number;
  onCropChange: (crop: { x: number; y: number }) => void;
  onCropComplete: (_: any, croppedAreaPixels: any) => void;
  onZoomChange: (zoom: number) => void;
  isProfilePage?: boolean;
}) => (
  <div className="relative w-full h-96 bg-[#b23434] dark:bg-[#c44848]">
    <Cropper
      image={imageSrc}
      crop={crop}
      zoom={zoom}
      onCropChange={onCropChange}
      onCropComplete={onCropComplete}
      onZoomChange={onZoomChange}
      cropShape={isProfilePage ? "round" : "rect"}
      showGrid={true}
    />
  </div>
);

const CropControls = ({
  zoom,
  onZoomChange,
}: {
  zoom: number;
  onZoomChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) => (
  <div className="p-4 border-t border-[#eee] dark:bg-[#111111] dark:border-[#222222] bg-[#fafafa]">
    <div className="mb-4 last:mb-0">
      <label className="block text-sm mb-2 text-[#666] dark:text-[#d4d4d4] font-bold">
        Zoom: {Math.round(zoom * 100)}%
      </label>
      <Input
        type="range"
        value={zoom}
        min={1}
        max={3}
        step={0.1}
        onChange={onZoomChange}
        className="w-full h-2 rounded-sm outline-none bg-[#ddd] opacity-70 transition-opacity appearance-none hover:opacity-100"
      />
    </div>
  </div>
);

const CropActions = ({
  onBack,
  onCropConfirm,
  disabled,
}: {
  onBack: () => void;
  onCropConfirm: () => void;
  disabled: boolean;
}) => (
  <div className="flex float-end gap-4 p-4 border-t border-[#eee] dark:border-[#222222]">
    <Button className="flex-1" variant="outline" onClick={onBack}>
      Back
    </Button>
    <Button
      variant="default"
      className="bg-[#A51C21] hover:bg-[#A51C21]/90 flex-1 text-white"
      onClick={onCropConfirm}
      disabled={disabled}
    >
      Apply Crop
    </Button>
  </div>
);

const ImageCropContent = ({
  imageSrc,
  onBack,
  onCropComplete,
  isProfilePage = false,
}: ImageCropContentProps) => {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);

  const handleCropComplete = useCallback((_: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleCropConfirm = useCallback(async () => {
    try {
      const croppedImageBlob = await getCroppedImg(imageSrc, croppedAreaPixels);
      if (croppedImageBlob) onCropComplete(croppedImageBlob);
    } catch (e) {
      console.error("Error cropping image:", e);
    }
  }, [croppedAreaPixels, imageSrc, onCropComplete]);

  const handleZoomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setZoom(Number(e.target.value));
  };

  return (
    <div className="flex flex-col flex-1 ">
      <CropContainer
        imageSrc={imageSrc}
        crop={crop}
        zoom={zoom}
        onCropChange={setCrop}
        onCropComplete={handleCropComplete}
        onZoomChange={setZoom}
        isProfilePage={isProfilePage}
      />
      <CropControls zoom={zoom} onZoomChange={handleZoomChange} />
      <CropActions
        onBack={onBack}
        onCropConfirm={handleCropConfirm}
        disabled={!croppedAreaPixels}
      />
    </div>
  );
};

export default ImageCropContent;
