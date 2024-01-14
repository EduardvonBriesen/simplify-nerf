import { useState, useEffect } from "react";
import client from "../utils/trpc";

export default function Projects({
  activeProject,
  setActiveProject,
}: {
  activeProject: string | null;
  setActiveProject: (project: string) => void;
}) {
  const [projects, setProjects] = useState<string[]>([]);
  const [input, setInput] = useState<string>("");

  useEffect(() => {
    client.project.getProjects.query().then(({ projects }) => {
      console.log(projects);
      setProjects(projects);
    });
  }, []);

  function handleCreateProject(event: any) {
    event.preventDefault();
    client.project.create
      .query({ name: input })
      .then(() => setProjects((prev) => [...prev, input]));
  }

  return (
    <div className="flex w-full flex-col gap-4">
      <div className="card w-full max-w-5xl bg-slate-700 p-8">
        <h1 className="text-xl">Projects</h1>
        {projects ? (
          <div className="flex gap-4 py-4">
            {projects.map((project) => (
              <button
                key={project}
                className={`btn ${
                  activeProject !== project ? "btn-outline" : "btn-primary"
                }`}
                onClick={() => setActiveProject(project)}
              >
                {project}
              </button>
            ))}
          </div>
        ) : (
          <div className="text-center">No projects found</div>
        )}
        <h2 className="text-lg">Create Project</h2>
        <form className="flex gap-4" onSubmit={handleCreateProject}>
          <input
            type="text"
            placeholder="Type here"
            className="input input-bordered w-full p-4"
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <button className="btn btn-primary" type="submit">
            Create
          </button>
        </form>
      </div>
    </div>
  );
}
