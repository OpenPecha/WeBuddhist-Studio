import pechaIcon from "../../../assets/icon/pecha_icon.png";

interface ContainerLayoutProps {
  children: React.ReactNode;
  title?: string;
}

const ContainerLayout = ({ children, title }: ContainerLayoutProps) => {
  return (
    <div className="flex bg-[#F5F5F5] dark:bg-[#181818]">
      <div className="min-h-screen flex-1 font-dynamic relative flex flex-col items-center justify-between">
        <div className="rounded-sm h-full w-[500px] flex flex-col items-left justify-center p-8 relative z-10">
          <div className="flex items-center gap-2 mb-2 w-full">
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
          <p className="text-lg font-bold">Welcome to Webuddhist Studio</p>
          {title && (
            <div className="text-sm text-[#919191] mb-6 text-left w-full relative z-10">
              {title}
            </div>
          )}
          <div className="relative z-10 w-full">{children}</div>
        </div>
        <div />
      </div>
      <div className="flex-1 md:flex items-center justify-center hidden">
        <div className="grid grid-cols-4 w-full h-full font-dutsa">
          {[
            "ཀ",
            "ཁ",
            "ག",
            "ང",
            "ཅ",
            "ཆ",
            "ཇ",
            "ཉ",
            "ཏ",
            "ཐ",
            "ད",
            "ན",
            "པ",
            "ཕ",
            "བ",
            "མ",
            "ཙ",
            "ཚ",
            "ཛ",
            "ཝ",
            "ཞ",
            "ཟ",
            "འ",
            "ཡ",
            "ར",
            "ལ",
            "ཤ",
            "ས",
            "ཧ",
            "ཨ",
            "།",
            "༄",
          ].map((letter, index) => (
            <div
              key={index}
              className="flex items-center border border-dashed justify-center text-2xl dark:text-[#919191] text-[#515151] hover:bg-input/30 dark:hover:bg-[#919191]/10 dark:hover:text-white cursor-pointer transition duration-300 ease-in-out "
            >
              {letter}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ContainerLayout;
