import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import client from "../utils/trpc";
import { toast } from "react-toastify";

export default function Start() {
  const navigate = useNavigate();
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
        projects.forEach((project) => {
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
      })
      .catch(() => {
        toast.error("Failed to get projects");
      });
  }, []);

  function handleCreateProject(event: any) {
    event.preventDefault();
    client.project.create
      .query({ name: input })
      .then(() => {
        navigate(`/project/${input}/process`);
      })
      .catch(() => {
        toast.error("Failed to create project");
      });
  }

  return (
    <div className="flex w-full flex-col gap-4">
      <div className="card bg-base-300 w-full max-w-5xl p-8">
        <div className="grid grid-cols-3 gap-4 py-4">
          {projects.map((project) => (
            <div className="card bg-base-100 w-full shadow-xl">
              <figure className="h-64">
                {project.preview ? (
                  <img src={project.preview} alt={project.name} />
                ) : (
                  <div className="skeleton h-full w-full"></div>
                )}
              </figure>
              <div className="card-body">
                <h2 className="card-title">{project.name}</h2>
                <div className="flex gap-2">
                  {project.fileType && (
                    <div className="badge badge-outline">
                      {project.fileType}
                    </div>
                  )}
                  <div
                    className={`badge badge-outline
                        ${
                          project.preProcessOutput
                            ? "badge-success"
                            : "badge-error"
                        }
                      `}
                  >
                    Processed
                  </div>
                  <div
                    className={`badge badge-outline
                        ${
                          project.trainingOutput
                            ? "badge-success"
                            : "badge-error"
                        }`}
                  >
                    Trained
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
          ))}

          <div className="card bg-base-100 w-full shadow-xl">
            <form onSubmit={handleCreateProject}>
              <figure className="h-64">
                <i className="fa-solid fa-plus-circle text-center text-9xl"></i>
              </figure>
              <div className="card-body">
                <input
                  type="text"
                  placeholder="Create new project..."
                  className="input input-bordered  w-full p-4"
                  required
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                />
                <div className="card-actions justify-end">
                  <button type="submit" className="btn btn-outline">
                    <i className="fa-solid fa-plus text-lg"></i>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
