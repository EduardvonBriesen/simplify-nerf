import { useState } from "react";
import axios from "axios";

export default function Upload({ activeProject }: { activeProject: string }) {
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);

  const handleFileUpload = async (event: any) => {
    event.preventDefault();

    if (!selectedFiles) {
      alert("Please select files to upload");
      return;
    }

    const formData = new FormData();
    for (let i = 0; i < selectedFiles.length; i++) {
      formData.append("files", selectedFiles[i], selectedFiles[i].name);
    }

    await axios.post(
      `http://localhost:3000/upload/?project=${activeProject}`,
      formData,
    );
  };

  return (
    <div className="flex w-full flex-col items-center justify-center gap-8">
      <div className="card w-full bg-slate-700 p-8">
        <h1 className="pb-4 text-xl">Upload File</h1>
        <form className="flex justify-evenly gap-4" onSubmit={handleFileUpload}>
          <input
            className="file-input file-input-bordered file-input-primary w-full"
            name="file"
            type="file"
            multiple
            onChange={(e) => setSelectedFiles(e.target.files)}
          />
          <button className="btn btn-primary" type="submit">
            Upload
          </button>
        </form>
      </div>
    </div>
  );
}
