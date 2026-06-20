"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { formatPrice, projectStages } from "@/lib/data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowLeft,
  Package,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  CreditCard,
  Loader2,
  Eye,
  User,
  Calendar,
  MessageCircle,
  FolderKanban,
  Shield,
  Users,
  Crown,
  Trash2,
  Edit3,
  Plus,
  Search,
  BarChart3,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { toast } from "sonner";

// ============================================================
// Interfaces
// ============================================================

interface Transaction {
  id: string;
  transactionId: string | null;
  transactionStatus: string | null;
  paymentType: string | null;
  grossAmount: number | null;
  createdAt: string;
}

interface Milestone {
  id: string;
  title: string;
  status: string;
  notes: string | null;
  completedAt: string | null;
}

interface Project {
  id: string;
  orderId: string;
  projectName: string;
  packageCategory: string;
  status: string;
  progress: number;
  notes: string | null;
  liveUrl: string | null;
  startedAt: string;
  estimatedDone: string | null;
  completedAt: string | null;
  milestones: Milestone[];
  user?: { name: string; email: string; phone?: string };
  order?: { orderId: string; packageName: string; packagePrice: number; status: string };
}

interface Order {
  id: string;
  orderId: string;
  packageName: string;
  packageCategory: string;
  packagePrice: number;
  ppnAmount: number;
  transactionFee: number;
  payAmount: number;
  dpMinimal: number;
  isDP: boolean;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  businessName: string | null;
  notes: string | null;
  status: string;
  paymentMethod: string | null;
  paymentType: string | null;
  paidAt: string | null;
  expiredAt: string | null;
  createdAt: string;
  updatedAt: string;
  transactions: Transaction[];
  user?: { name: string; email: string; phone?: string };
  project?: { id: string; status: string; progress: number } | null;
}

interface ManagedUser {
  id: string;
  name: string | null;
  email: string;
  role: string;
  phone: string | null;
  businessName: string | null;
  image: string | null;
  createdAt: string;
  _count: { orders: number; projects: number };
}

// ============================================================
// Config Objects
// ============================================================

