import { Project } from '@/lib/types';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

interface ProjectStore {
    projects: Project[];
    activeProjectId: string | undefined;
    activeProject: Project | undefined;

    addProject: (project: Project) => void;
    addProjects: (projects: Project[]) => void;
    setProjects: (projects: Project[]) => void;
    removeProject: (id: string) => void;
    clearProjects: () => void;

    setActiveProject: (id: string) => void;
    clearActiveProject: () => void;
    updateActiveProject: (updatedProject: Partial<Project>) => void;

    addSearchToProject: (projectId: string, searchId: string) => void;
    removeSearchFromProject: (projectId: string, searchId: string) => void;

    syncActiveProjectToProjects: () => void;

    getProjectById: (id: string) => Project | undefined;
}

export const useProjectStore = create<ProjectStore>()(
    persist(
        (set, get) => ({
            projects: [],
            activeProjectId: undefined,
            activeProject: undefined,

            addProject: (project: Project) =>
                set((state) => {
                    const exists = state.projects.some((p) => p.id === project.id);
                    if (exists) {
                        return {
                            projects: state.projects.map((p) => (p.id === project.id ? { ...p, ...project } : p)),
                        };
                    } else {
                        return { projects: [...state.projects, project] };
                    }
                }),

            addProjects: (projects: Project[]) =>
                set((state) => {
                    const currentProjects = [...state.projects];
                    const newProjects = [];

                    for (const project of projects) {
                        const existingIndex = currentProjects.findIndex((p) => p.id === project.id);
                        if (existingIndex >= 0) {
                            currentProjects[existingIndex] = {
                                ...currentProjects[existingIndex],
                                ...project,
                            };
                        } else {
                            newProjects.push(project);
                        }
                    }

                    return { projects: [...currentProjects, ...newProjects] };
                }),

            setProjects: (projects: Project[]) => set({ projects }),

            removeProject: (id: string) =>
                set((state) => {
                    if (state.activeProjectId === id) {
                        return {
                            projects: state.projects.filter((p) => p.id !== id),
                            activeProjectId: undefined,
                            activeProject: undefined,
                        };
                    }
                    return { projects: state.projects.filter((p) => p.id !== id) };
                }),

            clearProjects: () =>
                set({
                    projects: [],
                    activeProjectId: undefined,
                    activeProject: undefined,
                }),

            setActiveProject: (id: string) =>
                set((state) => {
                    const project = state.projects.find((p) => p.id === id);
                    return {
                        activeProjectId: id,
                        activeProject: project,
                    };
                }),

            clearActiveProject: () =>
                set({
                    activeProjectId: undefined,
                    activeProject: undefined,
                }),

            updateActiveProject: (updatedProject: Partial<Project>) =>
                set((state) => {
                    if (!state.activeProject) return state;

                    const updated = {
                        ...state.activeProject,
                        ...updatedProject,
                    };

                    return { activeProject: updated };
                }),

            addSearchToProject: (projectId: string, searchId: string) =>
                set((state) => {
                    const updatedProjects = state.projects.map((project) => {
                        if (project.id === projectId) {
                            if (!project.searches.includes(searchId)) {
                                return {
                                    ...project,
                                    searches: [...project.searches, searchId],
                                };
                            }
                        }
                        return project;
                    });

                    let updatedActiveProject = state.activeProject;
                    if (state.activeProject && state.activeProject.id === projectId) {
                        if (!state.activeProject.searches.includes(searchId)) {
                            updatedActiveProject = {
                                ...state.activeProject,
                                searches: [...state.activeProject.searches, searchId],
                            };
                        }
                    }

                    return {
                        projects: updatedProjects,
                        activeProject: updatedActiveProject,
                    };
                }),

            removeSearchFromProject: (projectId: string, searchId: string) =>
                set((state) => {
                    const updatedProjects = state.projects.map((project) => {
                        if (project.id === projectId) {
                            return {
                                ...project,
                                searches: project.searches.filter((id) => id !== searchId),
                            };
                        }
                        return project;
                    });

                    let updatedActiveProject = state.activeProject;
                    if (state.activeProject && state.activeProject.id === projectId) {
                        updatedActiveProject = {
                            ...state.activeProject,
                            searches: state.activeProject.searches.filter((id) => id !== searchId),
                        };
                    }

                    return {
                        projects: updatedProjects,
                        activeProject: updatedActiveProject,
                    };
                }),

            syncActiveProjectToProjects: () =>
                set((state) => {
                    if (!state.activeProject || !state.activeProjectId) return state;

                    const updatedProjects = state.projects.map((project) => (project.id === state.activeProjectId ? state.activeProject! : project));

                    return { projects: updatedProjects };
                }),

            getProjectById: (id: string) => {
                return get().projects.find((p) => p.id === id);
            },
        }),
        {
            name: 'project-storage',
            storage: createJSONStorage(() => localStorage),
            partialize: (state) => ({
                projects: state.projects,
                activeProjectId: state.activeProjectId,
            }),

            onRehydrateStorage: () => (state) => {
                if (state && state.activeProjectId) {
                    const activeProject = state.projects.find((p) => p.id === state.activeProjectId);
                    state.activeProject = activeProject;
                }
            },
        },
    ),
);
