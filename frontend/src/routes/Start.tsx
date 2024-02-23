import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import client from "../utils/trpc";
import { toast } from "react-toastify";
import { set } from "react-hook-form";

export default function Start() {
  const [projects, setProjects] = useState<
    {
      name: string;
      preview?: string;
      fileType?: string;
      preProcessOutput?: boolean;
      trainingOutput?: boolean;
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

  useEffect(() => {
    // load previews
    projects
      .filter((project) => !project.preview)
      .forEach((project) => {
        client.project.getProjectPreview
          .query({ name: project.name })
          .then((preview) => {
            setProjects((prev) =>
              prev.map((p) =>
                p.name === project.name ? { ...p, preview } : p,
              ),
            );
          })
          .catch(() => {
            toast.error("Failed to get preview");
          });
      });
  }, [projects]);

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
                <div className="card bg-base-100 w-96 shadow-xl">
                  <figure className="max-h-64">
                    <img src={project.preview} alt={project.name} />
                  </figure>
                  <div className="card-body">
                    <h2 className="card-title">{project.name}</h2>
                    <div className="flex gap-2">
                      <div className="badge badge-outline">
                        {project.fileType}
                      </div>
                      <div
                        className={`badge badge-outline
                        ${
                          project.preProcessOutput
                            ? "badge-success"
                            : "badge-error"
                        }
                      `}
                      >
                        {project.preProcessOutput
                          ? "Pre-processed"
                          : "Not pre-processed"}
                      </div>
                      <div
                        className={`badge badge-outline
                        ${
                          project.trainingOutput
                            ? "badge-success"
                            : "badge-error"
                        }`}
                      >
                        {project.trainingOutput ? "Trained" : "Not trained"}
                      </div>
                    </div>
                    <div className="card-actions justify-end">
                      <button
                        className="btn btn-outline"
                        onClick={() => {
                          client.project.deleteProject
                            .mutate({ name: project.name })
                            .then(() => {
                              setProjects((prev) =>
                                prev.filter((p) => p.name !== project.name),
                              );
                            });
                        }}
                      >
                        <i className="fa-solid fa-trash text-lg"></i>
                      </button>
                      <Link
                        key={project.name}
                        className="btn btn-outline"
                        to={`/project/${project.name}/process`}
                      >
                        <i className="fa-solid fa-arrow-right text-lg"></i>
                      </Link>
                    </div>
                  </div>
                </div>
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
