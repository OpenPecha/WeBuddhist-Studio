import { Pecha } from "@/components/ui/shadimport";
import ImageContentData from "@/components/ui/molecules/modals/image-upload/ImageContentData";

type ImageUploadDialogProps = {
  open: boolean;
  isUploading: boolean;
  onOpenChange: (open: boolean) => void;
  onUpload: (file: File) => void;
};

const ImageUploadDialog = ({
  open,
  isUploading,
  onOpenChange,
  onUpload,
}: ImageUploadDialogProps) => (
  <Pecha.Dialog open={open} onOpenChange={onOpenChange}>
    <Pecha.DialogContent showCloseButton={true}>
      <Pecha.DialogHeader>
        <Pecha.DialogTitle>Upload &amp; crop image</Pecha.DialogTitle>
      </Pecha.DialogHeader>
      <ImageContentData onUpload={onUpload} isLoading={isUploading} />
    </Pecha.DialogContent>
  </Pecha.Dialog>
);

export default ImageUploadDialog;
