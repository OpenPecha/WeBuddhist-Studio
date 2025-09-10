import { useState } from "react";
import { IoMdAdd, IoMdVideocam, IoMdClose } from "react-icons/io";
import { IoMusicalNotesSharp, IoTextOutline } from "react-icons/io5";
import { MdOutlineImage } from "react-icons/md";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/atoms/dialog";
import ImageContentData from "@/components/ui/molecules/modals/image-upload/ImageContentData";

interface TaskFormProps {
  selectedDay: number;
}

const TaskForm = ({ selectedDay: _selectedDay }: TaskFormProps) => {
  const [title, setTitle] = useState("");
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isImageDialogOpen, setIsImageDialogOpen] = useState(false);

  const handleImageUpload = (file: File) => {
    const imageUrl = URL.createObjectURL(file);
    setImagePreview(imageUrl);
    setSelectedImage(file);
    setIsImageDialogOpen(false);
  };

  const handleRemoveImage = () => {
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }
    setSelectedImage(null);
    setImagePreview(null);
  };

  return (
    <div className="max-w-xl">
      <h2 className="text-2xl font-semibold mb-6" style={{ color: "#413F3F" }}>
        Add Task
      </h2>

      <form className="space-y-6">
        <div>
          <input
            type="text"
            placeholder="Task Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex gap-4">
          <button
            type="button"
            className="p-3 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <IoMdAdd className="w-5 h-5 text-gray-600" />
          </button>
          <div className="flex border border-gray-300 rounded-lg overflow-hidden w-fit">
            <button
              type="button"
              className="p-3 hover:bg-gray-50 border-gray-300"
              onClick={() => setIsImageDialogOpen(true)}
            >
              <MdOutlineImage className="w-5 h-5 text-gray-600" />
            </button>
            <button
              type="button"
              className="p-3 hover:bg-gray-50 border-gray-300"
            >
              <IoMusicalNotesSharp className="w-5 h-5 text-gray-600" />
            </button>
            <button
              type="button"
              className="p-3 hover:bg-gray-50 border-gray-300"
            >
              <IoMdVideocam className="w-5 h-5 text-gray-600" />
            </button>
            <button
              type="button"
              className="p-3 hover:bg-gray-50 border-gray-300"
            >
              <IoTextOutline className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>
        <button
          type="submit"
          className="bg-[#A51C21] text-white px-8 py-3 rounded-lg font-medium hover:bg-[#8B1419] transition-colors"
        >
          Submit
        </button>
      </form>

      {imagePreview && (
        <div className="relative w-fit mt-4">
          <img
            src={imagePreview}
            alt="Task image preview"
            className="w-48 h-32 object-cover rounded-lg border"
          />
          <div className="flex items-center justify-between absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent rounded-b-lg p-2">
            {selectedImage && (
              <p className="text-xs text-white truncate max-w-32">
                {selectedImage.name}
              </p>
            )}
            <button
              type="button"
              onClick={handleRemoveImage}
              className="text-white cursor-pointer rounded-full p-1 transition-colors ml-2"
            >
              <IoMdClose className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      <Dialog open={isImageDialogOpen} onOpenChange={setIsImageDialogOpen}>
        <DialogContent showCloseButton={true}>
          <DialogHeader>
            <DialogTitle>Upload & Crop Image</DialogTitle>
          </DialogHeader>
          <ImageContentData onUpload={handleImageUpload} />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TaskForm;
