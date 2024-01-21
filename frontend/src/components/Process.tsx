import client, { RouterInput } from "../utils/trpc";
import { useForm, FormProvider, SubmitHandler } from "react-hook-form";
import { processOptions } from "../utils/types";
import Input from "./Input";

export default function Process({ projectId }: { projectId: string }) {
  const methods = useForm();

  const handlePreProcess: SubmitHandler<any> = (data) => {
    console.log(data);

    // e.preventDefault();
    // const formData = new FormData(e.target);
    // for (const [key, value] of formData) {
    //   console.log(key, value);
    // }

    // console.log(...formData);

    // if (!config) return;

    // console.log(config);

    // client.nerfstudio.process.query({
    //   ...config,
    //   project: projectId,
    // });
  };

  return (
    <div className="card bg-base-300 w-full p-8">
      <h1 className="text-xl">Pre-Process</h1>
      <FormProvider {...methods}>
        <form
          className="form-control gap-4"
          onSubmit={methods.handleSubmit(handlePreProcess)}
        >
          <div className="grid grid-cols-2 gap-4">
            {processOptions.map((option) => (
              <Input input={option} key={option.name} />
            ))}
          </div>
          <button type="submit" className="btn btn-primary self-end">
            Start Processing
          </button>
        </form>
      </FormProvider>
    </div>
  );
}
