export default function Console({
  socketData,
  connected,
}: {
  socketData: string[];
  connected: boolean;
}) {
  const badge = connected ? (
    <div className="badge badge-outline badge-success">connected</div>
  ) : (
    <div className="badge badge-outline badge-error">disconnected</div>
  );

  return (
    <div className="card w-full  bg-slate-700 p-8">
      <div className="flex items-center justify-between pb-4">
        <h1 className="text-xl">Console</h1>
        {badge}
      </div>
      <div className="mockup-code h-full overflow-y-scroll">
        {socketData.map((data, index) => (
          <pre key={index}>{data}</pre>
        ))}
      </div>
    </div>
  );
}
