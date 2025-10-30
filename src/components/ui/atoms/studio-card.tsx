import { useTheme } from "@/providers/theme-provider";
import pechaIcon from "../../../assets/icon/pecha_icon.png";

interface StudioCardProps {
  children: React.ReactNode;
  title?: string;
}

const StudioCard = ({ children, title }: StudioCardProps) => {
  const { theme } = useTheme();
  return (
    <div className="min-h-screen font-dynamic border relative flex flex-col items-center justify-between p-4">
      <div className=" w-full  flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-[40px] h-[40px] rounded-full flex items-center justify-center">
            <img
              src={pechaIcon}
              alt="Pecha Studio Logo"
              className="object-contain"
            />
          </div>
          <div>
            <h1 className="font-semibold font-inter text-sm">
              Webuddhist Studio
            </h1>
            <p className="text-sm text-left font-inter">
              Learn, live and share Buddhist wisdom daily
            </p>
          </div>
        </div>
      </div>
      {theme === "light" && <LightThemeOverlay />}
      <div className="rounded-sm w-[500px] flex flex-col items-left justify-center p-8 relative z-10">
        <p className="text-xl">Welcome to Webuddhist Studio</p>
        {title && (
          <div className="text-sm text-[#919191] mb-6 text-left w-full relative z-10">
            {title}
          </div>
        )}
        <div className="relative z-10 w-full">{children}</div>
      </div>
      <div />
    </div>
  );
};

export default StudioCard;

const LightThemeOverlay = () => {
  return (
    <div
      className="absolute inset-0 z-0"
      style={{
        backgroundImage: `
        linear-gradient(to right, #e7e5e4 1px, transparent 1px),
        linear-gradient(to bottom, #e7e5e4 1px, transparent 1px)
      `,
        backgroundSize: "20px 20px",
        backgroundPosition: "0 0, 0 0",
        maskImage: `
        repeating-linear-gradient(
              to right,
              black 0px,
              black 3px,
              transparent 3px,
              transparent 8px
            ),
            repeating-linear-gradient(
              to bottom,
              black 0px,
              black 3px,
              transparent 3px,
              transparent 8px
            ),
            radial-gradient(ellipse 80% 80% at 0% 0%, #000 50%, transparent 90%)
      `,
        WebkitMaskImage: `
  repeating-linear-gradient(
              to right,
              black 0px,
              black 3px,
              transparent 3px,
              transparent 8px
            ),
            repeating-linear-gradient(
              to bottom,
              black 0px,
              black 3px,
              transparent 3px,
              transparent 8px
            ),
            radial-gradient(ellipse 80% 80% at 0% 0%, #000 50%, transparent 90%)
      `,
        maskComposite: "intersect",
        WebkitMaskComposite: "source-in",
      }}
    />
  );
};
