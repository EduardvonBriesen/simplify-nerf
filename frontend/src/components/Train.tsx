import { useState } from "react";
import { useForm, FormProvider, SubmitHandler } from "react-hook-form";
import client, { RouterInput } from "../utils/trpc";
import { trainingOptions } from "../utils/trainingSetting";
import Input from "./Input";

export default function Train({ projectId }: { projectId: string }) {
  const methods = useForm();
  const [filter, setFilter] = useState<string[] | undefined>();
  const [loading, setLoading] = useState(false);

  const handleTrain: SubmitHandler<RouterInput["nerfstudio"]["train"]> = (
    data,
  ) => {
    console.log(data);
  };

  return (
    <div className="flex w-full flex-col items-center justify-center gap-8">
      <div className="card bg-base-300 w-full p-8">
        <h1 className="pb-4 text-xl">Training</h1>

        <FormProvider {...methods}>
          <form
            className="form-control"
            onSubmit={methods.handleSubmit(handleTrain as any)}
          >
            <div className="grid grid-cols-2 gap-4">
              {trainingOptions
                .filter((option) => !filter || filter.includes(option.name))
                .map((option) => (
                  <Input input={option} key={option.name} filter={filter} />
                ))}
            </div>
            <button
              type="submit"
              className="btn btn-primary w-48 self-end"
              disabled={loading}
            >
              {loading ? (
                <span className="loading loading-spinner"></span>
              ) : (
                "Start Processing"
              )}
            </button>
          </form>
        </FormProvider>
      </div>
    </div>
  );
}