const orderStatusConfig: Record<string, { label: string; color: string; icon: typeof Clock }> = {
  pending: { label: "Menunggu", color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400", icon: Clock },
  paid: { label: "Dibayar", color: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400", icon: CheckCircle2 },
  confirmed: { label: "Dikonfirmasi", color: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400", icon: CheckCircle2 },
  processing: { label: "Diproses", color: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400", icon: Loader2 },
  completed: { label: "Selesai", color: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400", icon: CheckCircle2 },
  cancelled: { label: "Dibatalkan", color: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400", icon: XCircle },
  expired: { label: "Kedaluwarsa", color: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400", icon: AlertCircle },
};

const projectStatusConfig: Record<string, { label: string; color: string }> = {
  planning: { label: "Planning", color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400" },
  design: { label: "Design", color: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400" },
  development: { label: "Development", color: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400" },
  testing: { label: "Testing", color: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400" },
  online: { label: "Online", color: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400" },
  paused: { label: "Paused", color: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400" },
  cancelled: { label: "Dibatalkan", color: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400" },
};

const roleConfig: Record<string, { label: string; color: string; icon: typeof Crown }> = {
  "super-admin": { label: "Super Admin", color: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400", icon: Crown },
  admin: { label: "Admin", color: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400", icon: Shield },
  customer: { label: "Customer", color: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400", icon: User },
};

// ============================================================
// Helpers
// ============================================================

function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return "-";
  return new Date(dateStr).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatDateTime(dateStr: string | null | undefined): string {
  if (!dateStr) return "-";
  return new Date(dateStr).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// ============================================================
// Sub Components
// ============================================================

function StatusBadge({ status }: { status: string }) {
  const config = orderStatusConfig[status] || {
    label: status,
    color: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400",
    icon: AlertCircle,
  };
  const Icon = config.icon;
  return (
    <Badge variant="secondary" className={`${config.color} gap-1`}>
      <Icon className="w-3 h-3" />
      {config.label}
    </Badge>
  );
}

function ProjectStatusBadge({ status }: { status: string }) {
  const config = projectStatusConfig[status] || {
    label: status,
    color: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400",
  };
  return (
    <Badge variant="secondary" className={`${config.color}`}>
      {config.label}
    </Badge>
  );
}

function RoleBadge({ role }: { role: string }) {
  const config = roleConfig[role] || roleConfig.customer;
  const Icon = config.icon;
  return (
    <Badge variant="secondary" className={`${config.color} gap-1`}>
      <Icon className="w-3 h-3" />
      {config.label}
    </Badge>
  );
}

function ProjectStageVisualization({ status }: { status: string }) {
  const currentIndex = projectStages.findIndex((s) => s.key === status);
  return (
    <div className="flex items-center gap-1 overflow-x-auto pb-1">
      {projectStages.map((stage, idx) => {
        const isActive = idx === currentIndex;
        const isCompleted = idx < currentIndex;
        return (
          <div key={stage.key} className="flex items-center">
            <div
              className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                isCompleted
                  ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                  : isActive
                  ? "bg-gold/20 text-gold dark:bg-gold/30 dark:text-gold-light"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {isCompleted ? (
                <CheckCircle2 className="w-3 h-3" />
              ) : isActive ? (
                <div className="w-2 h-2 rounded-full bg-gold animate-pulse" />
              ) : (
                <div className="w-2 h-2 rounded-full bg-muted-foreground/30" />
              )}
              {stage.label}
            </div>
            {idx < projectStages.length - 1 && (
              <div
                className={`w-4 h-0.5 mx-0.5 ${
                  isCompleted || isActive ? "bg-gold" : "bg-muted-foreground/20"
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

function MilestoneTimeline({ milestones }: { milestones: Milestone[] }) {
  const [expanded, setExpanded] = useState(false);
  if (!milestones || milestones.length === 0) return <p className="text-sm text-muted-foreground">Belum ada milestone</p>;

  const visible = expanded ? milestones : milestones.slice(0, 3);
  return (
    <div className="space-y-2">
      {visible.map((m, idx) => (
        <div key={m.id} className="flex items-start gap-2">
          <div className="mt-1">
            {m.status === "completed" ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            ) : m.status === "in_progress" ? (
              <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />
            ) : (
              <Clock className="w-4 h-4 text-muted-foreground" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className={`text-sm font-medium ${m.status === "completed" ? "line-through text-muted-foreground" : ""}`}>
              {m.title}
            </p>
            {m.notes && <p className="text-xs text-muted-foreground truncate">{m.notes}</p>}
            {m.completedAt && (
              <p className="text-xs text-muted-foreground">{formatDate(m.completedAt)}</p>
            )}
          </div>
        </div>
      ))}
      {milestones.length > 3 && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-xs text-gold hover:underline flex items-center gap-1"
        >
          {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          {expanded ? "Tutup" : `Lihat ${milestones.length - 3} lagi`}
        </button>
      )}
    </div>
  );
}

// ============================================================
// Main Dashboard Component
// ============================================================

export function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  // Data states
  const [orders, setOrders] = useState<Order[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [adminOrders, setAdminOrders] = useState<Order[]>([]);
  const [adminProjects, setAdminProjects] = useState<Project[]>([]);
  const [managedUsers, setManagedUsers] = useState<ManagedUser[]>([]);

  // Filter states
  const [customerTab, setCustomerTab] = useState("semua");
  const [adminTab, setAdminTab] = useState("overview");
  const [orderFilter, setOrderFilter] = useState("all");
  const [projectFilter, setProjectFilter] = useState("all");
  const [userSearch, setUserSearch] = useState("");

  // Dialog states
  const [editOrderDialog, setEditOrderDialog] = useState(false);
  const [editOrderData, setEditOrderData] = useState<Order | null>(null);
  const [editOrderStatus, setEditOrderStatus] = useState("");

  const [editProjectDialog, setEditProjectDialog] = useState(false);
  const [editProjectData, setEditProjectData] = useState<Project | null>(null);
  const [editProjectForm, setEditProjectForm] = useState({
    projectName: "",
    status: "",
    progress: 0,
    notes: "",
    liveUrl: "",
    estimatedDone: "",
  });

  const [addMilestoneDialog, setAddMilestoneDialog] = useState(false);
  const [addMilestoneProjectId, setAddMilestoneProjectId] = useState("");
  const [newMilestoneTitle, setNewMilestoneTitle] = useState("");

  const [editRoleDialog, setEditRoleDialog] = useState(false);
  const [editRoleUser, setEditRoleUser] = useState<ManagedUser | null>(null);
  const [editRoleValue, setEditRoleValue] = useState("");

  const [deleteDialog, setDeleteDialog] = useState(false);
  const [deleteType, setDeleteType] = useState<"order" | "user" | "project">("order");
  const [deleteId, setDeleteId] = useState("");
  const [deleteName, setDeleteName] = useState("");

  const [orderDetailDialog, setOrderDetailDialog] = useState(false);
  const [orderDetailData, setOrderDetailData] = useState<Order | null>(null);

  const [projectDetailDialog, setProjectDetailDialog] = useState(false);
  const [projectDetailData, setProjectDetailData] = useState<Project | null>(null);

  const [actionLoading, setActionLoading] = useState(false);

  const role = (session?.user as { role?: string })?.role || "customer";
  const isAdmin = role === "admin" || role === "super-admin";
  const isSuperAdmin = role === "super-admin";

  // ============================================================
  // Data Fetching
  // ============================================================

  const fetchCustomerData = useCallback(async () => {
    try {
      const [ordersRes, projectsRes] = await Promise.all([
        fetch("/api/orders"),
        fetch("/api/projects"),
      ]);
      if (ordersRes.ok) {
        const data = await ordersRes.json();
        setOrders(data.orders || []);
      }
      if (projectsRes.ok) {
        const data = await projectsRes.json();
        setProjects(data.projects || []);
      }
    } catch {
      toast.error("Gagal memuat data");
    }
  }, []);

  const fetchAdminData = useCallback(async () => {
    try {
      const [ordersRes, projectsRes] = await Promise.all([
        fetch("/api/admin/super/orders"),
        fetch("/api/admin/super/projects"),
      ]);
      if (ordersRes.ok) {
        const data = await ordersRes.json();
        setAdminOrders(data.orders || []);
      }
      if (projectsRes.ok) {
        const data = await projectsRes.json();
        setAdminProjects(data.projects || []);
      }
      if (isSuperAdmin) {
        const usersRes = await fetch("/api/admin/super/users");
        if (usersRes.ok) {
          const data = await usersRes.json();
          setManagedUsers(data.users || []);
        }
      }
    } catch {
      toast.error("Gagal memuat data admin");
    }
  }, [isSuperAdmin]);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }
    if (status === "authenticated") {
      setLoading(false);
      fetchCustomerData();
      if (isAdmin) {
        fetchAdminData();
      }
    }
  }, [status, router, fetchCustomerData, fetchAdminData, isAdmin]);

  // ============================================================
  // CRUD Operations
  // ============================================================

  const handleUpdateOrderStatus = async () => {
    if (!editOrderData) return;
    setActionLoading(true);
    try {
      const res = await fetch(`/api/admin/super/orders`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: editOrderData.id, status: editOrderStatus }),
      });
      if (res.ok) {
        toast.success("Status pesanan diperbarui");
        setEditOrderDialog(false);
        fetchAdminData();
        fetchCustomerData();
      } else {
        const data = await res.json();
        toast.error(data.error || "Gagal memperbarui status");
      }
    } catch {
      toast.error("Terjadi kesalahan");
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateProject = async () => {
    if (!editProjectData) return;
    setActionLoading(true);
    try {
      const res = await fetch(`/api/admin/super/projects`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editProjectData.id,
          projectName: editProjectForm.projectName,
          status: editProjectForm.status,
          progress: Number(editProjectForm.progress),
          notes: editProjectForm.notes,
          liveUrl: editProjectForm.liveUrl,
          estimatedDone: editProjectForm.estimatedDone || null,
        }),
      });
      if (res.ok) {
        toast.success("Project diperbarui");
        setEditProjectDialog(false);
        fetchAdminData();
        fetchCustomerData();
      } else {
        const data = await res.json();
        toast.error(data.error || "Gagal memperbarui project");
      }
    } catch {
      toast.error("Terjadi kesalahan");
    } finally {
      setActionLoading(false);
    }
  };

  const handleAddMilestone = async () => {
    if (!addMilestoneProjectId || !newMilestoneTitle.trim()) return;
    setActionLoading(true);
    try {
      const res = await fetch(`/api/admin/super/projects`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: addMilestoneProjectId,
          addMilestone: true,
          milestoneTitle: newMilestoneTitle.trim(),
        }),
      });
      if (res.ok) {
        toast.success("Milestone ditambahkan");
        setAddMilestoneDialog(false);
        setNewMilestoneTitle("");
        fetchAdminData();
        fetchCustomerData();
      } else {
        const data = await res.json();
        toast.error(data.error || "Gagal menambahkan milestone");
      }
    } catch {
      toast.error("Terjadi kesalahan");
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateRole = async () => {
    if (!editRoleUser) return;
    setActionLoading(true);
    try {
      const res = await fetch(`/api/admin/super/users`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: editRoleUser.id, role: editRoleValue }),
      });
      if (res.ok) {
        toast.success("Role pengguna diperbarui");
        setEditRoleDialog(false);
        fetchAdminData();
      } else {
        const data = await res.json();
        toast.error(data.error || "Gagal memperbarui role");
      }
    } catch {
      toast.error("Terjadi kesalahan");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    setActionLoading(true);
    try {
      let endpoint = "";
      if (deleteType === "order") endpoint = `/api/admin/super/orders?id=${deleteId}`;
      else if (deleteType === "project") endpoint = `/api/admin/super/projects?id=${deleteId}`;
      else endpoint = `/api/admin/super/users?id=${deleteId}`;

      const res = await fetch(endpoint, { method: "DELETE" });
      if (res.ok) {
        toast.success("Berhasil dihapus");
        setDeleteDialog(false);
        fetchAdminData();
        fetchCustomerData();
      } else {
        const data = await res.json();
        toast.error(data.error || "Gagal menghapus");
      }
    } catch {
      toast.error("Terjadi kesalahan");
    } finally {
      setActionLoading(false);
    }
  };

  const openEditOrder = (order: Order) => {
    setEditOrderData(order);
    setEditOrderStatus(order.status);
    setEditOrderDialog(true);
  };

  const openEditProject = (project: Project) => {
    setEditProjectData(project);
    setEditProjectForm({
      projectName: project.projectName,
      status: project.status,
      progress: project.progress,
      notes: project.notes || "",
      liveUrl: project.liveUrl || "",
      estimatedDone: project.estimatedDone ? new Date(project.estimatedDone).toISOString().split("T")[0] : "",
    });
    setEditProjectDialog(true);
  };

  const openDeleteDialog = (type: "order" | "user" | "project", id: string, name: string) => {
    setDeleteType(type);
    setDeleteId(id);
    setDeleteName(name);
    setDeleteDialog(true);
  };

  const openEditRole = (user: ManagedUser) => {
    setEditRoleUser(user);
    setEditRoleValue(user.role);
    setEditRoleDialog(true);
  };

  const sendWhatsApp = (phone: string, orderId: string, pkgName: string) => {
    const cleanPhone = phone.replace(/^0/, "62").replace(/\D/g, "");
    const msg = encodeURIComponent(
      `Halo, terkait pesanan *${orderId}* untuk paket *${pkgName}*. Kami ingin mengonfirmasi pesanan Anda. Terima kasih! - Zheng Digital Studio`
    );
    window.open(`https://wa.me/${cleanPhone}?text=${msg}`, "_blank");
  };

  // ============================================================
  // Filtered Data
  // ============================================================

  const filteredCustomerOrders = orders.filter((o) => {
    if (customerTab === "semua") return true;
    if (customerTab === "menunggu") return o.status === "pending";
    if (customerTab === "dibayar") return o.status === "paid" || o.status === "confirmed";
    if (customerTab === "project") return o.project !== null && o.project !== undefined;
    return true;
  });

  const filteredAdminOrders = adminOrders.filter((o) => {
    if (orderFilter === "all") return true;
    return o.status === orderFilter;
  });

  const filteredAdminProjects = adminProjects.filter((p) => {
    if (projectFilter === "all") return true;
    return p.status === projectFilter;
  });

  const filteredUsers = managedUsers.filter((u) => {
    if (!userSearch) return true;
    const q = userSearch.toLowerCase();
    return (
      (u.name && u.name.toLowerCase().includes(q)) ||
      u.email.toLowerCase().includes(q) ||
      (u.businessName && u.businessName.toLowerCase().includes(q))
    );
  });

  // ============================================================
  // Admin Stats
  // ============================================================

  const adminStats = {
    totalRevenue: adminOrders
      .filter((o) => o.status === "paid" || o.status === "confirmed" || o.status === "completed")
      .reduce((sum, o) => sum + o.payAmount, 0),
    pendingOrders: adminOrders.filter((o) => o.status === "pending").length,
    paidOrders: adminOrders.filter((o) => o.status === "paid" || o.status === "confirmed").length,
    completedOrders: adminOrders.filter((o) => o.status === "completed").length,
    activeProjects: adminProjects.filter(
      (p) => p.status !== "cancelled" && p.status !== "online"
    ).length,
    onlineProjects: adminProjects.filter((p) => p.status === "online").length,
    totalUsers: managedUsers.length,
    recentOrders: [...adminOrders]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5),
  };

  // ============================================================
  // Loading & Auth Guard
  // ============================================================

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-gold mx-auto mb-4" />
          <p className="text-muted-foreground">Memuat dashboard...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 glass border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => router.push("/")} className="text-foreground">
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center overflow-hidden">
                <img src="/favicon.png" alt="ZDS" className="w-full h-full object-contain" />
              </div>
              <span className="font-bold text-lg hidden sm:block">
                ZDS <span className="text-gold">Dashboard</span>
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <RoleBadge role={role} />
            <div className="hidden sm:flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gold/10 flex items-center justify-center border border-gold/20">
                <User className="w-4 h-4 text-gold" />
              </div>
              <span className="text-sm font-medium">{session.user?.name || session.user?.email}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {isAdmin ? (
            // ============================================================
            // ADMIN DASHBOARD
            // ============================================================
            <Tabs value={adminTab} onValueChange={setAdminTab}>
              <TabsList className="mb-6 flex-wrap h-auto gap-1 bg-muted/50 p-1">
                <TabsTrigger value="overview" className="gap-1.5">
                  <BarChart3 className="w-4 h-4" /> Overview
                </TabsTrigger>
                <TabsTrigger value="pesanan" className="gap-1.5">
                  <Package className="w-4 h-4" /> Pesanan
                </TabsTrigger>
                <TabsTrigger value="project" className="gap-1.5">
                  <FolderKanban className="w-4 h-4" /> Project
                </TabsTrigger>
                {isSuperAdmin && (
                  <TabsTrigger value="users" className="gap-1.5">
                    <Users className="w-4 h-4" /> Users
                  </TabsTrigger>
                )}
                <TabsTrigger value="pesanan-saya" className="gap-1.5">
                  <CreditCard className="w-4 h-4" /> Pesanan Saya
                </TabsTrigger>
              </TabsList>

              {/* ---- OVERVIEW TAB ---- */}
              <TabsContent value="overview" className="space-y-6">
                {/* Revenue Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">Total Revenue</p>
                          <p className="text-xl font-bold text-gold">{formatPrice(adminStats.totalRevenue)}</p>
                        </div>
                        <div className="w-10 h-10 rounded-lg bg-gold/10 flex items-center justify-center">
                          <CreditCard className="w-5 h-5 text-gold" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">Pesanan Menunggu</p>
                          <p className="text-xl font-bold text-yellow-600">{adminStats.pendingOrders}</p>
                        </div>
                        <div className="w-10 h-10 rounded-lg bg-yellow-100 dark:bg-yellow-900/20 flex items-center justify-center">
                          <Clock className="w-5 h-5 text-yellow-600" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">Project Aktif</p>
                          <p className="text-xl font-bold text-blue-600">{adminStats.activeProjects}</p>
                        </div>
                        <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                          <FolderKanban className="w-5 h-5 text-blue-600" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">Project Online</p>
                          <p className="text-xl font-bold text-emerald-600">{adminStats.onlineProjects}</p>
                        </div>
                        <div className="w-10 h-10 rounded-lg bg-emerald-100 dark:bg-emerald-900/20 flex items-center justify-center">
                          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Order Summary & Recent Orders */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">Ringkasan Pesanan</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {Object.entries(orderStatusConfig).map(([key, config]) => {
                          const count = adminOrders.filter((o) => o.status === key).length;
                          if (count === 0) return null;
                          return (
                            <div key={key} className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <config.icon className="w-4 h-4 text-muted-foreground" />
                                <span className="text-sm">{config.label}</span>
                              </div>
                              <Badge variant="secondary" className={config.color}>
                                {count}
                              </Badge>
                            </div>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">Pesanan Terbaru</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3 max-h-64 overflow-y-auto">
                        {adminStats.recentOrders.length === 0 && (
                          <p className="text-sm text-muted-foreground text-center py-4">Belum ada pesanan</p>
                        )}
                        {adminStats.recentOrders.map((order) => (
                          <div
                            key={order.id}
                            className="flex items-center justify-between py-2 border-b border-border/50 last:border-0"
                          >
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-medium truncate">{order.packageName}</p>
                              <p className="text-xs text-muted-foreground">
                                {order.customerName} • {formatDate(order.createdAt)}
                              </p>
                            </div>
                            <StatusBadge status={order.status} />
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Project Summary */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Ringkasan Project</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      {Object.entries(projectStatusConfig).map(([key, config]) => {
                        const count = adminProjects.filter((p) => p.status === key).length;
                        if (count === 0) return null;
                        return (
                          <div key={key} className="text-center p-3 rounded-lg bg-muted/50">
                            <Badge variant="secondary" className={`${config.color} mb-2`}>
                              {config.label}
                            </Badge>
                            <p className="text-2xl font-bold">{count}</p>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* ---- PESANAN TAB ---- */}
              <TabsContent value="pesanan" className="space-y-4">
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <h2 className="text-lg font-semibold">Semua Pesanan</h2>
                  <Select value={orderFilter} onValueChange={setOrderFilter}>
                    <SelectTrigger className="w-44">
                      <SelectValue placeholder="Filter status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Semua Status</SelectItem>
                      {Object.entries(orderStatusConfig).map(([key, config]) => (
                        <SelectItem key={key} value={key}>
                          {config.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {filteredAdminOrders.length === 0 ? (
                  <Card>
                    <CardContent className="py-12 text-center">
                      <Package className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                      <p className="text-muted-foreground">Belum ada pesanan</p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-3 max-h-[calc(100vh-280px)] overflow-y-auto pr-1">
                    {filteredAdminOrders.map((order) => (
                      <Card key={order.id} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-4">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-xs font-mono text-muted-foreground">{order.orderId}</span>
                                <StatusBadge status={order.status} />
                              </div>
                              <p className="font-medium truncate">{order.packageName}</p>
                              <p className="text-sm text-muted-foreground">
                                {order.customerName} • {order.customerEmail}
                              </p>
                              <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <Calendar className="w-3 h-3" />
                                  {formatDate(order.createdAt)}
                                </span>
                                <span className="font-semibold text-foreground">
                                  {formatPrice(order.payAmount)}
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setOrderDetailData(order);
                                  setOrderDetailDialog(true);
                                }}
                              >
                                <Eye className="w-3 h-3 mr-1" /> Detail
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => sendWhatsApp(order.customerPhone, order.orderId, order.packageName)}
                              >
                                <MessageCircle className="w-3 h-3 mr-1" /> WA
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => openEditOrder(order)}
                                className="text-gold border-gold/30 hover:bg-gold/10"
                              >
                                <Edit3 className="w-3 h-3" />
                              </Button>
                              {isSuperAdmin && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => openDeleteDialog("order", order.id, order.orderId)}
                                  className="text-destructive border-destructive/30 hover:bg-destructive/10"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </Button>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>

              {/* ---- PROJECT TAB ---- */}
              <TabsContent value="project" className="space-y-4">
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <h2 className="text-lg font-semibold">Semua Project</h2>
                  <Select value={projectFilter} onValueChange={setProjectFilter}>
                    <SelectTrigger className="w-44">
                      <SelectValue placeholder="Filter status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Semua Status</SelectItem>
                      {Object.entries(projectStatusConfig).map(([key, config]) => (
                        <SelectItem key={key} value={key}>
                          {config.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {filteredAdminProjects.length === 0 ? (
                  <Card>
                    <CardContent className="py-12 text-center">
                      <FolderKanban className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                      <p className="text-muted-foreground">Belum ada project</p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-3 max-h-[calc(100vh-280px)] overflow-y-auto pr-1">
                    {filteredAdminProjects.map((project) => (
                      <Card key={project.id} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-4">
                          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <ProjectStatusBadge status={project.status} />
                                <span className="text-xs text-muted-foreground">{project.packageCategory}</span>
                              </div>
                              <p className="font-medium truncate">{project.projectName}</p>
                              {project.user && (
                                <p className="text-sm text-muted-foreground">
                                  {project.user.name} • {project.user.email}
                                </p>
                              )}
                              {project.order && (
                                <p className="text-xs text-muted-foreground mt-0.5">
                                  {project.order.orderId} • {project.order.packageName} • {formatPrice(project.order.packagePrice)}
                                </p>
                              )}
                              <div className="mt-2">
                                <ProjectStageVisualization status={project.status} />
                              </div>
                              <div className="flex items-center gap-3 mt-2">
                                <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                                  <div
                                    className="h-full bg-gold rounded-full transition-all duration-500"
                                    style={{ width: `${project.progress}%` }}
                                  />
                                </div>
                                <span className="text-xs font-medium text-muted-foreground">{project.progress}%</span>
                              </div>
                              {project.milestones.length > 0 && (
                                <div className="mt-3 pt-3 border-t border-border/50">
                                  <p className="text-xs font-medium text-muted-foreground mb-1">Milestones</p>
                                  <MilestoneTimeline milestones={project.milestones} />
                                </div>
                              )}
                              <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <Calendar className="w-3 h-3" /> Mulai: {formatDate(project.startedAt)}
                                </span>
                                {project.estimatedDone && (
                                  <span className="flex items-center gap-1">
                                    Estimasi: {formatDate(project.estimatedDone)}
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setProjectDetailData(project);
                                  setProjectDetailDialog(true);
                                }}
                              >
                                <Eye className="w-3 h-3 mr-1" /> Detail
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setAddMilestoneProjectId(project.id);
                                  setAddMilestoneDialog(true);
                                }}
                                className="text-emerald-600 border-emerald-300 hover:bg-emerald-50 dark:border-emerald-700 dark:hover:bg-emerald-900/20"
                              >
                                <Plus className="w-3 h-3" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => openEditProject(project)}
                                className="text-gold border-gold/30 hover:bg-gold/10"
                              >
                                <Edit3 className="w-3 h-3" />
                              </Button>
                              {isSuperAdmin && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => openDeleteDialog("project", project.id, project.projectName)}
                                  className="text-destructive border-destructive/30 hover:bg-destructive/10"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </Button>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>

              {/* ---- USERS TAB (Super Admin Only) ---- */}
              {isSuperAdmin && (
                <TabsContent value="users" className="space-y-4">
                  <div className="flex items-center justify-between flex-wrap gap-3">
                    <h2 className="text-lg font-semibold">Manajemen Pengguna</h2>
                    <div className="relative w-64">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        placeholder="Cari pengguna..."
                        value={userSearch}
                        onChange={(e) => setUserSearch(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  {filteredUsers.length === 0 ? (
                    <Card>
                      <CardContent className="py-12 text-center">
                        <Users className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                        <p className="text-muted-foreground">Tidak ada pengguna ditemukan</p>
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="space-y-3 max-h-[calc(100vh-280px)] overflow-y-auto pr-1">
                      {filteredUsers.map((user) => (
                        <Card key={user.id} className="hover:shadow-md transition-shadow">
                          <CardContent className="p-4">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                              <div className="flex items-center gap-3 min-w-0">
                                <div className="w-10 h-10 rounded-full bg-gold/10 flex items-center justify-center border border-gold/20 shrink-0">
                                  {user.image ? (
                                    <img src={user.image} alt={user.name || ""} className="w-full h-full rounded-full object-cover" />
                                  ) : (
                                    <User className="w-5 h-5 text-gold" />
                                  )}
                                </div>
                                <div className="min-w-0">
                                  <div className="flex items-center gap-2">
                                    <p className="font-medium truncate">{user.name || "Tanpa Nama"}</p>
                                    <RoleBadge role={user.role} />
                                  </div>
                                  <p className="text-sm text-muted-foreground truncate">{user.email}</p>
                                  <div className="flex items-center gap-3 mt-0.5 text-xs text-muted-foreground">
                                    {user.phone && <span>{user.phone}</span>}
                                    {user.businessName && <span>• {user.businessName}</span>}
                                    <span>• Pesanan: {user._count.orders}</span>
                                    <span>• Project: {user._count.projects}</span>
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => openEditRole(user)}
                                  className="text-gold border-gold/30 hover:bg-gold/10"
                                >
                                  <Edit3 className="w-3 h-3 mr-1" /> Role
                                </Button>
                                {user.role !== "super-admin" && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => openDeleteDialog("user", user.id, user.name || user.email)}
                                    className="text-destructive border-destructive/30 hover:bg-destructive/10"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </Button>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </TabsContent>
              )}

              {/* ---- PESANAN SAYA TAB ---- */}
              <TabsContent value="pesanan-saya" className="space-y-4">
                <h2 className="text-lg font-semibold">Pesanan Saya</h2>
                {orders.length === 0 ? (
                  <Card>
                    <CardContent className="py-12 text-center">
                      <Package className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                      <p className="text-muted-foreground">Anda belum memiliki pesanan</p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-3 max-h-[calc(100vh-240px)] overflow-y-auto pr-1">
                    {orders.map((order) => (
                      <Card key={order.id} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-4">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-xs font-mono text-muted-foreground">{order.orderId}</span>
                                <StatusBadge status={order.status} />
                              </div>
                              <p className="font-medium truncate">{order.packageName}</p>
                              <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <Calendar className="w-3 h-3" />
                                  {formatDate(order.createdAt)}
                                </span>
                                <span className="font-semibold text-foreground">
                                  {formatPrice(order.payAmount)}
                                </span>
                              </div>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setOrderDetailData(order);
                                setOrderDetailDialog(true);
                              }}
                            >
                              <Eye className="w-3 h-3 mr-1" /> Detail
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          ) : (
            // ============================================================
            // CUSTOMER DASHBOARD
            // ============================================================
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl font-bold">
                  Halo, <span className="text-gold">{session.user?.name || "Customer"}</span> 👋
                </h1>
                <p className="text-muted-foreground mt-1">Selamat datang di dashboard Anda</p>
              </div>

              {/* Customer Quick Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-4 text-center">
                    <Package className="w-6 h-6 text-gold mx-auto mb-1" />
                    <p className="text-2xl font-bold">{orders.length}</p>
                    <p className="text-xs text-muted-foreground">Total Pesanan</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <Clock className="w-6 h-6 text-yellow-500 mx-auto mb-1" />
                    <p className="text-2xl font-bold">
                      {orders.filter((o) => o.status === "pending").length}
                    </p>
                    <p className="text-xs text-muted-foreground">Menunggu</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <CheckCircle2 className="w-6 h-6 text-emerald-500 mx-auto mb-1" />
                    <p className="text-2xl font-bold">
                      {orders.filter((o) => o.status === "paid" || o.status === "confirmed").length}
                    </p>
                    <p className="text-xs text-muted-foreground">Dibayar</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <FolderKanban className="w-6 h-6 text-blue-500 mx-auto mb-1" />
                    <p className="text-2xl font-bold">{projects.length}</p>
                    <p className="text-xs text-muted-foreground">Project</p>
                  </CardContent>
                </Card>
              </div>

              {/* Customer Orders */}
              <Tabs value={customerTab} onValueChange={setCustomerTab}>
                <TabsList className="mb-4 flex-wrap h-auto gap-1 bg-muted/50 p-1">
                  <TabsTrigger value="semua">Semua</TabsTrigger>
                  <TabsTrigger value="menunggu">Menunggu</TabsTrigger>
                  <TabsTrigger value="dibayar">Dibayar</TabsTrigger>
                  <TabsTrigger value="project">Project</TabsTrigger>
                </TabsList>

                <TabsContent value={customerTab} className="space-y-3">
                  {filteredCustomerOrders.length === 0 ? (
                    <Card>
                      <CardContent className="py-12 text-center">
                        <Package className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                        <p className="text-muted-foreground">Belum ada pesanan</p>
                      </CardContent>
                    </Card>
                  ) : (
                    filteredCustomerOrders.map((order) => (
                      <Card key={order.id} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-4">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-xs font-mono text-muted-foreground">{order.orderId}</span>
                                <StatusBadge status={order.status} />
                              </div>
                              <p className="font-medium truncate">{order.packageName}</p>
                              <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <Calendar className="w-3 h-3" />
                                  {formatDate(order.createdAt)}
                                </span>
                                <span className="font-semibold text-foreground">
                                  {formatPrice(order.payAmount)}
                                </span>
                              </div>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setOrderDetailData(order);
                                setOrderDetailDialog(true);
                              }}
                            >
                              <Eye className="w-3 h-3 mr-1" /> Detail
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </TabsContent>
              </Tabs>

              {/* Customer Projects */}
              {projects.length > 0 && (
                <div>
                  <h2 className="text-lg font-semibold mb-4">Project Saya</h2>
                  <div className="space-y-3">
                    {projects.map((project) => (
                      <Card key={project.id} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-4">
                          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <ProjectStatusBadge status={project.status} />
                                <span className="text-xs text-muted-foreground">{project.packageCategory}</span>
                              </div>
                              <p className="font-medium truncate">{project.projectName}</p>
                              {project.order && (
                                <p className="text-xs text-muted-foreground mt-0.5">
                                  {project.order.orderId} • {project.order.packageName}
                                </p>
                              )}
                              <div className="mt-2">
                                <ProjectStageVisualization status={project.status} />
                              </div>
                              <div className="flex items-center gap-3 mt-2">
                                <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden max-w-xs">
                                  <div
                                    className="h-full bg-gold rounded-full transition-all duration-500"
                                    style={{ width: `${project.progress}%` }}
                                  />
                                </div>
                                <span className="text-xs font-medium text-muted-foreground">{project.progress}%</span>
                              </div>
                              {project.milestones.length > 0 && (
                                <div className="mt-3 pt-3 border-t border-border/50">
                                  <p className="text-xs font-medium text-muted-foreground mb-1">Milestones</p>
                                  <MilestoneTimeline milestones={project.milestones} />
                                </div>
                              )}
                              <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <Calendar className="w-3 h-3" /> Mulai: {formatDate(project.startedAt)}
                                </span>
                                {project.estimatedDone && (
                                  <span>Estimasi: {formatDate(project.estimatedDone)}</span>
                                )}
                              </div>
                              {project.liveUrl && (
                                <a
                                  href={project.liveUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-xs text-gold hover:underline mt-1 inline-block"
                                >
                                  {project.liveUrl}
                                </a>
                              )}
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setProjectDetailData(project);
                                setProjectDetailDialog(true);
                              }}
                            >
                              <Eye className="w-3 h-3 mr-1" /> Detail
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </motion.div>
      </main>

      {/* ============================================================ */}
      {/* DIALOGS */}
      {/* ============================================================ */}

      {/* Order Detail Dialog */}
      <Dialog open={orderDetailDialog} onOpenChange={setOrderDetailDialog}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detail Pesanan</DialogTitle>
            <DialogDescription>{orderDetailData?.orderId}</DialogDescription>
          </DialogHeader>
          {orderDetailData && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-muted-foreground">Status</p>
                  <StatusBadge status={orderDetailData.status} />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Paket</p>
                  <p className="text-sm font-medium">{orderDetailData.packageName}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Nama Customer</p>
                  <p className="text-sm">{orderDetailData.customerName}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Email</p>
                  <p className="text-sm break-all">{orderDetailData.customerEmail}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">WhatsApp</p>
                  <p className="text-sm">{orderDetailData.customerPhone}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Bisnis</p>
                  <p className="text-sm">{orderDetailData.businessName || "-"}</p>
                </div>
              </div>
              <div className="border-t pt-3 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Harga Paket</span>
                  <span>{formatPrice(orderDetailData.packagePrice)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">PPN (11%)</span>
                  <span>{formatPrice(orderDetailData.ppnAmount)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Biaya Transaksi</span>
                  <span>{formatPrice(orderDetailData.transactionFee)}</span>
                </div>
                <div className="flex justify-between text-sm font-semibold border-t pt-2">
                  <span>Total Bayar</span>
                  <span className="text-gold">{formatPrice(orderDetailData.payAmount)}</span>
                </div>
                {orderDetailData.isDP && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">DP Minimal</span>
                    <span>{formatPrice(orderDetailData.dpMinimal)}</span>
                  </div>
                )}
              </div>
              {orderDetailData.notes && (
                <div>
                  <p className="text-xs text-muted-foreground">Catatan</p>
                  <p className="text-sm">{orderDetailData.notes}</p>
                </div>
              )}
              <div className="border-t pt-3 grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                <span>Dibuat: {formatDateTime(orderDetailData.createdAt)}</span>
                <span>Diperbarui: {formatDateTime(orderDetailData.updatedAt)}</span>
                {orderDetailData.paidAt && <span>Dibayar: {formatDateTime(orderDetailData.paidAt)}</span>}
                {orderDetailData.expiredAt && <span>Expired: {formatDateTime(orderDetailData.expiredAt)}</span>}
              </div>
              {orderDetailData.transactions.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-2">Transaksi</p>
                  <div className="space-y-2">
                    {orderDetailData.transactions.map((tx) => (
                      <div key={tx.id} className="p-2 rounded bg-muted/50 text-xs">
                        <div className="flex justify-between">
                          <span>ID: {tx.transactionId || "-"}</span>
                          <span>{tx.transactionStatus || "-"}</span>
                        </div>
                        {tx.grossAmount && (
                          <span className="text-muted-foreground">{formatPrice(tx.grossAmount)} • {tx.paymentType || "-"}</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setOrderDetailDialog(false)}>
              Tutup
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Project Detail Dialog */}
      <Dialog open={projectDetailDialog} onOpenChange={setProjectDetailDialog}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detail Project</DialogTitle>
            <DialogDescription>{projectDetailData?.projectName}</DialogDescription>
          </DialogHeader>
          {projectDetailData && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <ProjectStatusBadge status={projectDetailData.status} />
                <span className="text-sm text-muted-foreground">{projectDetailData.packageCategory}</span>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-2">Stage</p>
                <ProjectStageVisualization status={projectDetailData.status} />
              </div>
              <div className="flex items-center gap-3">
                <div className="flex-1 h-3 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gold rounded-full transition-all duration-500"
                    style={{ width: `${projectDetailData.progress}%` }}
                  />
                </div>
                <span className="text-sm font-semibold">{projectDetailData.progress}%</span>
              </div>
              {projectDetailData.milestones.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-2">Milestones</p>
                  <MilestoneTimeline milestones={projectDetailData.milestones} />
                </div>
              )}
              {projectDetailData.notes && (
                <div>
                  <p className="text-xs text-muted-foreground">Catatan</p>
                  <p className="text-sm">{projectDetailData.notes}</p>
                </div>
              )}
              {projectDetailData.liveUrl && (
                <div>
                  <p className="text-xs text-muted-foreground">Live URL</p>
                  <a href={projectDetailData.liveUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-gold hover:underline">
                    {projectDetailData.liveUrl}
                  </a>
                </div>
              )}
              <div className="grid grid-cols-2 gap-3 text-xs text-muted-foreground border-t pt-3">
                <span>Mulai: {formatDate(projectDetailData.startedAt)}</span>
                <span>Estimasi: {formatDate(projectDetailData.estimatedDone)}</span>
                {projectDetailData.completedAt && <span>Selesai: {formatDate(projectDetailData.completedAt)}</span>}
              </div>
              {projectDetailData.user && (
                <div className="text-xs text-muted-foreground border-t pt-3">
                  <p>Customer: {projectDetailData.user.name} • {projectDetailData.user.email}</p>
                  {projectDetailData.user.phone && <p>Phone: {projectDetailData.user.phone}</p>}
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setProjectDetailDialog(false)}>
              Tutup
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Order Status Dialog */}
      <Dialog open={editOrderDialog} onOpenChange={setEditOrderDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Status Pesanan</DialogTitle>
            <DialogDescription>{editOrderData?.orderId}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Paket: {editOrderData?.packageName}</p>
              <p className="text-sm text-muted-foreground">Customer: {editOrderData?.customerName}</p>
            </div>
            <Select value={editOrderStatus} onValueChange={setEditOrderStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Pilih status" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(orderStatusConfig).map(([key, config]) => (
                  <SelectItem key={key} value={key}>
                    {config.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOrderDialog(false)}>
              Batal
            </Button>
            <Button onClick={handleUpdateOrderStatus} disabled={actionLoading} className="bg-gold hover:bg-gold-hover text-navy">
              {actionLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Simpan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Project Dialog */}
      <Dialog open={editProjectDialog} onOpenChange={setEditProjectDialog}>
        <DialogContent className="max-w-md max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Project</DialogTitle>
            <DialogDescription>{editProjectData?.projectName}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Nama Project</Label>
              <Input
                value={editProjectForm.projectName}
                onChange={(e) => setEditProjectForm({ ...editProjectForm, projectName: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium">Status</Label>
              <Select value={editProjectForm.status} onValueChange={(v) => setEditProjectForm({ ...editProjectForm, status: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(projectStatusConfig).map(([key, config]) => (
                    <SelectItem key={key} value={key}>
                      {config.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium">Progress ({editProjectForm.progress}%)</Label>
              <Input
                type="number"
                min={0}
                max={100}
                value={editProjectForm.progress}
                onChange={(e) => setEditProjectForm({ ...editProjectForm, progress: Number(e.target.value) })}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium">Catatan</Label>
              <Input
                value={editProjectForm.notes}
                onChange={(e) => setEditProjectForm({ ...editProjectForm, notes: e.target.value })}
                placeholder="Opsional"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium">Live URL</Label>
              <Input
                value={editProjectForm.liveUrl}
                onChange={(e) => setEditProjectForm({ ...editProjectForm, liveUrl: e.target.value })}
                placeholder="https://..."
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium">Estimasi Selesai</Label>
              <Input
                type="date"
                value={editProjectForm.estimatedDone}
                onChange={(e) => setEditProjectForm({ ...editProjectForm, estimatedDone: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditProjectDialog(false)}>
              Batal
            </Button>
            <Button onClick={handleUpdateProject} disabled={actionLoading} className="bg-gold hover:bg-gold-hover text-navy">
              {actionLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Simpan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Milestone Dialog */}
      <Dialog open={addMilestoneDialog} onOpenChange={setAddMilestoneDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tambah Milestone</DialogTitle>
            <DialogDescription>Tambahkan milestone baru ke project</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Judul Milestone</Label>
              <Input
                value={newMilestoneTitle}
                onChange={(e) => setNewMilestoneTitle(e.target.value)}
                placeholder="Contoh: Desain homepage selesai"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddMilestoneDialog(false)}>
              Batal
            </Button>
            <Button onClick={handleAddMilestone} disabled={actionLoading || !newMilestoneTitle.trim()} className="bg-gold hover:bg-gold-hover text-navy">
              {actionLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
              Tambah
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Role Dialog */}
      <Dialog open={editRoleDialog} onOpenChange={setEditRoleDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Role Pengguna</DialogTitle>
            <DialogDescription>
              {editRoleUser?.name || editRoleUser?.email}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Role saat ini:</p>
              <RoleBadge role={editRoleUser?.role || "customer"} />
            </div>
            <Select value={editRoleValue} onValueChange={setEditRoleValue}>
              <SelectTrigger>
                <SelectValue placeholder="Pilih role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="customer">Customer</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="super-admin">Super Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditRoleDialog(false)}>
              Batal
            </Button>
            <Button onClick={handleUpdateRole} disabled={actionLoading} className="bg-gold hover:bg-gold-hover text-navy">
              {actionLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Simpan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialog} onOpenChange={setDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Konfirmasi Hapus</DialogTitle>
            <DialogDescription>
              Apakah Anda yakin ingin menghapus{" "}
              {deleteType === "order"
                ? "pesanan"
                : deleteType === "project"
                ? "project"
                : "pengguna"}{" "}
              <strong>{deleteName}</strong>? Tindakan ini tidak dapat dibatalkan.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialog(false)}>
              Batal
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={actionLoading}>
              {actionLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Trash2 className="w-4 h-4 mr-2" />}
              Hapus
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
