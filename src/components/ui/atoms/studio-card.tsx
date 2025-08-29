import pechaIcon from "../../../assets/icon/pecha_icon.png";

interface StudioCardProps {
  children: React.ReactNode;
  title?: string;
}

const StudioCard = ({ children, title }: StudioCardProps) => {
  return (
    <div className="min-h-screen font-dynamic flex items-center justify-center p-4 bg-dots">
      <div className="rounded-3xl bg-white dark:bg-[#1C1C1C] w-full max-w-[460px] border border-gray-200 dark:border-[#3D3D3D] flex flex-col items-center justify-center p-8">
        <div className="flex items-center mb-4">
          <div className="w-[60px] h-[60px] rounded-full flex items-center justify-center">
            <img
              src={pechaIcon}
              alt="Pecha Studio Logo"
              className="object-contain"
            />
          </div>
          <div>
            <h1 className="font-semibold font-inter text-xl">
              Webuddhist Studio
            </h1>
            <p className="text-sm text-center font-inter">
              Learn, live and share Buddhist wisdom daily
            </p>
          </div>
        </div>
        {title && (
          <div className="text-sm text-gray-400 mb-2.5 text-center w-full">
            {title}
          </div>
        )}
        {children}
      </div>
    </div>
  );
};

export default StudioCard;
