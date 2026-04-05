function App() {
  const recentTickets = [
    {
      id: "TCK-1001",
      title: "Email not syncing",
      priority: "High",
      status: "Open",
    },
    {
      id: "TCK-1002",
      title: "Laptop running slow",
      priority: "Medium",
      status: "In Progress",
    },
    {
      id: "TCK-1003",
      title: "VPN connection issue",
      priority: "Low",
      status: "Resolved",
    },
  ];

  return (
    <div className="app">
      <nav className="navbar">
        <div className="logo">HelpdeskPro</div>
        <div className="nav-links">
          <a href="#">Dashboard</a>
          <a href="#">Tickets</a>
          <a href="#">Reports</a>
          <a href="#">Login</a>
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
            <button className="primary-btn">Create Ticket</button>
            <button className="secondary-btn">View Dashboard</button>
          </div>
        </div>

        <div className="hero-card">
          <h3>Create New Ticket</h3>
          <form>
            <input type="text" placeholder="Issue title" />
            <select>
              <option>Select category</option>
              <option>Network</option>
              <option>Hardware</option>
              <option>Software</option>
              <option>Access</option>
            </select>
            <select>
              <option>Select urgency</option>
              <option>High</option>
              <option>Medium</option>
              <option>Low</option>
            </select>
            <textarea placeholder="Describe the issue..." rows="4"></textarea>
            <button type="button" className="primary-btn full-width">
              Submit Ticket
            </button>
          </form>
        </div>
      </header>

      <section className="stats-section">
        <div className="stat-card">
          <p>Total Tickets</p>
          <h2>128</h2>
          <span>+12 this week</span>
        </div>
        <div className="stat-card">
          <p>Open Tickets</p>
          <h2>34</h2>
          <span>Needs attention</span>
        </div>
        <div className="stat-card">
          <p>Resolved</p>
          <h2>82</h2>
          <span>Strong performance</span>
        </div>
        <div className="stat-card">
          <p>Avg Response</p>
          <h2>2.4h</h2>
          <span>Improving steadily</span>
        </div>
      </section>

      <section className="tickets-section">
        <div className="section-header">
          <h2>Recent Tickets</h2>
          <button className="secondary-btn small-btn">View All</button>
        </div>

        <div className="ticket-list">
          {recentTickets.map((ticket) => (
            <div className="ticket-card" key={ticket.id}>
              <div>
                <p className="ticket-id">{ticket.id}</p>
                <h3>{ticket.title}</h3>
              </div>

              <div className="ticket-meta">
                <span className={`tag priority ${ticket.priority.toLowerCase()}`}>
                  {ticket.priority}
                </span>
                <span className={`tag status ${ticket.status.toLowerCase().replace(" ", "-")}`}>
                  {ticket.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export default App;