import React from "react";
import { useEffect, useState } from "react";
import axios from "axios";
import client from "../utils/trpc";
import FileSelector from "./FileSelector";

export type File = {
  name: string;
  type: string;
  size: number;
};

export default function Upload({
  projectId,
  setDataType,
}: {
  projectId: string;
  setDataType: (type: string) => void;
}) {
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
  const [files, setFiles] = useState<
    { name: string; type: string; size: number }[]
  >([]);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (!projectId) return;
    refreshFiles();
  }, [projectId]);

  useEffect(() => {
    setDataType(files[0]?.type.split("/")[0]);
  }, [files]);

  const handleFileUpload = async (event: any) => {
    event.preventDefault();

    const checkedFiles = checkFiles(selectedFiles);
    if (!checkedFiles) return;

    setDataType(checkedFiles[0].type.split("/")[0]);

    const formData = new FormData();
    for (let i = 0; i < checkedFiles.length; i++) {
      formData.append("files", checkedFiles[i], checkedFiles[i].name);
    }

    setLoading(true);

    const interval = setInterval(() => {
      refreshFiles();
    }, 300);

    await axios
      .post(`http://localhost:3000/upload/?project=${projectId}`, formData)
      .then(() => {
        setLoading(false);
        clearInterval(interval);
        refreshFiles();
      });
  };

  function checkFiles(newFiles: FileList | null) {
    // Check if files are selected
    if (!newFiles) return alert("Please select a file to upload");

    // Check for duplicate files
    const duplicateFiles = files.filter((file) => {
      for (let i = 0; i < newFiles.length; i++) {
        if (file.name === newFiles[i].name) {
          return true;
        }
      }
      return false;
    });

    if (duplicateFiles.length !== 0) {
      return alert(
        "Duplicate files are not allowed. Please remove or rename the following duplicate files and try again: " +
          duplicateFiles.map((file) => file.name).join(", "),
      );
    }

    // Check if all existing files are of type image
    for (let i = 0; i < files.length; i++) {
      if (files[i].type.split("/")[0] !== "image") {
        return alert(
          "If uploading multiple files, all files must be of type image",
        );
      }
    }

    // Check if files are of type image if multiple files are selected
    if (newFiles.length > 1 || files.length > 0) {
      for (let i = 0; i < newFiles.length; i++) {
        if (newFiles[i].type.split("/")[0] !== "image") {
          console.log(newFiles[i].type);
          return alert(
            "If uploading multiple files, all files must be of type image",
          );
        }
      }
    }

    return newFiles;
  }

  function deleteFiles(files: string[]) {
    client.project.deleteFiles
      .mutate({ project: projectId, files })
      .then(() => {
        refreshFiles();
      });
  }

  function refreshFiles() {
    client.project.getFiles.query({ project: projectId }).then(({ data }) => {
      setFiles(data);
    });
  }

  return (
    <div className="card bg-base-300 w-full p-8 shadow-lg">
      <h1 className="pb-4 text-xl">Upload File</h1>
      <form className="flex justify-evenly gap-4" onSubmit={handleFileUpload}>
        <input
          className="file-input file-input-bordered file-input-primary w-full"
          name="file"
          type="file"
          multiple
          accept="video/*,.zip,image/*"
          onChange={(e) => setSelectedFiles(e.target.files)}
        />
        <button
          className="btn btn-primary w-24"
          type="submit"
          disabled={loading}
        >
          {loading ? (
            <span className="loading loading-spinner"></span>
          ) : (
            "Upload"
          )}
        </button>
      </form>
      <FileSelector files={files} onDelete={deleteFiles} />
    </div>
  );
}
