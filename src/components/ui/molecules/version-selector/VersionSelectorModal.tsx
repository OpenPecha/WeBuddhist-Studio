import { Pecha } from "@/components/ui/shadimport";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  fetchTextLanguages,
  fetchLanguageVersions,
} from "@/components/api/searchApi";
import { createOrUpdatePreset } from "@/components/routes/task/api/presetApi";
import { toast } from "sonner";

interface VersionSelectorModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  textId: string;
  subtaskId?: string;
  onSuccess?: (versionId: string, language: string) => void;
}

export const VersionSelectorModal = ({
  isOpen,
  onOpenChange,
  textId,
  subtaskId,
  onSuccess,
}: VersionSelectorModalProps) => {
  const [selectedLanguage, setSelectedLanguage] = useState<string>("");
  const [selectedVersion, setSelectedVersion] = useState<string>("");
  const [isSaving, setIsSaving] = useState(false);

  const { data: languagesData, isLoading: isLoadingLanguages } = useQuery({
    queryKey: ["textLanguages", textId],
    queryFn: () => fetchTextLanguages(textId),
    enabled: isOpen && !!textId,
  });

  const { data: versionsData, isLoading: isLoadingVersions } = useQuery({
    queryKey: ["languageVersions", textId, selectedLanguage],
    queryFn: () => fetchLanguageVersions(textId, selectedLanguage),
    enabled: isOpen && !!selectedLanguage,
  });

  const handleSave = async () => {
    if (!selectedVersion || !selectedLanguage) {
      toast.error("Please select both language and version");
      return;
    }

    setIsSaving(true);
    try {
      if (subtaskId) {
        await createOrUpdatePreset(subtaskId, {
          version_id: selectedVersion,
          language: selectedLanguage,
        });
        toast.success("Version preset saved successfully");
      }
      onOpenChange(false);
      if (onSuccess) {
        onSuccess(selectedVersion, selectedLanguage);
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.detail || "Failed to save preset");
    } finally {
      setIsSaving(false);
    }
  };

  const handleClose = () => {
    setSelectedLanguage("");
    setSelectedVersion("");
    onOpenChange(false);
  };

  const availableLanguages = languagesData?.available_languages || [];
  const availableVersions = versionsData?.available_versions || [];

  return (
    <Pecha.Sheet open={isOpen} onOpenChange={handleClose}>
      <Pecha.SheetContent className="sm:max-w-md">
        <Pecha.SheetHeader>
          <Pecha.SheetTitle>Select Text Version</Pecha.SheetTitle>
          <Pecha.SheetDescription>
            Choose a language and version for this text reference
          </Pecha.SheetDescription>
        </Pecha.SheetHeader>

        <div className="space-y-4 py-4">
          {/* Language Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Language</label>
            {isLoadingLanguages ? (
              <div className="text-sm text-gray-500">Loading languages...</div>
            ) : availableLanguages.length === 0 ? (
              <div className="text-sm text-gray-500">
                No versions available for this text
              </div>
            ) : (
              <Pecha.Select
                value={selectedLanguage}
                onValueChange={(value) => {
                  setSelectedLanguage(value);
                  setSelectedVersion("");
                }}
              >
                <Pecha.SelectTrigger>
                  <Pecha.SelectValue placeholder="Select a language" />
                </Pecha.SelectTrigger>
                <Pecha.SelectContent>
                  {availableLanguages.map((lang: any) => (
                    <Pecha.SelectItem
                      key={lang.language_code}
                      value={lang.language_code}
                    >
                      {lang.language} ({lang.version_count} version
                      {lang.version_count !== 1 ? "s" : ""})
                    </Pecha.SelectItem>
                  ))}
                </Pecha.SelectContent>
              </Pecha.Select>
            )}
          </div>

          {/* Version Selection */}
          {selectedLanguage && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Version</label>
              {isLoadingVersions ? (
                <div className="text-sm text-gray-500">Loading versions...</div>
              ) : (
                <Pecha.Select
                  value={selectedVersion}
                  onValueChange={setSelectedVersion}
                >
                  <Pecha.SelectTrigger>
                    <Pecha.SelectValue placeholder="Select a version" />
                  </Pecha.SelectTrigger>
                  <Pecha.SelectContent>
                    {availableVersions.map((version: any) => (
                      <Pecha.SelectItem key={version.id} value={version.id}>
                        {version.title}
                      </Pecha.SelectItem>
                    ))}
                  </Pecha.SelectContent>
                </Pecha.Select>
              )}
            </div>
          )}
        </div>

        <div className="flex gap-3 mt-6">
          <Pecha.Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={isSaving}
            className="flex-1"
          >
            Cancel
          </Pecha.Button>
          <Pecha.Button
            type="button"
            onClick={handleSave}
            disabled={!selectedVersion || isSaving}
            className="flex-1"
          >
            {isSaving ? "Saving..." : "Save"}
          </Pecha.Button>
        </div>
      </Pecha.SheetContent>
    </Pecha.Sheet>
  );
};
