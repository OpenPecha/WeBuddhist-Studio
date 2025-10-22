import outlinepecha from "@/assets/icon/outlinepecha.svg";

export const DefaultDayView = () => {
  return (
    <div className=" w-full h-full flex  space-y-2 flex-col items-center justify-center border">
      <div className=" opacity-20 dark:opacity-100">
        <img src={outlinepecha} alt="pecha outline" height={100} width={100} />
      </div>
      <div className="text-center">
        <p className="text-lg ">No tasks created for Day</p>
        <p className="text-sm text-gray-500">
          Click the + icon next to the day to add your first task
        </p>
      </div>
    </div>
  );
};
