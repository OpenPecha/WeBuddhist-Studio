export const TTS_AUDIO_TYPES = [
  { value: "RECITATION", label: "Recitation" },
  { value: "INSTRUCTION", label: "Instruction" },
  { value: "TEXT_READING", label: "Text Reading" },
] as const;

export type TtsAudioType = (typeof TTS_AUDIO_TYPES)[number]["value"];

export const MONLAM_VOICE_REGIONS = [
  {
    label: "Lhasa",
    voices: [
      { value: "dolkar_lhasa_female", label: "Dolkar" },
      { value: "yangchen_lhasa_female", label: "Yangchen" },
      { value: "darjeeyalphel_lhasa_male", label: "Darjeeyalphel" },
      { value: "histry_lhasa_male", label: "Histry" },
      { value: "sonamtsering_lhasa_male", label: "Sonamtsering" },
    ],
  },
  {
    label: "Amdo",
    voices: [
      { value: "dolma_amdo_female", label: "Dolma" },
      { value: "kid_amdo_female", label: "Kid" },
      { value: "buddhahistory_amdo_male", label: "Buddhahistory" },
      { value: "history_amdo_male", label: "History" },
      { value: "kalsang_gyatso_amdo_male", label: "Kalsang Gyatso" },
    ],
  },
  {
    label: "Kham",
    voices: [
      { value: "kotheke_kham_male", label: "Kotheke" },
      { value: "tibet_tongue_kham_male", label: "Tibet Tongue" },
      { value: "tsering_wangmo_kham_female", label: "Tsering Wangmo" },
      { value: "wangdontso_kham_female", label: "Wangdontso" },
    ],
  },
] as const;

export type MonlamVoiceName =
  (typeof MONLAM_VOICE_REGIONS)[number]["voices"][number]["value"];

export const DEFAULT_MONLAM_VOICE: MonlamVoiceName = "dolkar_lhasa_female";
export const DEFAULT_TTS_AUDIO_TYPE: TtsAudioType = "TEXT_READING";

/** Map plan UI language codes (EN, BO, …) to TTS API language (en, bo, …). */
export function planLanguageToTtsApiLanguage(language: string): string {
  const normalized = language.trim().toUpperCase();
  if (normalized === "EN" || normalized.startsWith("EN")) return "en";
  if (normalized === "BO" || normalized.startsWith("BO")) return "bo";
  if (normalized === "ZH" || normalized.startsWith("ZH")) return "zh";
  return language.trim().toLowerCase();
}

export function isTtsSupportedPlanLanguage(language: string): boolean {
  const apiLanguage = planLanguageToTtsApiLanguage(language);
  return apiLanguage === "en" || apiLanguage === "bo";
}

export function isEnglishTtsLanguage(language: string): boolean {
  return planLanguageToTtsApiLanguage(language) === "en";
}

export function isTibetanTtsLanguage(language: string): boolean {
  return planLanguageToTtsApiLanguage(language) === "bo";
}
