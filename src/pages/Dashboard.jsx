import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";
import "./Dashboard.css";

// Default initial tasks for demo or offline state
const INITIAL_TASKS = [
  {
    _id: "demo-task-1",
    title: "Implement JWT Authentication & Refresh Tokens",
    description: "Connect MongoDB user credentials with bcrypt password hashing and token cookies.",
    completed: true,
    priority: "High",
    category: "Backend",
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    _id: "demo-task-2",
    title: "Design Responsive Modern Glassmorphic Dashboard",
    description: "Create sleek task cards, KPI summary metrics, search filtering, and smooth animations.",
    completed: true,
    priority: "High",
    category: "Frontend",
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    _id: "demo-task-3",
    title: "Set Up MongoDB Atlas Cluster & Schema Validation",
    description: "Configure connection pooling, environment variables, and indexes for task collections.",
    completed: false,
    priority: "Medium",
    category: "Database",
    createdAt: new Date(Date.now() - 3600000 * 12).toISOString(),
  },
  {
    _id: "demo-task-4",
    title: "Build RESTful API Task Controller & Endpoints",
    description: "Provide robust GET, POST, PUT, DELETE endpoints with error handling middleware.",
    completed: false,
    priority: "High",
    category: "Backend",
    createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
  },
  {
    _id: "demo-task-5",
    title: "Optimize Performance & Lighthouse Score",
    description: "Audit bundle size, cache static assets, and ensure full accessibility compliance.",
    completed: false,
    priority: "Low",
    category: "DevOps",
    createdAt: new Date().toISOString(),
  },
];

