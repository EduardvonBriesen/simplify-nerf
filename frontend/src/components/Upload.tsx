import { useEffect, useState } from "react";
import axios from "axios";
import client from "../utils/trpc";

export default function Upload({ projectId }: { projectId: string }) {
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
      `http://localhost:3000/upload/?project=${projectId}`,
      formData,
    );
  };

  const [files, setFiles] = useState<string[]>([]);

  useEffect(() => {
    if (!projectId) return;
    refreshFiles();
  }, [projectId]);

  function refreshFiles() {
    client.project.getData.query({ project: projectId }).then(({ files }) => {
      setFiles(files);
    });
  }

  return (
    <div className="flex w-full flex-col items-center justify-center gap-8">
      <div className="card bg-base-300 w-full p-8">
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
        <div className="flex items-center justify-between pt-4">
          <h1 className="text-xl">Files</h1>
          <button className="btn btn-primary" onClick={refreshFiles}>
            Refresh
          </button>
        </div>
        {files ? (
          <ul className="max-h-96 overflow-y-auto">
            {files.map((file) => (
              <li key={file}>{file}</li>
            ))}
          </ul>
        ) : (
          <div className="text-center">No files found</div>
        )}
      </div>
    </div>
  );
}
