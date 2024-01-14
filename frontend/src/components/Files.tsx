import { useEffect, useState } from "react";
import client from "../utils/trpc";

export default function Files({ activeProject }: { activeProject: string }) {
  const [files, setFiles] = useState<string[]>([]);

  useEffect(() => {
    if (!activeProject) return;
    client.project.getData
      .query({ project: activeProject })
      .then(({ files }) => {
        setFiles(files);
      });
  }, [activeProject]);

  return (
    <div className="flex w-full flex-col gap-4">
      <div className="card w-full max-w-5xl bg-slate-700 p-8">
        <h1 className="text-xl">Files</h1>
        {files ? (
          <div className="flex gap-4 py-4">
            {files.map((file) => (
              <p key={file}>{file}</p>
            ))}
          </div>
        ) : (
          <div className="text-center">No files found</div>
        )}
      </div>
    </div>
  );
}
