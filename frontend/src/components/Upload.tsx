import { useEffect, useState } from "react";
import axios from "axios";
import client from "../utils/trpc";

export default function Upload({ projectId }: { projectId: string }) {
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
  const [files, setFiles] = useState<{ name: string; size: number }[]>([]);
  const [checkedFiles, setCheckedFiles] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

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

    setLoading(true);

    await axios
      .post(`http://localhost:3000/upload/?project=${projectId}`, formData)
      .then(() => {
        setLoading(false);
        refreshFiles();
      });
  };

  useEffect(() => {
    if (!projectId) return;
    refreshFiles();
  }, [projectId]);

  function refreshFiles() {
    client.project.getFiles.query({ project: projectId }).then(({ data }) => {
      setFiles(data);
    });
  }

  function deleteFiles() {
    client.project.deleteFiles
      .mutate({ project: projectId, files: checkedFiles })
      .then(() => {
        refreshFiles();
        setCheckedFiles([]);
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
          <button className="btn btn-primary w-24" type="submit">
            {loading ? (
              <span className="loading loading-spinner"></span>
            ) : (
              "Upload"
            )}
          </button>
        </form>
        <div className="flex items-center justify-between pt-4">
          <h1 className="text-xl">Files</h1>

          {checkedFiles.length > 0 && (
            <button
              className="btn btn-error btn-outline btn-xs"
              onClick={deleteFiles}
            >
              Delete Selected
            </button>
          )}
        </div>
        {files.length > 0 ? (
          <table className="table-xs table">
            <thead>
              <tr>
                <th className="w-4">
                  <input
                    type="checkbox"
                    className="checkbox checkbox-xs"
                    id="check-all"
                    checked={checkedFiles.length === files.length}
                    onChange={(e) => {
                      const checked = e.target.checked;
                      setCheckedFiles(
                        checked ? files.map((file) => file.name) : [],
                      );
                    }}
                  ></input>
                </th>
                <th className="w-full">Name</th>
                <th>Size</th>
              </tr>
            </thead>
            <tbody>
              {files.map((file) => (
                <tr key={file.name}>
                  <td>
                    <input
                      type="checkbox"
                      className="checkbox checkbox-xs"
                      checked={checkedFiles.includes(file.name)}
                      onChange={(e) => {
                        const checked = e.target.checked;
                        setCheckedFiles((prev) =>
                          checked
                            ? [...prev, file.name]
                            : prev.filter((name) => name !== file.name),
                        );
                        if (checked && checkedFiles.length <= files.length) {
                          (
                            document.getElementById("check-all") as any
                          ).indeterminate = true;
                        }
                      }}
                    />
                  </td>
                  <td>{file.name}</td>
                  <td className="whitespace-nowrap text-right">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </td>
                </tr>
              ))}
              <tr>
                <td></td>
                <td>
                  Number of files: <b>{files.length}</b>
                </td>
                <td className="whitespace-nowrap text-right">
                  <b>
                    {(
                      files.reduce((acc, file) => acc + file.size, 0) /
                      1024 /
                      1024
                    ).toFixed(2)}{" "}
                    MB
                  </b>
                </td>
              </tr>
            </tbody>
          </table>
        ) : (
          <div className="text-center">No files found</div>
        )}
      </div>
    </div>
  );
}
