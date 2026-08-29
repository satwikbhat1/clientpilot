"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import type {
  Project,
  Task,
  Client,
  Communication,
  ChangeRequest,
  Quote,
  DashboardStats,
  DashboardAlert,
  Priority,
  TaskStatus,
  ProjectStatus,
} from "@/lib/types";
import { generateId } from "@/lib/utils";

interface StoreContextType {
  projects: Project[];
  tasks: Task[];
  clients: Client[];
  communications: Communication[];
  changeRequests: ChangeRequest[];
  quotes: Quote[];

  addProject: (p: Omit<Project, "id" | "createdAt" | "updatedAt">) => Project;
  updateProject: (id: string, patch: Partial<Project>) => void;
  deleteProject: (id: string) => void;

  addTask: (t: Omit<Task, "id" | "createdAt" | "updatedAt">) => Task;
  updateTask: (id: string, patch: Partial<Task>) => void;
  deleteTask: (id: string) => void;

  addClient: (c: Omit<Client, "id" | "createdAt">) => Client;
  updateClient: (id: string, patch: Partial<Client>) => void;

  addCommunication: (
    c: Omit<Communication, "id" | "createdAt" | "processed">,
  ) => Communication;
  updateCommunication: (id: string, patch: Partial<Communication>) => void;

  addChangeRequest: (
    cr: Omit<ChangeRequest, "id" | "secureToken" | "createdAt" | "status">,
  ) => ChangeRequest;
  updateChangeRequest: (id: string, patch: Partial<ChangeRequest>) => void;

  getTasksByProject: (projectId: string) => Task[];
  getProjectById: (id: string) => Project | undefined;
  getClientById: (id: string) => Client | undefined;
  getChangeRequestsByProject: (projectId: string) => ChangeRequest[];

  dashboardStats: DashboardStats;
  dashboardAlerts: DashboardAlert[];
}

const StoreContext = createContext<StoreContextType | null>(null);

const STORAGE_KEY = "clientpilot_store_v1";

const seedClients: Client[] = [
  {
    id: "c_abc",
    name: "ABC Corp",
    email: "contact@abccorp.com",
    company: "ABC Corp Pvt Ltd",
    healthScore: {
      overall: 82,
      paymentReliability: 90,
      communication: 82,
      scopeStability: 65,
      approvalSpeed: 74,
    },
    createdAt: new Date(Date.now() - 60 * 24 * 3600 * 1000).toISOString(),
  },
  {
    id: "c_xyz",
    name: "XYZ Studios",
    email: "biz@xyzstudios.io",
    company: "XYZ Studios",
    healthScore: {
      overall: 64,
      paymentReliability: 70,
      communication: 60,
      scopeStability: 55,
      approvalSpeed: 72,
    },
    createdAt: new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString(),
  },
  {
    id: "c_acme",
    name: "Acme Dashboard Co.",
    email: "pm@acme.co",
    company: "Acme Inc.",
    healthScore: {
      overall: 92,
      paymentReliability: 95,
      communication: 94,
      scopeStability: 88,
      approvalSpeed: 90,
    },
    createdAt: new Date(Date.now() - 120 * 24 * 3600 * 1000).toISOString(),
  },
];

