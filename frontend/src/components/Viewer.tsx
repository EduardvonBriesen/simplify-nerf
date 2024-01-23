export default function Viewer() {
  return (
    <div className="card bg-base-300 h-full w-full p-4">
      <iframe
        src="https://viewer.nerf.studio/versions/23-05-15-1/?websocket_url=ws://localhost:7007"
        title="Python"
        className="h-full w-full rounded-md"
      ></iframe>
    </div>
  );
}
