const fontConfig = {
  en: {
    fontDynamic: {
      fontFamily: "InterRegular",
    },
  },
  "bo-IN": {
    fontDynamic: {
      fontFamily: "MonlamUniOuChan2",
    }
  },
};

export const setFontVariables = (language: string) => {
  const root = document.getElementById("root");
  const fonts = fontConfig[language as keyof typeof fontConfig] || fontConfig["en"];
  
  Object.entries(fonts).forEach(([key, styles]) => {
    const cssVarName = `--${key}-font-family`;
    root?.style.setProperty(cssVarName, styles.fontFamily);
  });
};

export default fontConfig;
