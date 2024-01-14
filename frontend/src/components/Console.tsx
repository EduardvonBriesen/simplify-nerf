export default function Console({
  socketData,
  connected,
}: {
  socketData: string[];
  connected: boolean;
}) {
  return (
    <div className="flex w-full flex-col gap-4">
      <div className="card w-full max-w-5xl bg-slate-700 p-8 shadow-xl">
        <div className="mockup-code h-96 overflow-y-scroll">
          {socketData.map((data, index) => (
            <pre key={index}>{data}</pre>
          ))}
        </div>
      </div>
    </div>
  );
}
