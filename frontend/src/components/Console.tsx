export default function Console({ data }: { data: string[] }) {
  return (
    <div className="card bg-base-300  w-full p-8">
      <h1 className="text-xl">Console</h1>
      <div className="mockup-codeh-[400px] overflow-y-scroll">
        {data.map((data, index) => (
          <pre key={index}>{data}</pre>
        ))}
      </div>
      <button
        className="btn btn-primary mt-4"
        onClick={() => {
          const element = document.querySelector(".mockup-code");
          element?.scrollTo(0, element.scrollHeight);
        }}
      >
        Scroll to bottom
      </button>
    </div>
  );
}
