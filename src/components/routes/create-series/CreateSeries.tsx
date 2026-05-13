import { useParams } from "react-router-dom";

const CreateSeries = () => {
  const { series_id } = useParams<{ series_id: string }>();
  const isNew = series_id === "new";

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-2xl font-bold">
        {isNew ? "Create Series" : "Edit Series"}
      </h1>
      <p className="text-muted-foreground mt-2">
        series_id: {series_id}
      </p>
    </div>
  );
};

export default CreateSeries;