export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen flex-col items-center">
      <div className="navbar">
        <h1 className="px-4 text-xl">Simplify NeRF</h1>
      </div>
      <div className="flex w-full max-w-5xl flex-1 p-4 ">{children}</div>
    </div>
  );
}
