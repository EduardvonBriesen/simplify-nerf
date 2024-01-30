import React, { useEffect, useState } from "react";
import { File } from "./Upload";

export default function FileSelector({
  files,
  onDelete,
}: {
  files: File[];
  onDelete: (files: string[]) => void;
}) {
  const [checkedFiles, setCheckedFiles] = useState<string[]>([]);

  useEffect(() => {
    const checkAll = document.getElementById("check-all") as any;
    if (!checkAll) return;
    checkAll.indeterminate =
      checkedFiles.length <= files.length && checkedFiles.length > 0;
  }, [checkedFiles, files]);

  function deleteHandler() {
    onDelete(checkedFiles);
    setCheckedFiles([]);
  }

  return (
    <>
      <div className="flex items-center justify-between pt-4">
        <h1 className="text-xl">Files</h1>

        {checkedFiles.length > 0 && (
          <button
            className="btn btn-error btn-outline btn-xs"
            onClick={deleteHandler}
          >
            Delete Selected
          </button>
        )}
      </div>
      {files.length > 0 ? (
        <>
          <div className="max-h-96 overflow-x-auto">
            <table className="table-xs table-pin-rows table">
              <thead>
                <tr className="bg-base-300">
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
                        }}
                      />
                    </td>
                    <td>{file.name}</td>
                    <td className="whitespace-nowrap text-right">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex justify-between">
            <span>
              Number of files: <b>{files.length}</b>
            </span>
            <span>
              <b>
                {(
                  files.reduce((acc, file) => acc + file.size, 0) /
                  1024 /
                  1024
                ).toFixed(2)}{" "}
                MB
              </b>
            </span>
          </div>
        </>
      ) : (
        <div className="text-center">No files found</div>
      )}
    </>
  );
}
