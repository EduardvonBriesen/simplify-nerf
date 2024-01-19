import { useEffect, useState } from "react";
import client from "../utils/trpc";

export default function Files({ activeProject }: { activeProject: string }) {
  const [files, setFiles] = useState<string[]>([]);

  useEffect(() => {
    if (!activeProject) return;
    refreshFiles();
  }, [activeProject]);

  function refreshFiles() {
    client.project.getData
      .query({ project: activeProject })
      .then(({ files }) => {
        setFiles(files);
      });
  }

  return (
    <div className="flex w-full flex-col gap-4">
      <div className="card w-full max-w-5xl bg-slate-700 p-8">
        <div className="flex items-center justify-between pb-4">
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
