const fontConfig = {
  en: {
    "font-dynamic": {
      fontFamily: "InterRegular",
    },
  },
  "bo-IN": {
    "font-dynamic": {
      fontFamily: "MonlamUniOuChan2",
    },
  },
};

export const setFontVariables = (language: string) => {
  const root = document.getElementById("root");
  const fonts =
    fontConfig[language as keyof typeof fontConfig] || fontConfig["en"];

  Object.entries(fonts).forEach(([key, styles]) => {
    const cssVarName = `--${key}-font-family`;
    root?.style.setProperty(cssVarName, styles.fontFamily);
  });
};

export default fontConfig;
