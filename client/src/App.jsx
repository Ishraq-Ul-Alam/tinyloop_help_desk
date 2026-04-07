import { useEffect, useMemo, useState } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

function App() {
  const API_BASE = "https://tinyloop-help-desk-2.onrender.com";

  const [formData, setFormData] = useState({
    title: "",
    category: "",
    urgency: "",
    description: "",
  });

  const [message, setMessage] = useState("");
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");

  const fetchTickets = async () => {
    try {
      setLoading(true);
      setMessage("");

      const res = await fetch(`${API_BASE}/api/tickets`);
      if (!res.ok) {
        throw new Error(`Failed with status ${res.status}`);
      }

      const data = await res.json();
      setTickets(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Fetch error:", err);
      setMessage("Server may be waking up. Please wait a few seconds and refresh.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async () => {
    if (
      !formData.title.trim() ||
      !formData.category ||
      !formData.urgency ||
      !formData.description.trim()
    ) {
      setMessage("Please fill all fields.");
      return;
    }

    try {
      setSubmitting(true);
      setMessage("");

      const res = await fetch(`${API_BASE}/api/tickets`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: formData.title.trim(),
          category: formData.category,
          urgency: formData.urgency,
          description: formData.description.trim(),
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed with status ${res.status}`);
      }

      const data = await res.json();

      if (data.ticket) {
        setTickets((prev) => [data.ticket, ...prev]);
      }

      setMessage("Ticket created successfully.");
      setFormData({
        title: "",
        category: "",
        urgency: "",
        description: "",
      });
    } catch (err) {
      console.error("Submit error:", err);
      setMessage("Failed to submit ticket. Backend or database may be unavailable.");
    } finally {
      setSubmitting(false);
    }
  };

  const updateTicketStatus = async (id) => {
    try {
      const res = await fetch(`${API_BASE}/api/tickets/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: "Resolved" }),
      });

      if (!res.ok) {
        throw new Error(`Failed with status ${res.status}`);
      }

      const data = await res.json();

      setTickets((prev) =>
        prev.map((ticket) =>
          ticket._id === id
            ? { ...ticket, status: data.ticket?.status || "Resolved" }
            : ticket
        )
      );
    } catch (err) {
      console.error("Update status error:", err);
      setMessage("Failed to update ticket status.");
    }
  };

  const deleteTicket = async (id) => {
    const shouldDelete = window.confirm("Delete this ticket permanently?");
    if (!shouldDelete) return;

    try {
      const res = await fetch(`${API_BASE}/api/tickets/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        throw new Error(`Failed with status ${res.status}`);
      }

      setTickets((prev) => prev.filter((ticket) => ticket._id !== id));
      setMessage("Ticket deleted successfully.");
    } catch (err) {
      console.error("Delete error:", err);
      setMessage("Failed to delete ticket.");
    }
  };

  const filteredTickets = tickets
    .filter((ticket) => (filter === "All" ? true : ticket.status === filter))
    .filter((ticket) =>
      ticket.title.toLowerCase().includes(search.toLowerCase())
    );

  const statusData = useMemo(
    () => [
      { name: "Open", value: tickets.filter((t) => t.status === "Open").length },
      { name: "Pending", value: tickets.filter((t) => t.status === "Pending").length },
      { name: "Resolved", value: tickets.filter((t) => t.status === "Resolved").length },
    ],
    [tickets]
  );

  const priorityData = useMemo(
    () => [
      { name: "P1", value: tickets.filter((t) => t.priority === "P1").length },
      { name: "P2", value: tickets.filter((t) => t.priority === "P2").length },
      { name: "P3", value: tickets.filter((t) => t.priority === "P3").length },
    ],
    [tickets]
  );

  const pieColors = ["#2563eb", "#f59e0b", "#10b981"];

  return (
    <div className="page">
      <nav className="topbar">
        <div className="brand">SupportFlow</div>
        <div className="topbar-links">
          <a href="#overview">Overview</a>
          <a href="#create-ticket">Create</a>
          <a href="#ticket-board">Tickets</a>
          <a href="#reports">Reports</a>
        </div>
      </nav>

      <main className="container">
        <section className="hero-panel">
          <div className="hero-copy">
            <div className="eyebrow">FULL-STACK HELPDESK DEMO</div>
            <h1>Modern ticket management for support teams.</h1>
            <p>
              Create, track, resolve, search, filter, and analyse tickets
              through a clean SaaS-style dashboard built with React, Express,
              MongoDB, and charts.
            </p>

            <div className="hero-cta">
              <a href="#create-ticket" className="btn btn-primary">
                Create Ticket
              </a>
              <a href="#reports" className="btn btn-secondary">
                View Reports
              </a>
            </div>
          </div>

          <div className="hero-side">
            <div className="mini-stat-grid">
              <div className="mini-stat">
                <span>Total</span>
                <strong>{tickets.length}</strong>
              </div>
              <div className="mini-stat">
                <span>Open</span>
                <strong>{tickets.filter((t) => t.status === "Open").length}</strong>
              </div>
              <div className="mini-stat">
                <span>Pending</span>
                <strong>{tickets.filter((t) => t.status === "Pending").length}</strong>
              </div>
              <div className="mini-stat">
                <span>Resolved</span>
                <strong>{tickets.filter((t) => t.status === "Resolved").length}</strong>
              </div>
            </div>
          </div>
        </section>

        <section className="dashboard-grid" id="overview">
          <div className="panel create-panel" id="create-ticket">
            <div className="panel-header">
              <div>
                <h2>Create Ticket</h2>
                <p>Log a new issue quickly.</p>
              </div>
            </div>

            <div className="form-layout">
              <input
                name="title"
                placeholder="Issue title"
                value={formData.title}
                onChange={handleChange}
              />

              <div className="form-row">
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                >
                  <option value="">Category</option>
                  <option value="Network">Network</option>
                  <option value="Hardware">Hardware</option>
                  <option value="Software">Software</option>
                  <option value="Access">Access</option>
                </select>

                <select
                  name="urgency"
                  value={formData.urgency}
                  onChange={handleChange}
                >
                  <option value="">Urgency</option>
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
              </div>

              <textarea
                name="description"
                placeholder="Describe the issue"
                value={formData.description}
                onChange={handleChange}
                rows="6"
              />

              <button
                className="btn btn-primary full"
                onClick={handleSubmit}
                disabled={submitting}
              >
                {submitting ? "Submitting..." : "Submit Ticket"}
              </button>

              {message && <div className="notice">{message}</div>}
            </div>
          </div>

          <div className="panel stats-panel">
            <div className="panel-header">
              <div>
                <h2>Overview</h2>
                <p>Live ticket summary.</p>
              </div>
            </div>

            <div className="stats-cards">
              <div className="stat-box">
                <span>Total Tickets</span>
                <strong>{tickets.length}</strong>
              </div>
              <div className="stat-box">
                <span>Open</span>
                <strong>{tickets.filter((t) => t.status === "Open").length}</strong>
              </div>
              <div className="stat-box">
                <span>Pending</span>
                <strong>{tickets.filter((t) => t.status === "Pending").length}</strong>
              </div>
              <div className="stat-box">
                <span>Resolved</span>
                <strong>{tickets.filter((t) => t.status === "Resolved").length}</strong>
              </div>
            </div>
          </div>
        </section>

        <section className="panel tickets-panel" id="ticket-board">
          <div className="panel-header">
            <div>
              <h2>Ticket Board</h2>
              <p>Manage tickets with search and filters.</p>
            </div>
          </div>

          <div className="toolbar">
            <div className="pill-group">
              {["All", "Open", "Pending", "Resolved"].map((status) => (
                <button
                  key={status}
                  className={`pill ${filter === status ? "active" : ""}`}
                  onClick={() => setFilter(status)}
                >
                  {status}
                </button>
              ))}
            </div>

            <input
              className="search"
              placeholder="Search by title..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {loading ? (
            <div className="empty-card">
              Loading tickets. Free Render may take a few seconds to wake up.
            </div>
          ) : filteredTickets.length === 0 ? (
            <div className="empty-card">No tickets found.</div>
          ) : (
            <div className="ticket-grid">
              {filteredTickets.map((ticket) => (
                <div className="ticket-item" key={ticket._id}>
                  <div className="ticket-item-top">
                    <span className="ticket-ref">
                      {ticket.id || ticket._id?.slice(-6).toUpperCase()}
                    </span>
                    <span className={`badge-tag priority ${ticket.priority?.toLowerCase()}`}>
                      {ticket.priority}
                    </span>
                  </div>

                  <h3>{ticket.title}</h3>
                  <p className="ticket-category">{ticket.category}</p>
                  <p className="ticket-description">{ticket.description}</p>

                  <div className="ticket-footer">
                    <span
                      className={`badge-tag status ${ticket.status
                        ?.toLowerCase()
                        .replace(" ", "-")}`}
                    >
                      {ticket.status}
                    </span>

                    <div className="action-row">
                      {ticket.status !== "Resolved" && (
                        <button
                          className="btn btn-success"
                          onClick={() => updateTicketStatus(ticket._id)}
                        >
                          Resolve
                        </button>
                      )}
                      <button
                        className="btn btn-danger"
                        onClick={() => deleteTicket(ticket._id)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="reports-grid" id="reports">
          <div className="panel chart-panel">
            <div className="panel-header">
              <div>
                <h2>Status Report</h2>
                <p>Tickets grouped by current status.</p>
              </div>
            </div>

            <div className="chart-wrap">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={statusData}>
                  <XAxis dataKey="name" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="value" radius={[10, 10, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="panel chart-panel">
            <div className="panel-header">
              <div>
                <h2>Priority Report</h2>
                <p>Tickets grouped by priority level.</p>
              </div>
            </div>

            <div className="chart-wrap">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={priorityData}
                    dataKey="value"
                    nameKey="name"
                    outerRadius={95}
                    label
                  >
                    {priorityData.map((entry, index) => (
                      <Cell
                        key={entry.name}
                        fill={pieColors[index % pieColors.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;