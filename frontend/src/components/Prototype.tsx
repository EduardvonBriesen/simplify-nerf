import client from "../utils/trpc";

function Prototype() {
  return (
    <div className="flex w-full flex-col items-center justify-center gap-8">
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
