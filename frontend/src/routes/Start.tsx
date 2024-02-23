import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import client from "../utils/trpc";
import { toast } from "react-toastify";

export default function Start() {
  const [projects, setProjects] = useState<
    {
      name: string;
      preview?: string;
    }[]
  >([]);
  const [input, setInput] = useState<string>("");

  useEffect(() => {
    client.project.getProjects
      .query()
      .then(({ projects }) => {
        setProjects(projects);
      })
      .catch(() => {
        toast.error("Failed to get projects");
      });
  }, []);

  function handleCreateProject(event: any) {
    event.preventDefault();
    client.project.create
      .query({ name: input })
      .then(() => setProjects((prev) => [...prev, { name: input }]))
      .catch(() => {
        toast.error("Failed to create project");
      });
  }

  return (
    <div className="flex w-full flex-col gap-4">
      <div className="card bg-base-300 w-full max-w-5xl p-8">
        <h1 className="text-xl">Projects</h1>
        {projects ? (
          <div className="flex gap-4 py-4">
            {projects.map((project) => (
              <>
                <Link
                  key={project.name}
                  className={`btn btn-primary`}
                  to={`/project/${project}/process`}
                >
                  {project.name}
                </Link>
                <img src={project.preview} alt={project.name} />
              </>
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
