import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

function App() {
  const API_BASE = "https://.https://tinyloop-help-desk-2.onrender.com";

  const [formData, setFormData] = useState({
    title: "",
    category: "",
    urgency: "",
    description: "",
  });

  const [message, setMessage] = useState("");
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");

  const fetchTickets = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/tickets`);
      const data = await res.json();
      setTickets(data);
    } catch (err) {
      console.error("Fetch error:", err);
      setMessage("Failed to fetch tickets.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    if (
      !formData.title ||
      !formData.category ||
      !formData.urgency ||
      !formData.description
    ) {
      setMessage("Please fill all fields.");
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/api/tickets`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      setTickets((prev) => [data.ticket, ...prev]);
      setMessage("Ticket created successfully.");

      setFormData({
        title: "",
        category: "",
        urgency: "",
        description: "",
      });
    } catch (err) {
      console.error(err);
      setMessage("Failed to submit ticket.");
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

      const data = await res.json();

      setTickets((prev) =>
        prev.map((t) =>
          t._id === id ? { ...t, status: data.ticket.status } : t
        )
      );
    } catch (err) {
      console.error(err);
    }
  };

  const deleteTicket = async (id) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this ticket?");
    if (!confirmDelete) return;

    try {
      await fetch(`${API_BASE}/api/tickets/${id}`, {
        method: "DELETE",
      });

      setTickets((prev) => prev.filter((t) => t._id !== id));
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  const filteredTickets = tickets
    .filter((t) => (filter === "All" ? true : t.status === filter))
    .filter((t) => t.title.toLowerCase().includes(search.toLowerCase()));

  const statusData = [
    { name: "Open", value: tickets.filter((t) => t.status === "Open").length },
    { name: "Pending", value: tickets.filter((t) => t.status === "Pending").length },
    { name: "Resolved", value: tickets.filter((t) => t.status === "Resolved").length },
  ];

  const priorityData = [
    { name: "P1", value: tickets.filter((t) => t.priority === "P1").length },
    { name: "P2", value: tickets.filter((t) => t.priority === "P2").length },
    { name: "P3", value: tickets.filter((t) => t.priority === "P3").length },
  ];

  const pieColors = ["#2563eb", "#f59e0b", "#10b981"];

  return (
    <div className="app-shell">
      <nav className="navbar">
        <div className="logo">SupportFlow</div>
        <div className="nav-links">
          <a href="#dashboard">Dashboard</a>
          <a href="#create-ticket">Create</a>
          <a href="#tickets">Tickets</a>
          <a href="#reports">Reports</a>
        </div>
      </nav>

      <main className="main-container">
        <section className="hero-section">
          <div className="hero-left">
            <span className="badge">Smart Helpdesk SaaS</span>
            <h1>Support tickets, simplified for fast-moving teams.</h1>
            <p className="hero-description">
              Create, track, resolve, filter, and report on tickets through a clean full-stack workflow.
            </p>

            <div className="hero-actions">
              <a href="#create-ticket" className="primary-btn">
                Create Ticket
              </a>
              <a href="#tickets" className="secondary-btn">
                View Tickets
              </a>
            </div>
          </div>

          <div className="hero-right" id="create-ticket">
            <div className="form-card">
              <div className="card-header">
                <h2>Create a Ticket</h2>
                <p>Log a new support issue in seconds.</p>
              </div>

              <div className="form-grid">
                <input
                  name="title"
                  placeholder="Issue title"
                  value={formData.title}
                  onChange={handleChange}
                />

                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                >
                  <option value="">Select category</option>
                  <option>Network</option>
                  <option>Hardware</option>
                  <option>Software</option>
                  <option>Access</option>
                </select>

                <select
                  name="urgency"
                  value={formData.urgency}
                  onChange={handleChange}
                >
                  <option value="">Select urgency</option>
                  <option>High</option>
                  <option>Medium</option>
                  <option>Low</option>
                </select>

                <textarea
                  name="description"
                  placeholder="Describe the issue"
                  value={formData.description}
                  onChange={handleChange}
                  rows="5"
                />

                <button className="primary-btn full-width" onClick={handleSubmit}>
                  Submit Ticket
                </button>

                {message && <p className="form-message">{message}</p>}
              </div>
            </div>
          </div>
        </section>

        <section className="stats-grid" id="dashboard">
          <div className="stat-card">
            <p>Total Tickets</p>
            <h3>{tickets.length}</h3>
            <span>All recorded issues</span>
          </div>
          <div className="stat-card">
            <p>Open</p>
            <h3>{tickets.filter((t) => t.status === "Open").length}</h3>
            <span>Needs attention</span>
          </div>
          <div className="stat-card">
            <p>Pending</p>
            <h3>{tickets.filter((t) => t.status === "Pending").length}</h3>
            <span>Waiting on action</span>
          </div>
          <div className="stat-card">
            <p>Resolved</p>
            <h3>{tickets.filter((t) => t.status === "Resolved").length}</h3>
            <span>Completed tickets</span>
          </div>
        </section>

        <section className="tickets-section" id="tickets">
          <div className="section-top">
            <div>
              <h2>Ticket Management</h2>
              <p>Review, search, filter, resolve, and delete tickets.</p>
            </div>
          </div>

          <div className="toolbar">
            <div className="filter-group">
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
              type="text"
              className="search-input"
              placeholder="Search by ticket title..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {loading ? (
            <div className="empty-state">Loading tickets...</div>
          ) : filteredTickets.length === 0 ? (
            <div className="empty-state">No tickets match your current search or filter.</div>
          ) : (
            <div className="ticket-list">
              {filteredTickets.map((ticket) => (
                <div className="ticket-card" key={ticket._id}>
                  <div className="ticket-main">
                    <div className="ticket-top-row">
                      <span className="ticket-code">
                        {ticket.id || ticket._id.slice(-6).toUpperCase()}
                      </span>
                      <span className={`tag priority ${ticket.priority.toLowerCase()}`}>
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
                        .toLowerCase()
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
                          Mark Resolved
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

        <section className="reports-section" id="reports">
          <div className="section-top">
            <div>
              <h2>Reports</h2>
              <p>Status and priority insights from your current ticket data.</p>
            </div>
          </div>

          <div className="reports-grid">
            <div className="report-card chart-card">
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

            <div className="report-card chart-card">
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
                      <Cell key={entry.name} fill={pieColors[index % pieColors.length]} />
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