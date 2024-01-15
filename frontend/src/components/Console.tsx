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
    <div className="flex w-full flex-col gap-4">
      <div className="card w-full max-w-5xl bg-slate-700 p-8">
        <div className="flex items-center justify-between pb-4">
          <h1 className="text-xl">Console</h1>
          {badge}
        </div>
        <div className="mockup-code h-96 overflow-y-scroll">
          {socketData.map((data, index) => (
            <pre key={index}>{data}</pre>
          ))}
        </div>
      </div>
    </div>
  );
}