import { useState } from "react";
import client from "../utils/trpc";

function Prototype() {
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

    try {
      const response = await fetch("http://localhost:3000/upload", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        // Handle success
        console.log("Files uploaded successfully");
      } else {
        // Handle error
        console.error("Failed to upload files");
      }
    } catch (error) {
      console.error("Error occurred while uploading files:", error);
    }
  };

  return (
    <div className="flex w-full flex-col items-center justify-center gap-8">
      <div className="card w-full bg-slate-700 p-8">
        <h1>Upload File</h1>
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
      <div className="card w-full  bg-slate-700 p-8 shadow-xl">
        <div className="flex gap-4 pb-8">
          <button
            className="btn btn-primary w-min"
            onClick={() => client.nerfstudio.test.query()}
          >
            Test
          </button>
          <button
            className="btn btn-primary w-min"
            onClick={() =>
              client.nerfstudio.download.query({ captureName: "dozer" })
            }
          >
            Download
          </button>
          <button
            className="btn btn-primary w-min"
            onClick={() =>
              client.nerfstudio.process.query({
                project: "dozer",
                dataType: "images",
              })
            }
          >
            Process
          </button>
          <button
            className="btn btn-primary w-min"
            onClick={() => client.nerfstudio.train.query({ project: "dozer" })}
          >
            Train
          </button>
        </div>
      </div>
      {/* <iframe
        src="https://viewer.nerf.studio/versions/23-05-15-1/?websocket_url=ws://localhost:7007"
        title="Python"
        className="h-screen  w-full p-4"
      ></iframe> */}
    </div>
  );
}

export default Prototype;
