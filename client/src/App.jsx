import { useEffect, useState } from "react";

function App() {
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
      const response = await fetch("http://localhost:5001/api/tickets");
      const data = await response.json();
      setTickets(data);
    } catch (error) {
      console.error("Error fetching tickets:", error);
      setMessage("Failed to load tickets.");
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
      !formData.title ||
      !formData.category ||
      !formData.urgency ||
      !formData.description
    ) {
      setMessage("Please fill in all fields.");
      return;
    }

    try {
      const response = await fetch("http://localhost:5001/api/tickets", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      setTickets((prevTickets) => [data.ticket, ...prevTickets]);
      setMessage("Ticket submitted successfully!");

      setFormData({
        title: "",
        category: "",
        urgency: "",
        description: "",
      });
    } catch (error) {
      console.error("Error submitting ticket:", error);
      setMessage("Something went wrong. Please try again.");
    }
  };

  const updateTicketStatus = async (id, newStatus) => {
    try {
      const response = await fetch(`http://localhost:5001/api/tickets/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await response.json();

      setTickets((prevTickets) =>
        prevTickets.map((ticket) =>
          ticket._id === id ? { ...ticket, status: data.ticket.status } : ticket
        )
      );
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  const filteredTickets = tickets
    .filter((ticket) => (filter === "All" ? true : ticket.status === filter))
    .filter((ticket) =>
      ticket.title.toLowerCase().includes(search.toLowerCase())
    );

  return (
    <div className="app">
      <nav className="navbar">
        <div className="logo">SupportFlow</div>
        <div className="nav-links">
          <a href="#dashboard">Dashboard</a>
          <a href="#create-ticket">Create Ticket</a>
          <a href="#tickets">Tickets</a>
          <a href="#reports">Reports</a>
        </div>
      </nav>

      <header className="hero">
        <div className="hero-text">
          <p className="badge">Smart Helpdesk SaaS</p>
          <h1>Manage support tickets faster and smarter</h1>
          <p className="hero-subtext">
            A modern ticketing platform with priority handling, tracking,
            assignment logic, and a clean dashboard experience.
          </p>
          <div className="hero-buttons">
            <a href="#create-ticket" className="primary-btn">
              Create Ticket
            </a>
            <a href="#dashboard" className="secondary-btn">
              View Dashboard
            </a>
          </div>
        </div>

        <div className="hero-card" id="create-ticket">
          <h3>Create New Ticket</h3>
          <form>
            <input
              type="text"
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
              <option value="">Select urgency</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>

            <textarea
              name="description"
              placeholder="Describe the issue..."
              rows="4"
              value={formData.description}
              onChange={handleChange}
            ></textarea>

            <button
              type="button"
              className="primary-btn full-width"
              onClick={handleSubmit}
            >
              Submit Ticket
            </button>

            {message && <p className="form-message">{message}</p>}
          </form>
        </div>
      </header>

      <section className="stats-section" id="dashboard">
        <div className="stat-card">
          <p>Total Tickets</p>
          <h2>{tickets.length}</h2>
          <span>Live ticket count</span>
        </div>

        <div className="stat-card">
          <p>Open Tickets</p>
          <h2>{tickets.filter((ticket) => ticket.status === "Open").length}</h2>
          <span>Needs attention</span>
        </div>

        <div className="stat-card">
          <p>Resolved</p>
          <h2>{tickets.filter((ticket) => ticket.status === "Resolved").length}</h2>
          <span>Strong performance</span>
        </div>

        <div className="stat-card">
          <p>Pending Tickets</p>
          <h2>{tickets.filter((ticket) => ticket.status === "Pending").length}</h2>
          <span>Waiting action</span>
        </div>
      </section>

      <section className="tickets-section" id="tickets">
        <div className="section-header">
          <h2>Recent Tickets</h2>
          <button className="secondary-btn small-btn">View All</button>
        </div>

        <div className="filter-bar">
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
            type="text"
            placeholder="Search tickets..."
            className="search-input"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {loading ? (
          <p className="form-message">Loading tickets...</p>
        ) : filteredTickets.length === 0 ? (
          <p className="form-message">No tickets match your filter or search.</p>
        ) : (
          <div className="ticket-list">
            {filteredTickets.map((ticket) => (
              <div className="ticket-card" key={ticket._id}>
                <div>
                  <p className="ticket-id">
                    {ticket.id || ticket._id.slice(-6).toUpperCase()}
                  </p>
                  <h3>{ticket.title}</h3>
                  <p className="ticket-category">{ticket.category}</p>
                  <p className="ticket-desc">{ticket.description}</p>
                </div>

                <div className="ticket-meta">
                  <span className={`tag priority ${ticket.priority.toLowerCase()}`}>
                    {ticket.priority}
                  </span>

                  <span
                    className={`tag status ${ticket.status
                      .toLowerCase()
                      .replace(" ", "-")}`}
                  >
                    {ticket.status}
                  </span>

                  {ticket.status !== "Resolved" && (
                    <button
                      className="resolve-btn"
                      onClick={() => updateTicketStatus(ticket._id, "Resolved")}
                    >
                      Resolve
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="tickets-section" id="reports">
        <div className="section-header">
          <h2>Reports</h2>
        </div>

        <div className="ticket-card">
          <div>
            <h3>Reporting module coming next</h3>
            <p className="ticket-desc">
              This section will include analytics, trends, ticket summaries,
              and performance insights.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

export default App;