function Dashboard() {
  const { user, token, logout, loginDemo } = useAuth();
  const navigate = useNavigate();

  // State
  const [tasks, setTasks] = useState(() => {
    try {
      const saved = localStorage.getItem("local_tasks");
      return saved ? JSON.parse(saved) : INITIAL_TASKS;
    } catch {
      return INITIAL_TASKS;
    }
  });

  const [loading, setLoading] = useState(false);
  const [apiConnected, setApiConnected] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("all"); // 'all' | 'pending' | 'completed' | 'high'
  const [activeCategory, setActiveCategory] = useState("all");
  const [sortBy, setSortBy] = useState("newest"); // 'newest' | 'oldest' | 'title' | 'priority'
  const [viewMode, setViewMode] = useState("grid"); // 'grid' | 'list'

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    priority: "Medium",
    category: "Frontend",
  });
  const [submitting, setSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  const displayUser = user || {
    name: "Alex Morgan",
    email: "alex.morgan@mernflow.dev",
    role: "Fullstack Architect",
  };

  // Toast notification helper
  const showToast = (message) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  // Fetch tasks from API on mount
  useEffect(() => {
    let isMounted = true;
    const fetchTasks = async () => {
      if (!token) {
        setApiConnected(false);
        return;
      }
      setLoading(true);
      try {
        const res = await api.get("/tasks");
        if (isMounted && Array.isArray(res.data)) {
          if (res.data.length > 0) {
            setTasks(res.data);
            localStorage.setItem("local_tasks", JSON.stringify(res.data));
          }
          setApiConnected(true);
        }
      } catch (err) {
        if (isMounted) {
          console.warn("Backend API not reachable or unauthenticated. Using local storage mode.", err.message);
          setApiConnected(false);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchTasks();
    return () => {
      isMounted = false;
    };
  }, [token]);

  // Sync to local storage
  useEffect(() => {
    try {
      localStorage.setItem("local_tasks", JSON.stringify(tasks));
    } catch (e) {
      console.error("Local storage error:", e);
    }
  }, [tasks]);

  // Open modal for new task
  const handleOpenCreateModal = () => {
    setEditingTask(null);
    setFormData({
      title: "",
      description: "",
      priority: "Medium",
      category: "Frontend",
    });
    setIsModalOpen(true);
  };

  // Open modal for editing existing task
  const handleOpenEditModal = (task) => {
    setEditingTask(task);
    setFormData({
      title: task.title,
      description: task.description || "",
      priority: task.priority || "Medium",
      category: task.category || "Frontend",
    });
    setIsModalOpen(true);
  };

  // Close modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingTask(null);
  };

  // Handle Form Submission (Create or Edit)
  const handleSubmitTask = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    setSubmitting(true);
    const taskPayload = {
      title: formData.title.trim(),
      description: formData.description.trim(),
      priority: formData.priority,
      category: formData.category,
      completed: editingTask ? editingTask.completed : false,
    };

    if (apiConnected && token) {
      try {
        if (editingTask && editingTask._id && !editingTask._id.startsWith("demo-")) {
          const res = await api.put(`/tasks/${editingTask._id}`, taskPayload);
          setTasks((prev) =>
            prev.map((t) => (t._id === editingTask._id ? { ...t, ...res.data } : t))
          );
          showToast("Task updated successfully!");
        } else {
          const res = await api.post("/tasks", taskPayload);
          setTasks((prev) => [res.data, ...prev]);
          showToast("New task created!");
        }
        handleCloseModal();
        setSubmitting(false);
        return;
      } catch (err) {
        console.warn("API request failed, falling back to local update", err);
      }
    }

    // Local / Offline fallback
    if (editingTask) {
      setTasks((prev) =>
        prev.map((t) =>
          t._id === editingTask._id
            ? { ...t, ...taskPayload, updatedAt: new Date().toISOString() }
            : t
        )
      );
      showToast("Task updated (Saved locally)");
    } else {
      const newTask = {
        _id: "local-" + Date.now(),
        ...taskPayload,
        createdAt: new Date().toISOString(),
      };
      setTasks((prev) => [newTask, ...prev]);
      showToast("Task created (Saved locally)");
    }

    setSubmitting(false);
    handleCloseModal();
  };

  // Toggle complete
  const handleToggleTask = async (task) => {
    const newStatus = !task.completed;
    // Optimistic UI update
    setTasks((prev) =>
      prev.map((t) => (t._id === task._id ? { ...t, completed: newStatus } : t))
    );

    if (apiConnected && token && !task._id.startsWith("demo-") && !task._id.startsWith("local-")) {
      try {
        await api.put(`/tasks/${task._id}`, { completed: newStatus });
      } catch (err) {
        console.warn("Failed to sync completion status to server", err);
      }
    }

    showToast(newStatus ? "Task marked as completed! 🎉" : "Task marked as pending");
  };

  // Delete task
  const handleDeleteTask = async (taskId) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this task?");
    if (!confirmDelete) return;

    setTasks((prev) => prev.filter((t) => t._id !== taskId));

    if (apiConnected && token && !taskId.startsWith("demo-") && !taskId.startsWith("local-")) {
      try {
        await api.delete(`/tasks/${taskId}`);
      } catch (err) {
        console.warn("Failed to delete task from server", err);
      }
    }

    showToast("Task deleted successfully");
  };

  // Logout handler
  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // Stats calculation
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.completed).length;
  const pendingTasks = totalTasks - completedTasks;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Filtered & Sorted Tasks
  const filteredTasks = useMemo(() => {
    return tasks
      .filter((task) => {
        // Search filter
        const query = searchQuery.toLowerCase().trim();
        const matchesSearch =
          !query ||
          task.title?.toLowerCase().includes(query) ||
          task.description?.toLowerCase().includes(query) ||
          task.category?.toLowerCase().includes(query);

        if (!matchesSearch) return false;

        // Status / Priority filter
        if (activeFilter === "pending" && task.completed) return false;
        if (activeFilter === "completed" && !task.completed) return false;
        if (activeFilter === "high" && task.priority !== "High") return false;

        // Category filter
        if (activeCategory !== "all" && task.category !== activeCategory) return false;

        return true;
      })
      .sort((a, b) => {
        if (sortBy === "newest") {
          return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
        }
        if (sortBy === "oldest") {
          return new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
        }
        if (sortBy === "title") {
          return (a.title || "").localeCompare(b.title || "");
        }
        if (sortBy === "priority") {
          const rank = { High: 3, Medium: 2, Low: 1 };
          return (rank[b.priority] || 2) - (rank[a.priority] || 2);
        }
        return 0;
      });
  }, [tasks, searchQuery, activeFilter, activeCategory, sortBy]);

  // Unique categories for filter pills
  const categories = useMemo(() => {
    const set = new Set(["Frontend", "Backend", "Database", "DevOps", "Design"]);
    tasks.forEach((t) => {
      if (t.category) set.add(t.category);
    });
    return Array.from(set);
  }, [tasks]);

  const currentDateStr = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className="dashboard-layout">
      {/* Toast notification */}
      {toastMessage && <div className="dashboard-toast">{toastMessage}</div>}

      {/* Top Navigation Bar */}
      <header className="dash-navbar">
        <div className="dash-brand">
          <div className="brand-logo-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
            </svg>
          </div>
          <div className="brand-text">
            <h2>TaskFlow <span className="brand-badge">MERN</span></h2>
            <span className="brand-sub">Workspace & Productivity Suite</span>
          </div>
        </div>

        {/* Global Search Bar */}
        <div className="dash-search-container">
          <svg className="search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <input
            type="text"
            className="dash-search-input"
            placeholder="Search tasks by title, description, or tag..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button className="search-clear-btn" onClick={() => setSearchQuery("")}>
              ✕
            </button>
          )}
        </div>

        {/* User profile & Actions */}
        <div className="dash-header-actions">
          <div className={`connection-pill ${apiConnected ? "connected" : "demo"}`} title={apiConnected ? "Connected to MongoDB backend API" : "Running in client/demo mode"}>
            <span className="pill-dot"></span>
            {apiConnected ? "API Live" : "Demo Mode"}
          </div>

          <button className="primary-action-btn" onClick={handleOpenCreateModal}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            <span>New Task</span>
          </button>

          <div className="user-profile-widget">
            <div className="user-avatar" title={displayUser.email}>
              {displayUser.name ? displayUser.name.charAt(0).toUpperCase() : "U"}
            </div>
            <div className="user-details-box">
              <span className="user-name">{displayUser.name || "Alex Morgan"}</span>
              <span className="user-role">{displayUser.email || "demo@mernflow.dev"}</span>
            </div>
            <button className="dash-logout-btn" onClick={handleLogout} title="Sign Out">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                <polyline points="16 17 21 12 16 7"></polyline>
                <line x1="21" y1="12" x2="9" y2="12"></line>
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="dash-main-container">
        {/* Welcome Banner */}
        <section className="welcome-banner">
          <div className="welcome-content">
            <div className="welcome-badge">
              <span className="calendar-icon">📅</span> {currentDateStr}
            </div>
            <h1>Good Day, {displayUser.name.split(" ")[0]} 👋</h1>
            <p>
              Here is your project workspace update. You currently have{" "}
              <strong>{pendingTasks} tasks pending</strong> and{" "}
              <strong>{completedTasks} tasks finished</strong>.
            </p>
          </div>

          <div className="progress-gauge-card">
            <div className="gauge-text">
              <span className="gauge-number">{completionRate}%</span>
              <span className="gauge-label">Productivity</span>
            </div>
            <div className="progress-bar-track">
              <div
                className="progress-bar-fill"
                style={{ width: `${completionRate}%` }}
              ></div>
            </div>
            <div className="gauge-subtext">
              {completionRate >= 80
                ? "🌟 Outstanding flow today!"
                : completionRate >= 50
                ? "🚀 Great momentum, keep going!"
                : "⚡ Ready to conquer your tasks"}
            </div>
          </div>
        </section>

        {/* 4 Stats Cards */}
        <section className="stats-row">
          <div className="dash-stat-card card-total">
            <div className="stat-icon-wrapper icon-blue">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 11l3 3L22 4"></path>
                <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
              </svg>
            </div>
            <div className="stat-meta">
              <span className="stat-label">Total Tasks</span>
              <h3 className="stat-val">{totalTasks}</h3>
              <span className="stat-sub">Across all pipelines</span>
            </div>
          </div>

          <div className="dash-stat-card card-pending">
            <div className="stat-icon-wrapper icon-amber">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 16 14"></polyline>
              </svg>
            </div>
            <div className="stat-meta">
              <span className="stat-label">In Progress</span>
              <h3 className="stat-val">{pendingTasks}</h3>
              <span className="stat-sub text-amber">Active & pending</span>
            </div>
          </div>

          <div className="dash-stat-card card-completed">
            <div className="stat-icon-wrapper icon-green">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
              </svg>
            </div>
            <div className="stat-meta">
              <span className="stat-label">Completed</span>
              <h3 className="stat-val">{completedTasks}</h3>
              <span className="stat-sub text-green">Done & verified</span>
            </div>
          </div>

          <div className="dash-stat-card card-efficiency">
            <div className="stat-icon-wrapper icon-purple">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
                <polyline points="17 6 23 6 23 12"></polyline>
              </svg>
            </div>
            <div className="stat-meta">
              <span className="stat-label">Completion Rate</span>
              <h3 className="stat-val">{completionRate}%</h3>
              <span className="stat-sub text-purple">Velocity index</span>
            </div>
          </div>
        </section>

        {/* Filter Toolbar & Controls */}
        <section className="tasks-control-bar">
          <div className="filter-tabs">
            <button
              className={`filter-tab ${activeFilter === "all" ? "active" : ""}`}
              onClick={() => setActiveFilter("all")}
            >
              All Tasks <span className="tab-count">{totalTasks}</span>
            </button>
            <button
              className={`filter-tab ${activeFilter === "pending" ? "active" : ""}`}
              onClick={() => setActiveFilter("pending")}
            >
              In Progress <span className="tab-count">{pendingTasks}</span>
            </button>
            <button
              className={`filter-tab ${activeFilter === "completed" ? "active" : ""}`}
              onClick={() => setActiveFilter("completed")}
            >
              Completed <span className="tab-count">{completedTasks}</span>
            </button>
            <button
              className={`filter-tab ${activeFilter === "high" ? "active" : ""}`}
              onClick={() => setActiveFilter("high")}
            >
              🔥 High Priority{" "}
              <span className="tab-count">
                {tasks.filter((t) => t.priority === "High").length}
              </span>
            </button>
          </div>

          <div className="filter-auxiliary">
            {/* Category Select */}
            <div className="select-wrapper">
              <select
                value={activeCategory}
                onChange={(e) => setActiveCategory(e.target.value)}
                className="dash-dropdown"
              >
                <option value="all">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort Select */}
            <div className="select-wrapper">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="dash-dropdown"
              >
                <option value="newest">Sort: Newest First</option>
                <option value="oldest">Sort: Oldest First</option>
                <option value="title">Sort: Alphabetical</option>
                <option value="priority">Sort: By Priority</option>
              </select>
            </div>

            {/* View Mode Switcher */}
            <div className="view-mode-toggle">
              <button
                className={`view-btn ${viewMode === "grid" ? "active" : ""}`}
                onClick={() => setViewMode("grid")}
                title="Grid Cards View"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="3" width="7" height="7"></rect>
                  <rect x="14" y="3" width="7" height="7"></rect>
                  <rect x="14" y="14" width="7" height="7"></rect>
                  <rect x="3" y="14" width="7" height="7"></rect>
                </svg>
              </button>
              <button
                className={`view-btn ${viewMode === "list" ? "active" : ""}`}
                onClick={() => setViewMode("list")}
                title="List View"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="8" y1="6" x2="21" y2="6"></line>
                  <line x1="8" y1="12" x2="21" y2="12"></line>
                  <line x1="8" y1="18" x2="21" y2="18"></line>
                  <line x1="3" y1="6" x2="3.01" y2="6"></line>
                  <line x1="3" y1="12" x2="3.01" y2="12"></line>
                  <line x1="3" y1="18" x2="3.01" y2="18"></line>
                </svg>
              </button>
            </div>
          </div>
        </section>

        {/* Tasks Container */}
        {loading ? (
          <div className="dash-loading-state">
            <div className="loading-spinner"></div>
            <p>Syncing tasks with database...</p>
          </div>
        ) : filteredTasks.length === 0 ? (
          <div className="empty-tasks-card">
            <div className="empty-icon">📋</div>
            <h3>No tasks match your criteria</h3>
            <p>
              {searchQuery
                ? `No tasks found matching "${searchQuery}". Try clearing your search.`
                : "Your task list is clear! Create a new task to get things done."}
            </p>
            <div className="empty-actions">
              {searchQuery && (
                <button
                  className="secondary-btn"
                  onClick={() => setSearchQuery("")}
                >
                  Clear Search
                </button>
              )}
              <button
                className="primary-action-btn"
                onClick={handleOpenCreateModal}
              >
                + Create New Task
              </button>
            </div>
          </div>
        ) : (
          <div
            className={`tasks-display-container ${
              viewMode === "grid" ? "grid-mode" : "list-mode"
            }`}
          >
            {filteredTasks.map((task) => (
              <div
                key={task._id}
                className={`task-item-card ${task.completed ? "task-done" : ""}`}
              >
                {/* Priority ribbon / tag */}
                <div className="task-card-header">
                  <div className="task-tags-group">
                    <span
                      className={`priority-pill priority-${(
                        task.priority || "Medium"
                      ).toLowerCase()}`}
                    >
                      {task.priority || "Medium"}
                    </span>
                    {task.category && (
                      <span className="category-pill">{task.category}</span>
                    )}
                  </div>

                  {/* Actions Dropdown / Quick Buttons */}
                  <div className="task-actions-group">
                    <button
                      className="task-icon-btn edit-btn"
                      onClick={() => handleOpenEditModal(task)}
                      title="Edit task"
                    >
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                      </svg>
                    </button>
                    <button
                      className="task-icon-btn delete-btn"
                      onClick={() => handleDeleteTask(task._id)}
                      title="Delete task"
                    >
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="3 6 5 6 21 6"></polyline>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Task Body */}
                <div className="task-card-body">
                  <div className="task-check-wrapper">
                    <button
                      className={`custom-checkbox ${
                        task.completed ? "checked" : ""
                      }`}
                      onClick={() => handleToggleTask(task)}
                      title={
                        task.completed
                          ? "Mark as in-progress"
                          : "Mark as completed"
                      }
                    >
                      {task.completed && (
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                          <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                      )}
                    </button>
                    <h4
                      className="task-title"
                      onClick={() => handleToggleTask(task)}
                    >
                      {task.title}
                    </h4>
                  </div>

                  {task.description && (
                    <p className="task-desc">{task.description}</p>
                  )}
                </div>

                {/* Task Footer */}
                <div className="task-card-footer">
                  <span
                    className={`status-badge ${
                      task.completed ? "status-completed" : "status-pending"
                    }`}
                  >
                    <span className="status-dot"></span>
                    {task.completed ? "Completed" : "In Progress"}
                  </span>

                  <span className="task-date">
                    {task.createdAt
                      ? new Date(task.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })
                      : "Recently"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Create / Edit Task Modal Dialog */}
      {isModalOpen && (
        <div className="modal-backdrop" onClick={handleCloseModal}>
          <div
            className="modal-content-card"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <div className="modal-title-wrap">
                <div className="modal-icon">
                  {editingTask ? "✏️" : "✨"}
                </div>
                <div>
                  <h3>{editingTask ? "Edit Task" : "Create New Task"}</h3>
                  <p>
                    {editingTask
                      ? "Update task details, priority, or category"
                      : "Add a new task to your MERN project board"}
                  </p>
                </div>
              </div>
              <button className="modal-close-btn" onClick={handleCloseModal}>
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitTask} className="modal-form">
              <div className="form-group">
                <label>Task Title *</label>
                <input
                  type="text"
                  placeholder="e.g., Integrate payment gateway with Stripe"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  required
                  autoFocus
                />
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  rows="3"
                  placeholder="Add details, acceptance criteria, or notes..."
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Priority Level</label>
                  <select
                    value={formData.priority}
                    onChange={(e) =>
                      setFormData({ ...formData, priority: e.target.value })
                    }
                  >
                    <option value="Low">Low Priority</option>
                    <option value="Medium">Medium Priority</option>
                    <option value="High">High Priority 🔥</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Category / Track</label>
                  <select
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value })
                    }
                  >
                    <option value="Frontend">Frontend (React)</option>
                    <option value="Backend">Backend (Node/Express)</option>
                    <option value="Database">Database (MongoDB)</option>
                    <option value="DevOps">DevOps & Cloud</option>
                    <option value="Design">UI/UX Design</option>
                    <option value="General">General Task</option>
                  </select>
                </div>
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="secondary-btn"
                  onClick={handleCloseModal}
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="primary-action-btn"
                  disabled={submitting}
                >
                  {submitting
                    ? "Saving..."
                    : editingTask
                    ? "Save Changes"
                    : "Create Task"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;