const seedProjects: Project[] = [
  {
    id: "p_abc",
    name: "ABC Website",
    clientId: "c_abc",
    description:
      "Corporate website redesign with testimonials and responsive layout.",
    status: "active",
    budget: 80000,
    originalScope: [
      "Homepage redesign",
      "Hero section update",
      "Button styling",
      "Testimonials section",
      "Mobile responsiveness",
    ],
    startDate: new Date(Date.now() - 14 * 24 * 3600 * 1000).toISOString(),
    deadline: new Date(Date.now() + 4 * 24 * 3600 * 1000).toISOString(),
    health: 87,
    createdAt: new Date(Date.now() - 14 * 24 * 3600 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "p_xyz",
    name: "XYZ Mobile App",
    clientId: "c_xyz",
    description: "Cross-platform mobile app with user profiles and booking.",
    status: "active",
    budget: 160000,
    originalScope: [
      "User registration / auth",
      "User profiles",
      "Booking flow",
      "Payment integration",
      "Push notifications",
    ],
    startDate: new Date(Date.now() - 28 * 24 * 3600 * 1000).toISOString(),
    deadline: new Date(Date.now() + 16 * 24 * 3600 * 1000).toISOString(),
    health: 64,
    createdAt: new Date(Date.now() - 28 * 24 * 3600 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "p_acme",
    name: "Acme Dashboard",
    clientId: "c_acme",
    description: "Internal analytics dashboard with charts and exports.",
    status: "review",
    budget: 120000,
    originalScope: [
      "Dashboard layout",
      "Charts & data visualization",
      "Reports & CSV export",
      "Role-based access",
    ],
    startDate: new Date(Date.now() - 40 * 24 * 3600 * 1000).toISOString(),
    deadline: new Date(Date.now() + 2 * 24 * 3600 * 1000).toISOString(),
    health: 92,
    createdAt: new Date(Date.now() - 40 * 24 * 3600 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const seedTasks: Task[] = [
  {
    id: "t_1",
    projectId: "p_abc",
    title: "Update hero section",
    priority: "high",
    status: "in-progress",
    deadline: new Date(Date.now() + 2 * 24 * 3600 * 1000).toISOString(),
    estimatedHours: 6,
    createdAt: new Date(Date.now() - 10 * 24 * 3600 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "t_2",
    projectId: "p_abc",
    title: "Change button styling to blue",
    priority: "medium",
    status: "todo",
    deadline: new Date(Date.now() + 4 * 24 * 3600 * 1000).toISOString(),
    estimatedHours: 2,
    createdAt: new Date(Date.now() - 10 * 24 * 3600 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "t_3",
    projectId: "p_abc",
    title: "Add testimonials section",
    priority: "medium",
    status: "blocked",
    description: "Waiting for testimonials content from client.",
    deadline: new Date(Date.now() + 4 * 24 * 3600 * 1000).toISOString(),
    estimatedHours: 4,
    dependencies: ["Client provides content"],
    createdAt: new Date(Date.now() - 10 * 24 * 3600 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "t_4",
    projectId: "p_abc",
    title: "Mobile responsiveness",
    priority: "high",
    status: "todo",
    deadline: new Date(Date.now() + 4 * 24 * 3600 * 1000).toISOString(),
    estimatedHours: 8,
    createdAt: new Date(Date.now() - 10 * 24 * 3600 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "t_5",
    projectId: "p_xyz",
    title: "User auth flow",
    priority: "high",
    status: "done",
    estimatedHours: 10,
    createdAt: new Date(Date.now() - 22 * 24 * 3600 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "t_6",
    projectId: "p_xyz",
    title: "Booking flow",
    priority: "high",
    status: "in-progress",
    deadline: new Date(Date.now() + 10 * 24 * 3600 * 1000).toISOString(),
    estimatedHours: 18,
    createdAt: new Date(Date.now() - 18 * 24 * 3600 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "t_7",
    projectId: "p_acme",
    title: "Charts & data visualization",
    priority: "medium",
    status: "done",
    estimatedHours: 14,
    createdAt: new Date(Date.now() - 32 * 24 * 3600 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "t_8",
    projectId: "p_acme",
    title: "Reports & CSV export",
    priority: "medium",
    status: "in-progress",
    estimatedHours: 8,
    createdAt: new Date(Date.now() - 20 * 24 * 3600 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const seedCommunications: Communication[] = [
  {
    id: "comm_1",
    clientId: "c_abc",
    source: "whatsapp",
    content:
      "Hey, can you change the homepage hero section, make the buttons blue, add testimonials, and also make the website mobile responsive? We need this by Monday.",
    processed: true,
    createdAt: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString(),
  },
  {
    id: "comm_2",
    clientId: "c_xyz",
    source: "email",
    content:
      "Hey, love the progress so far. Also, can you add an admin analytics dashboard to track user activity? Urgent, need to show this to the investors next week.",
    processed: true,
    createdAt: new Date(Date.now() - 1 * 24 * 3600 * 1000).toISOString(),
  },
  {
    id: "comm_3",
    clientId: "c_acme",
    source: "meeting",
    content:
      "Meeting recap: dashboard looks great, we need export to PDF feature added and user roles should support view-only access for analysts. Also please make sure the charts load fast on low bandwidth.",
    processed: true,
    createdAt: new Date(Date.now() - 5 * 3600 * 1000).toISOString(),
  },
];

const seedChangeRequests: ChangeRequest[] = [
  {
    id: "cr_014",
    projectId: "p_xyz",
    title: "Admin Analytics Dashboard",
    reason: "Additional client requirement for investor demo",
    estimatedHours: 20,
    additionalCost: 18000,
    timelineImpact: 5,
    status: "pending",
    secureToken: "cr014-xyz-token",
    createdAt: new Date(Date.now() - 1 * 24 * 3600 * 1000).toISOString(),
  },
];

const seedQuotes: Quote[] = [];

function getInitialState() {
  if (typeof window === "undefined") {
    return {
      projects: seedProjects,
      tasks: seedTasks,
      clients: seedClients,
      communications: seedCommunications,
      changeRequests: seedChangeRequests,
      quotes: seedQuotes,
    };
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        projects: parsed.projects ?? seedProjects,
        tasks: parsed.tasks ?? seedTasks,
        clients: parsed.clients ?? seedClients,
        communications: parsed.communications ?? seedCommunications,
        changeRequests: parsed.changeRequests ?? seedChangeRequests,
        quotes: parsed.quotes ?? seedQuotes,
      };
    }
  } catch (e) {}
  return {
    projects: seedProjects,
    tasks: seedTasks,
    clients: seedClients,
    communications: seedCommunications,
    changeRequests: seedChangeRequests,
    quotes: seedQuotes,
  };
}

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const initial = getInitialState();
  const [projects, setProjects] = useState<Project[]>(initial.projects);
  const [tasks, setTasks] = useState<Task[]>(initial.tasks);
  const [clients, setClients] = useState<Client[]>(initial.clients);
  const [communications, setCommunications] = useState<Communication[]>(
    initial.communications,
  );
  const [changeRequests, setChangeRequests] = useState<ChangeRequest[]>(
    initial.changeRequests,
  );
  const [quotes, setQuotes] = useState<Quote[]>(initial.quotes);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          projects,
          tasks,
          clients,
          communications,
          changeRequests,
          quotes,
        }),
      );
    } catch (e) {}
  }, [projects, tasks, clients, communications, changeRequests, quotes]);

  const addProject = useCallback<StoreContextType["addProject"]>((p) => {
    const now = new Date().toISOString();
    const np: Project = {
      ...p,
      id: generateId(),
      createdAt: now,
      updatedAt: now,
    };
    setProjects((prev) => [np, ...prev]);
    return np;
  }, []);

  const updateProject = useCallback<StoreContextType["updateProject"]>(
    (id, patch) => {
      setProjects((prev) =>
        prev.map((p) =>
          p.id === id
            ? { ...p, ...patch, updatedAt: new Date().toISOString() }
            : p,
        ),
      );
    },
    [],
  );

  const deleteProject = useCallback<StoreContextType["deleteProject"]>((id) => {
    setProjects((prev) => prev.filter((p) => p.id !== id));
    setTasks((prev) => prev.filter((t) => t.projectId !== id));
  }, []);

  const addTask = useCallback<StoreContextType["addTask"]>((t) => {
    const now = new Date().toISOString();
    const nt: Task = { ...t, id: generateId(), createdAt: now, updatedAt: now };
    setTasks((prev) => [nt, ...prev]);
    return nt;
  }, []);

  const updateTask = useCallback<StoreContextType["updateTask"]>(
    (id, patch) => {
      setTasks((prev) =>
        prev.map((t) =>
          t.id === id
            ? { ...t, ...patch, updatedAt: new Date().toISOString() }
            : t,
        ),
      );
    },
    [],
  );

  const deleteTask = useCallback<StoreContextType["deleteTask"]>((id) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addClient = useCallback<StoreContextType["addClient"]>((c) => {
    const nc: Client = {
      ...c,
      id: generateId(),
      createdAt: new Date().toISOString(),
    };
    setClients((prev) => [nc, ...prev]);
    return nc;
  }, []);

  const updateClient = useCallback<StoreContextType["updateClient"]>(
    (id, patch) => {
      setClients((prev) =>
        prev.map((c) => (c.id === id ? { ...c, ...patch } : c)),
      );
    },
    [],
  );

  const addCommunication = useCallback<StoreContextType["addCommunication"]>(
    (c) => {
      const nc: Communication = {
        ...c,
        id: generateId(),
        createdAt: new Date().toISOString(),
        processed: false,
      };
      setCommunications((prev) => [nc, ...prev]);
      return nc;
    },
    [],
  );

  const updateCommunication = useCallback<
    StoreContextType["updateCommunication"]
  >((id, patch) => {
    setCommunications((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...patch } : c)),
    );
  }, []);

  const addChangeRequest = useCallback<StoreContextType["addChangeRequest"]>(
    (cr) => {
      const now = new Date().toISOString();
      const ncr: ChangeRequest = {
        ...cr,
        id: generateId(),
        secureToken: generateId(),
        createdAt: now,
        status: "pending",
      };
      setChangeRequests((prev) => [ncr, ...prev]);
      return ncr;
    },
    [],
  );

  const updateChangeRequest = useCallback<
    StoreContextType["updateChangeRequest"]
  >((id, patch) => {
    setChangeRequests((prev) =>
      prev.map((cr) => (cr.id === id ? { ...cr, ...patch } : cr)),
    );
  }, []);

  const getTasksByProject = (projectId: string) =>
    tasks.filter((t) => t.projectId === projectId);
  const getProjectById = (id: string) => projects.find((p) => p.id === id);
  const getClientById = (id: string) => clients.find((c) => c.id === id);
  const getChangeRequestsByProject = (projectId: string) =>
    changeRequests.filter((cr) => cr.projectId === projectId);

  const revenue =
    projects
      .filter((p) => p.status === "completed" || p.status === "review")
      .reduce((s, p) => s + (p.budget || 0), 0) + 52500;
  const activeProjects = projects.filter(
    (p) => p.status === "active" || p.status === "review",
  ).length;
  const pendingPayments = projects
    .filter((p) => p.status === "review" || p.status === "active")
    .reduce((s, p) => s + Math.round((p.budget || 0) * 0.35), 0);
  const pendingApprovals =
    changeRequests
      .filter((cr) => cr.status === "pending")
      .reduce((s, cr) => s + cr.additionalCost, 0) + 18000;
  const scopeChanges = changeRequests.length + 2;

  const dashboardStats: DashboardStats = {
    revenue,
    activeProjects,
    pendingPayments,
    pendingApprovals,
    scopeChanges,
  };

  const dashboardAlerts: DashboardAlert[] = [
    {
      type: "deadline",
      severity: "medium",
      title: "3 projects approaching deadline",
      message:
        "ABC Website (4d), Acme Dashboard (2d), XYZ Mobile App (16d) are approaching their deadlines.",
    },
    {
      type: "scope-creep",
      severity: "high",
      title: "2 potential scope creep issues",
      message:
        "XYZ Mobile App (admin analytics dashboard) and Acme Dashboard (export feature) detected scope additions.",
      projectId: "p_xyz",
    },
    {
      type: "approval",
      severity: "medium",
      title: `${formatRupeeShort(pendingApprovals)} in pending approvals`,
      message:
        "1 change request pending client approval and 2 milestone approvals outstanding.",
    },
  ];

  return (
    <StoreContext.Provider
      value={{
        projects,
        tasks,
        clients,
        communications,
        changeRequests,
        quotes,
        addProject,
        updateProject,
        deleteProject,
        addTask,
        updateTask,
        deleteTask,
        addClient,
        updateClient,
        addCommunication,
        updateCommunication,
        addChangeRequest,
        updateChangeRequest,
        getTasksByProject,
        getProjectById,
        getClientById,
        getChangeRequestsByProject,
        dashboardStats,
        dashboardAlerts,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
}

function formatRupeeShort(v: number) {
  if (v >= 10000000) return `₹${(v / 10000000).toFixed(1)}Cr`;
  if (v >= 100000) return `₹${(v / 100000).toFixed(1)}L`;
  return `₹${v.toLocaleString("en-IN")}`;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) {
    throw new Error("useStore must be used inside StoreProvider");
  }
  return ctx;
}
