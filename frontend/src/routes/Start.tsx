import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import client from "../utils/trpc";
import { toast } from "react-toastify";

export default function Start() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<
    {
      name: string;
      timestamp?: string;
      preview?: string;
      fileType?: string;
      preProcessOutput?: boolean;
      trainingOutput?: boolean;
    }[]
  >([]);
  const [input, setInput] = useState<string>("");

  const createProjectModal = useRef<HTMLDialogElement>(null);

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
    <>
      <div className="flex w-full flex-col gap-4">
        <div className="card bg-base-300 w-full max-w-5xl p-8 shadow-lg">
          <div className="flex items-baseline justify-between">
            <h1 className="pb-4 text-3xl">Projects</h1>
            <button
              className="btn btn-primary btn-outline"
              onClick={() => {
                createProjectModal.current?.showModal();
              }}
            >
              Create New
              <i className="fa-solid fa-plus text-lg"></i>
            </button>
          </div>
          {projects.length === 0 ? (
            <div className="flex items-center justify-center">
              <h2 className="text-2xl">No projects yet</h2>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-4 py-4">
              {projects.map((project) => (
                <div
                  className="card bg-base-100 w-full shadow-lg"
                  key={project.name}
                >
                  <figure className="h-64">
                    {project.preview ? (
                      <img
                        className="h-full w-full object-cover"
                        src={project.preview}
                        alt={project.name}
                      />
                    ) : (
                      <div className="skeleton h-full w-full"></div>
                    )}
                  </figure>
                  <div className="card-body">
                    <div className="flex items-baseline justify-between">
                      <h2 className="card-title">{project.name}</h2>
                      <span className="text-base-content text-sm">
                        {new Date(project.timestamp ?? "").toLocaleDateString()}
                      </span>
                    </div>
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
                            : "badge-neutral"
                        }
                      `}
                      >
                        processing
                      </div>
                      <div
                        className={`badge badge-outline
                        ${
                          project.trainingOutput
                            ? "badge-success"
                            : "badge-neutral"
                        }`}
                      >
                        training
                      </div>
                    </div>
                    <div className="card-actions mt-4 justify-end">
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
            </div>
          )}
        </div>
      </div>

      <dialog className="modal" ref={createProjectModal}>
        <div className="modal-box">
          <form method="dialog">
            <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">
              ✕
            </button>
          </form>

          <h3 className="mb-6 text-lg font-bold">Create a new Project</h3>
          <form
            onSubmit={handleCreateProject}
            className="form-control items-end gap-4"
          >
            <input
              type="text"
              placeholder="Project name"
              className="input input-bordered  w-full p-4"
              required
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
            <button type="submit" className="btn btn-primary w-fit ">
              Create
              <i className="fa-solid fa-plus text-lg"></i>
            </button>
          </form>
        </div>
      </dialog>
    </>
  );
}
