import { Button } from "@/components/ui/atoms/button";

type GroupImageFieldProps = {
  label: string;
  displayUrl: string | null;
  hasStoredImage: boolean;
  onUploadClick: () => void;
  imageClassName: string;
};

const GroupImageField = ({
  label,
  displayUrl,
  hasStoredImage,
  onUploadClick,
  imageClassName,
}: GroupImageFieldProps) => (
  <div className="space-y-2">
    <p className="text-sm font-bold">{label}</p>
    <div className="flex flex-col gap-3">
      {displayUrl ? (
        <img src={displayUrl} alt={label} className={imageClassName} />
      ) : null}
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="w-fit"
        onClick={onUploadClick}
      >
        {hasStoredImage ? `Change ${label.toLowerCase()}` : `Upload ${label.toLowerCase()}`}
      </Button>
    </div>
  </div>
);

export default GroupImageField;
