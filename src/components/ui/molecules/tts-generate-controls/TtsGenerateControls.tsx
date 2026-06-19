import { useState } from "react";
import { Pecha } from "@/components/ui/shadimport";
import { FiLoader } from "react-icons/fi";
import { AiOutlineSound } from "react-icons/ai";
import {
  DEFAULT_MONLAM_VOICE,
  DEFAULT_TTS_AUDIO_TYPE,
  isEnglishTtsLanguage,
  isTibetanTtsLanguage,
  isTtsSupportedPlanLanguage,
  MONLAM_VOICE_REGIONS,
  type MonlamVoiceName,
  type TtsAudioType,
  TTS_AUDIO_TYPES,
} from "@/lib/ttsConstants";

interface TtsGenerateControlsProps {
  planLanguage: string;
  defaultAudioType?: TtsAudioType;
  isPending?: boolean;
  disabled?: boolean;
  size?: "sm" | "default";
  onGenerate: (options: {
    type?: TtsAudioType;
    voice_name?: MonlamVoiceName;
  }) => void;
}

const TtsGenerateControls = ({
  planLanguage,
  defaultAudioType = DEFAULT_TTS_AUDIO_TYPE,
  isPending = false,
  disabled = false,
  size = "default",
  onGenerate,
}: TtsGenerateControlsProps) => {
  const [audioType, setAudioType] = useState<TtsAudioType>(defaultAudioType);
  const [voiceName, setVoiceName] =
    useState<MonlamVoiceName>(DEFAULT_MONLAM_VOICE);

  const isSupported = isTtsSupportedPlanLanguage(planLanguage);
  const showEnglishOptions = isEnglishTtsLanguage(planLanguage);
  const showTibetanOptions = isTibetanTtsLanguage(planLanguage);
  const isDisabled = disabled || isPending || !isSupported;
  const triggerClassName =
    size === "sm" ? "w-[160px] h-9" : "w-full sm:w-[200px]";

  const handleGenerate = () => {
    onGenerate({
      ...(showEnglishOptions ? { type: audioType } : {}),
      ...(showTibetanOptions ? { voice_name: voiceName } : {}),
    });
  };

  if (!isSupported) {
    return (
      <p className="text-xs text-muted-foreground">
        TTS generation is only available for English and Tibetan plans.
      </p>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {showEnglishOptions && (
        <Pecha.Select
          value={audioType}
          onValueChange={(value) => setAudioType(value as TtsAudioType)}
        >
          <Pecha.SelectTrigger className={triggerClassName}>
            <Pecha.SelectValue />
          </Pecha.SelectTrigger>
          <Pecha.SelectContent>
            {TTS_AUDIO_TYPES.map(({ value, label }) => (
              <Pecha.SelectItem key={value} value={value}>
                {label}
              </Pecha.SelectItem>
            ))}
          </Pecha.SelectContent>
        </Pecha.Select>
      )}

      {showTibetanOptions && (
        <Pecha.Select
          value={voiceName}
          onValueChange={(value) => setVoiceName(value as MonlamVoiceName)}
        >
          <Pecha.SelectTrigger className={triggerClassName}>
            <Pecha.SelectValue />
          </Pecha.SelectTrigger>
          <Pecha.SelectContent>
            {MONLAM_VOICE_REGIONS.map((region) => (
              <Pecha.SelectGroup key={region.label}>
                <Pecha.SelectLabel>{region.label}</Pecha.SelectLabel>
                {region.voices.map((voice) => (
                  <Pecha.SelectItem key={voice.value} value={voice.value}>
                    {voice.label}
                  </Pecha.SelectItem>
                ))}
              </Pecha.SelectGroup>
            ))}
          </Pecha.SelectContent>
        </Pecha.Select>
      )}

      <Pecha.Button
        type="button"
        variant="outline"
        size={size === "sm" ? "sm" : "default"}
        disabled={isDisabled}
        onClick={handleGenerate}
      >
        {isPending ? (
          <FiLoader className="w-4 h-4 animate-spin" />
        ) : (
          <AiOutlineSound className="w-4 h-4" />
        )}
        {isPending ? "Generating..." : "Generate Audio"}
      </Pecha.Button>
    </div>
  );
};

export default TtsGenerateControls;
