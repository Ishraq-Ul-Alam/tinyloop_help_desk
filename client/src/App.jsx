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

  const chartColors = ["#2563eb", "#f59e0b", "#10b981"];

  return (
    <div className="app">
      <nav className="navbar">
        <div className="logo">SupportFlow</div>
        <div className="nav-links">
          <a href="#dashboard">Dashboard</a>
          <a href="#create">Create</a>
          <a href="#tickets">Tickets</a>
          <a href="#reports">Reports</a>
        </div>
      </nav>

      <header className="hero">
        <div className="hero-text">
          <h1>Smart Helpdesk System</h1>
          <p>Track, manage, resolve, and report on tickets easily.</p>

          <div className="hero-actions">
            <a href="#create" className="primary-btn">
              Create Ticket
            </a>
            <a href="#reports" className="secondary-btn">
              View Reports
            </a>
          </div>
        </div>

        <div className="hero-card" id="create">
          <h3>Create Ticket</h3>

          <input
            name="title"
            placeholder="Title"
            value={formData.title}
            onChange={handleChange}
          />

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

          <textarea
            name="description"
            placeholder="Description"
            value={formData.description}
            onChange={handleChange}
            rows="5"
          />

          <button
            className="primary-btn"
            onClick={handleSubmit}
            disabled={submitting}
          >
            {submitting ? "Submitting..." : "Submit"}
          </button>

          {message && <p className="form-message">{message}</p>}
        </div>
      </header>

      <section id="dashboard" className="stats-grid">
        <div className="stat-card">
          <p>Total Tickets</p>
          <h2>{tickets.length}</h2>
        </div>
        <div className="stat-card">
          <p>Open</p>
          <h2>{tickets.filter((t) => t.status === "Open").length}</h2>
        </div>
        <div className="stat-card">
          <p>Pending</p>
          <h2>{tickets.filter((t) => t.status === "Pending").length}</h2>
        </div>
        <div className="stat-card">
          <p>Resolved</p>
          <h2>{tickets.filter((t) => t.status === "Resolved").length}</h2>
        </div>
      </section>

      <section id="tickets" className="tickets-section">
        <div className="section-header">
          <h2>Tickets</h2>
        </div>

        <div className="toolbar">
          <div className="filters">
            {["All", "Open", "Pending", "Resolved"].map((status) => (
              <button
                key={status}
                className={`filter-btn ${filter === status ? "active" : ""}`}
                onClick={() => setFilter(status)}
              >
                {status}
              </button>
            ))}
          </div>

          <input
            className="search-input"
            placeholder="Search by title..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {loading ? (
          <div className="empty-state">
            Loading tickets. If you are using free Render, the server may take a few seconds to wake up.
          </div>
        ) : filteredTickets.length === 0 ? (
          <div className="empty-state">No tickets found.</div>
        ) : (
          <div className="ticket-list">
            {filteredTickets.map((ticket) => (
              <div key={ticket._id} className="ticket-card">
                <div className="ticket-main">
                  <div className="ticket-top-row">
                    <span className="ticket-code">
                      {ticket.id || ticket._id?.slice(-6).toUpperCase()}
                    </span>
                    <span className={`tag priority ${ticket.priority?.toLowerCase()}`}>
                      {ticket.priority}
                    </span>
                  </div>

                  <h3>{ticket.title}</h3>
                  <p className="ticket-category">{ticket.category}</p>
                  <p className="ticket-desc">{ticket.description}</p>
                </div>

                <div className="ticket-side">
                  <span
                    className={`tag status ${ticket.status
                      ?.toLowerCase()
                      .replace(" ", "-")}`}
                  >
                    {ticket.status}
                  </span>

                  <div className="ticket-actions">
                    {ticket.status !== "Resolved" && (
                      <button
                        className="resolve-btn"
                        onClick={() => updateTicketStatus(ticket._id)}
                      >
                        Resolve
                      </button>
                    )}

                    <button
                      className="delete-btn"
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

      <section id="reports" className="reports-section">
        <div className="section-header">
          <h2>Reports</h2>
          <p>Live ticket insights by status and priority.</p>
        </div>

        <div className="reports-grid">
          <div className="report-card">
            <h3>Tickets by Status</h3>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={statusData}>
                <XAxis dataKey="name" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="value" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="report-card">
            <h3>Tickets by Priority</h3>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={priorityData}
                  dataKey="value"
                  nameKey="name"
                  outerRadius={90}
                  label
                >
                  {priorityData.map((entry, index) => (
                    <Cell
                      key={entry.name}
                      fill={chartColors[index % chartColors.length]}
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
    </div>
  );
}

export default App;