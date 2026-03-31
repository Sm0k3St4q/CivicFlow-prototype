import React, { useEffect, useMemo, useState } from "react";
import {
  Search,
  FileText,
  Clock3,
  Building2,
  CheckCircle2,
  AlertTriangle,
  Upload,
  Sparkles,
  LayoutDashboard,
  Bot,
} from "lucide-react";

const municipalities = [
  {
    id: "paterson",
    name: "Paterson",
    departments: ["Clerk", "Zoning", "Fire", "Health", "Building"],
    label: "Initial Pilot",
  },
  {
    id: "newark",
    name: "Newark",
    departments: ["Clerk", "Zoning", "Fire", "Health", "Engineering"],
    label: "Expansion Ready",
  },
  {
    id: "jersey-city",
    name: "Jersey City",
    departments: ["Clerk", "Zoning", "Fire", "Health", "Code"],
    label: "Expansion Ready",
  },
];

const permitChecklist = [
  { item: "Business Registration Certificate", done: true },
  { item: "NJ Tax Clearance", done: true },
  { item: "Zoning Review", done: false },
  { item: "Fire Review", done: false },
  { item: "Health Department Approval", done: false },
  { item: "Payment of Municipal Fees", done: false },
];

const codeLibrary = [
  {
    id: "NJ-101",
    category: "Food Service",
    municipality: "Statewide",
    title: "Food establishment registration and sanitation requirements",
    summary:
      "Businesses serving food typically require health review, sanitation compliance, and pre-opening inspection scheduling before final approval.",
    tags: ["health", "inspection", "food"],
  },
  {
    id: "NJ-204",
    category: "Zoning",
    municipality: "Paterson",
    title: "Commercial use in mixed-use corridors",
    summary:
      "Mixed-use corridor businesses may require zoning confirmation, parking review, signage restrictions, and frontage compliance before occupancy.",
    tags: ["zoning", "occupancy", "signage"],
  },
  {
    id: "NJ-318",
    category: "Fire Safety",
    municipality: "Paterson",
    title: "Occupancy and life-safety review for public businesses",
    summary:
      "Public-facing businesses must pass occupancy and life-safety checks, including extinguishers, exits, and posted capacity where applicable.",
    tags: ["fire", "occupancy", "capacity"],
  },
];

function cardStyle() {
  return {
    background: "#fff",
    border: "1px solid #e2e8f0",
    borderRadius: "20px",
    padding: "16px",
    boxShadow: "0 4px 14px rgba(0,0,0,0.04)",
  };
}

function badgeStyle(bg = "#eef2ff", color = "#3730a3") {
  return {
    display: "inline-block",
    padding: "6px 10px",
    borderRadius: "999px",
    fontSize: "12px",
    fontWeight: 600,
    background: bg,
    color,
  };
}

function RiskBadge({ risk }) {
  if (risk === "high") {
    return <span style={badgeStyle("#fee2e2", "#991b1b")}>High Risk</span>;
  }
  if (risk === "medium") {
    return <span style={badgeStyle("#fef3c7", "#92400e")}>Watch</span>;
  }
  return <span style={badgeStyle("#e2e8f0", "#334155")}>Stable</span>;
}

export default function App() {
  const [selectedMunicipality, setSelectedMunicipality] = useState("paterson");
  const [activeTab, setActiveTab] = useState("dashboard");
  const [search, setSearch] = useState("");
  const [businessType, setBusinessType] = useState("restaurant");
  const [aiPrompt, setAiPrompt] = useState(
    "What permits and reviews would a first-time coffee shop likely need in Paterson, and what missing items should be flagged early?"
  );
  const [applications, setApplications] = useState([]);
  const [formData, setFormData] = useState({
    applicant_name: "",
    municipality: "Paterson",
    business_type: "",
    permit_type: "",
    due_date: "",
    current_department: "",
    missing_items: "",
  });

  useEffect(() => {
  fetch("http://localhost:3000/permits")
    .then((res) => res.json())
    .then((data) => setApplications(data))
    .catch((err) => console.error("Failed to load permits:", err));
}, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

    const handleSubmitPermit = async (e) => {
    e.preventDefault();

    try {
      const payload = {
        ...formData,
        status: "not_started",
        progress: 0,
        missing_items: formData.missing_items
          ? formData.missing_items.split(",").map((item) => item.trim())
          : [],
      };

      const response = await fetch("http://localhost:3000/permits", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("Failed to create permit");
      }

      const newPermit = await response.json();

      setApplications((prev) => [newPermit, ...prev]);

      setFormData({
        applicant_name: "",
        municipality: "Paterson",
        business_type: "",
        permit_type: "",
        due_date: "",
        current_department: "",
        missing_items: "",
      });

      alert("Permit created successfully!");
    } catch (err) {
      console.error("Error creating permit:", err);
      alert("There was a problem creating the permit.");
    }
  };

  const activeMunicipality =
    municipalities.find((m) => m.id === selectedMunicipality) || municipalities[0];

  const filteredCodes = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return codeLibrary;
    return codeLibrary.filter((code) => {
      const haystack =
        `${code.id} ${code.category} ${code.title} ${code.summary} ${code.tags.join(" ")}`.toLowerCase();
      return haystack.includes(q);
    });
  }, [search]);

  const aiOutput = useMemo(() => {
    const base = {
      restaurant: {
        path: "Food Service License → Zoning Review → Fire Review → Health Inspection → Fee Payment → Issuance",
        issues: [
          "Missing floor plan or seating count can delay Health and Fire review.",
          "Zoning confirmation should happen before investing in interior changes.",
          "Applicant should upload BRC and NJ tax proof early to avoid rework.",
        ],
      },
      retail: {
        path: "Business Registration → Zoning Check → Sign Permit → Fire Review if occupancy changes → Fee Payment",
        issues: [
          "Most delays come from signage details and occupancy assumptions.",
          "Mixed-use areas may trigger extra zoning review.",
          "A clean checklist reduces clerk back-and-forth.",
        ],
      },
      contractor: {
        path: "License Validation → Insurance Review → Contractor Registration → Permit-specific intake → Department routing",
        issues: [
          "Insurance expiration dates should be tracked automatically.",
          "Contractor identity and registration should be reusable across applications.",
          "Jobs involving structural work may branch into building and zoning review early.",
        ],
      },
    };

    const selected = base[businessType] || base.restaurant;

    return {
      summary: `For ${activeMunicipality.name}, the system would guide the applicant through a structured intake, identify the likely permit path, and flag missing materials before manual review.`,
      path: selected.path,
      issues: selected.issues,
    };
  }, [businessType, activeMunicipality.name]);

  const tabButton = (key, label) => (
    <button
      onClick={() => setActiveTab(key)}
      style={{
        flex: 1,
        padding: "12px",
        borderRadius: "14px",
        border: "1px solid #dbeafe",
        background: activeTab === key ? "#dbeafe" : "#fff",
        fontWeight: 600,
        cursor: "pointer",
      }}
    >
      {label}
    </button>
  );

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f8fafc",
        color: "#0f172a",
        fontFamily: "Inter, Arial, sans-serif",
      }}
    >
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: 24 }}>
       <div>
        
          <div style={{ display: "flex", gap: 16, flexWrap: "wrap", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <div style={{ display: "flex", gap: 8, marginBottom: 12, flexWrap: "wrap" }}>
                <span style={badgeStyle("#e0f2fe", "#075985")}>CivicFlow Demo</span>
                <span style={badgeStyle("#dcfce7", "#166534")}>One Municipality First</span>
              </div>
              <h1 style={{ fontSize: 38, margin: 0 }}>Municipal Handshake Portal</h1>
              <p style={{ color: "#475569", maxWidth: 760, lineHeight: 1.6 }}>
                A single entry point for permits, licenses, deadlines, progress tracking, and AI-assisted guidance — designed to launch with one municipality and expand through configurable rules.
              </p>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(120px, 1fr))", gap: 12, minWidth: 360 }}>
              <div style={cardStyle()}>
                <div style={{ fontSize: 12, color: "#64748b" }}>Active Cases</div>
                <div style={{ fontSize: 28, fontWeight: 700 }}>38</div>
              </div>
              <div style={cardStyle()}>
                <div style={{ fontSize: 12, color: "#64748b" }}>Due This Week</div>
                <div style={{ fontSize: 28, fontWeight: 700 }}>12</div>
              </div>
              <div style={cardStyle()}>
                <div style={{ fontSize: 12, color: "#64748b" }}>Avg Cycle Time</div>
                <div style={{ fontSize: 28, fontWeight: 700 }}>19 days</div>
              </div>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 16, marginTop: 20 }}>
            <div style={cardStyle()}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8, fontWeight: 700 }}>
                <Building2 size={18} /> Deployment Target
              </div>
              <p style={{ color: "#64748b", marginTop: 0 }}>
                Start with one municipality, configure the rule layer, then expand into new cities without rebuilding the platform.
              </p>
              <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
                <select
                  value={selectedMunicipality}
                  onChange={(e) => setSelectedMunicipality(e.target.value)}
                  style={{
                    padding: "12px 14px",
                    borderRadius: 14,
                    border: "1px solid #cbd5e1",
                    minWidth: 220,
                  }}
                >
                  {municipalities.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name}
                    </option>
                  ))}
                </select>

                {activeMunicipality.departments.map((dept) => (
                  <span key={dept} style={badgeStyle("#f1f5f9", "#334155")}>
                    {dept}
                  </span>
                ))}
              </div>
            </div>

            <div style={cardStyle()}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8, fontWeight: 700 }}>
                <Clock3 size={18} /> Shot Clock
              </div>
              <p style={{ color: "#4a6386", marginTop: 0 }}>
                Surface what is due, at risk, and overdue without waiting for manual follow-ups.
              </p>
              <div style={{ ...cardStyle(), boxShadow: "none", marginBottom: 10 }}>
                <div style={{ fontSize: 12, color: "#4a6386" }}>Current target</div>
                <div style={{ fontSize: 22, fontWeight: 700 }}>25-day response window</div>
              </div>
              <div style={{ ...cardStyle(), boxShadow: "none" }}>
                <div style={{ fontSize: 12, color: "#4a6386" }}>Current municipality</div>
                <div style={{ fontWeight: 600 }}>{activeMunicipality.name}</div>
              </div>
            </div>
          </div>
        </div>

        <div style={{ display: "flex", gap: 10, marginTop: 20, marginBottom: 20 }}>
          {tabButton("dashboard", "Dashboard")}
          {tabButton("intake", "Intake")}
          {tabButton("codes", "Code Scan")}
          {tabButton("admin", "Admin")}
          {tabButton("newpermit", "New Permit")}
        </div>

        {activeTab === "dashboard" && (
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 16 }}>
            <div style={cardStyle()}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8, fontWeight: 700 }}>
                <LayoutDashboard size={18} /> Active Permit and License Progress
              </div>
              <p style={{ color: "#64748b", marginTop: 0 }}>
                A shared view across offices showing what is completed, what is missing, and what needs action next.
              </p>

              {applications.map((app) => (
                <div key={app.id} style={{ border: "1px solid #e2e8f0", borderRadius: 18, padding: 16, marginBottom: 14 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                    <div>
                      <div style={{ fontSize: 12, color: "#64748b" }}>{app.id}</div>
                      <div style={{ fontSize: 20, fontWeight: 700 }}>{app.applicant_name}</div>
                      <div style={{ fontSize: 14, color: "#475569" }}>
                        {app.permitType} • {app.municipality}
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                      <span style={badgeStyle("#f8fafc", "#334155")}>{app.status}</span>
                      <RiskBadge risk={app.risk} />
                    </div>
                  </div>

                  <div style={{ display: "flex", justifyContent: "space-between", marginTop: 12, fontSize: 14 }}>
                    <span>{app.currentStep}</span>
                    <span>{app.progress}%</span>
                  </div>
                  <div
                    style={{
                      width: "100%",
                      height: 12,
                      background: "#e2e8f0",
                      borderRadius: 999,
                      overflow: "hidden",
                      marginTop: 8,
                    }}
                  >
                    <div
                      style={{
                        width: `${app.progress}%`,
                        height: "100%",
                        background: "#2563eb",
                      }}
                    />
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginTop: 10, fontSize: 13, color: "#64748b" }}>
                    <span>Due in {app.dueInDays} days</span>
                    <span>Department handoff active</span>
                  </div>
                </div>
              ))}
            </div>

            <div style={cardStyle()}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8, fontWeight: 700 }}>
                <CheckCircle2 size={18} /> Applicant Checklist
              </div>
              <p style={{ color: "#64748b", marginTop: 0 }}>
                A reusable Smart Vault style checklist for one applicant journey.
              </p>

              {permitChecklist.map((item) => (
                <div
                  key={item.item}
                  style={{
                    border: "1px solid #e2e8f0",
                    borderRadius: 16,
                    padding: 12,
                    marginBottom: 10,
                    display: "flex",
                    justifyContent: "space-between",
                    gap: 10,
                    alignItems: "center",
                  }}
                >
                  <span style={{ fontSize: 14 }}>{item.item}</span>
                  <span style={item.done ? badgeStyle("#dcfce7", "#166534") : badgeStyle("#f1f5f9", "#334155")}>
                    {item.done ? "Done" : "Needed"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "intake" && (
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 16 }}>
            <div style={cardStyle()}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8, fontWeight: 700 }}>
                <FileText size={18} /> Guided Intake Experience
              </div>
              <p style={{ color: "#64748b", marginTop: 0 }}>
                The first public-facing wedge: help businesses understand what they need before clerks or departments touch the case.
              </p>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <div>
                  <label style={{ display: "block", fontSize: 14, fontWeight: 600, marginBottom: 6 }}>Business / project type</label>
                  <select
                    value={businessType}
                    onChange={(e) => setBusinessType(e.target.value)}
                    style={{ width: "100%", padding: 12, borderRadius: 14, border: "1px solid #cbd5e1" }}
                  >
                    <option value="restaurant">Restaurant / Food Service</option>
                    <option value="retail">Retail / Storefront</option>
                    <option value="contractor">Contractor / Trade Work</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: 14, fontWeight: 600, marginBottom: 6 }}>Municipality</label>
                  <input
                    value={activeMunicipality.name}
                    readOnly
                    style={{ width: "100%", padding: 12, borderRadius: 14, border: "1px solid #cbd5e1" }}
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginTop: 16 }}>
                <div style={{ border: "1px solid #e2e8f0", borderRadius: 16, padding: 16 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, fontWeight: 600, marginBottom: 8 }}>
                    <Sparkles size={16} /> Recommended Path
                  </div>
                  <p style={{ margin: 0, color: "#334155" }}>{aiOutput.path}</p>
                </div>

                <div style={{ border: "1px solid #e2e8f0", borderRadius: 16, padding: 16 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, fontWeight: 600, marginBottom: 8 }}>
                    <Upload size={16} /> Smart Vault Prompt
                  </div>
                  <p style={{ margin: 0, color: "#334155" }}>
                    Upload reusable documents once so the platform can pre-fill and organize future permit and license workflows.
                  </p>
                </div>
              </div>

              <div style={{ border: "1px solid #e2e8f0", borderRadius: 16, padding: 16, marginTop: 16 }}>
                <div style={{ fontWeight: 600, marginBottom: 12 }}>Early bottleneck warnings</div>
                {aiOutput.issues.map((issue) => (
                  <div key={issue} style={{ display: "flex", gap: 8, marginBottom: 10, color: "#334155" }}>
                    <AlertTriangle size={16} style={{ marginTop: 2 }} />
                    <span>{issue}</span>
                  </div>
                ))}
              </div>

              <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
                <button style={{ padding: "12px 16px", borderRadius: 14, border: "none", background: "#2563eb", color: "#fff", fontWeight: 600 }}>
                  Start Intake
                </button>
                <button style={{ padding: "12px 16px", borderRadius: 14, border: "1px solid #cbd5e1", background: "#fff", fontWeight: 600 }}>
                  Preview Website Embed
                </button>
              </div>
            </div>

            <div style={cardStyle()}>
              <div style={{ fontWeight: 700, marginBottom: 8 }}>What this proves</div>
              <p style={{ color: "#64748b", marginTop: 0 }}>
                A realistic MVP direction for one municipality before statewide expansion.
              </p>

              {[
                "Reduces incomplete submissions before human review",
                "Creates a shared intake record for all offices",
                "Supports future embedding into municipal websites",
                "Keeps long-term reasoning engine vision alive without overbuilding",
              ].map((text) => (
                <div key={text} style={{ border: "1px solid #e2e8f0", borderRadius: 16, padding: 12, marginBottom: 10 }}>
                  {text}
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "codes" && (
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 16 }}>
            <div style={cardStyle()}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8, fontWeight: 700 }}>
                <Search size={18} /> Code Search and Summarization Layer
              </div>
              <p style={{ color: "#64748b", marginTop: 0 }}>
                Designed for a future where city-specific rules and broader New Jersey code references are searchable, summarized, and linked to workflows.
              </p>

              <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
                <div style={{ position: "relative", flex: 1 }}>
                  <Search size={16} style={{ position: "absolute", left: 12, top: 14, color: "#94a3b8" }} />
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search codes, summaries, tags, or permit topics"
                    style={{
                      width: "100%",
                      padding: "12px 12px 12px 36px",
                      borderRadius: 14,
                      border: "1px solid #cbd5e1",
                    }}
                  />
                </div>
              </div>

              {filteredCodes.map((code) => (
                <div key={code.id} style={{ border: "1px solid #e2e8f0", borderRadius: 16, padding: 16, marginBottom: 12 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                    <div>
                      <div style={{ fontSize: 12, color: "#64748b" }}>
                        {code.id} • {code.municipality}
                      </div>
                      <div style={{ fontSize: 17, fontWeight: 700 }}>{code.title}</div>
                    </div>
                    <span style={badgeStyle("#f1f5f9", "#334155")}>{code.category}</span>
                  </div>
                  <p style={{ color: "#334155" }}>{code.summary}</p>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    {code.tags.map((tag) => (
                      <span key={tag} style={badgeStyle("#f8fafc", "#475569")}>
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div style={cardStyle()}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8, fontWeight: 700 }}>
                <Bot size={18} /> AI Code Assistant
              </div>
              <p style={{ color: "#64748b", marginTop: 0 }}>
                Prototype prompt surface for summarizing or expediting code search across municipalities.
              </p>

              <textarea
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                style={{
                  width: "100%",
                  minHeight: 140,
                  padding: 12,
                  borderRadius: 14,
                  border: "1px solid #cbd5e1",
                  resize: "vertical",
                }}
              />

              <button
                style={{
                  width: "100%",
                  marginTop: 12,
                  padding: "12px 16px",
                  borderRadius: 14,
                  border: "none",
                  background: "#2563eb",
                  color: "#fff",
                  fontWeight: 600,
                }}
              >
                Generate Summary
              </button>

              <div style={{ border: "1px solid #e2e8f0", borderRadius: 16, padding: 12, marginTop: 12 }}>
                <div style={{ fontWeight: 600, marginBottom: 8 }}>Prototype Output</div>
                <p style={{ margin: 0, color: "#334155" }}>{aiOutput.summary}</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === "admin" && (
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 16 }}>
            <div style={cardStyle()}>
              <div style={{ fontWeight: 700, marginBottom: 8 }}>Admin Operations Dashboard</div>
              <p style={{ color: "#64748b", marginTop: 0 }}>
                A municipal-facing view to monitor bottlenecks, completion percentages, and next actions across departments.
              </p>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
                {[
                  ["Under Review", "14"],
                  ["Waiting on Applicant", "9"],
                  ["At Risk", "6"],
                  ["Completed This Week", "11"],
                ].map(([label, value]) => (
                  <div key={label} style={{ border: "1px solid #e2e8f0", borderRadius: 16, padding: 14 }}>
                    <div style={{ fontSize: 12, color: "#64748b" }}>{label}</div>
                    <div style={{ fontSize: 28, fontWeight: 700 }}>{value}</div>
                  </div>
                ))}
              </div>
            </div>

            <div style={cardStyle()}>
              <div style={{ fontWeight: 700, marginBottom: 8 }}>Near-Term Build Priorities</div>
              <p style={{ color: "#64748b", marginTop: 0 }}>
                Suggested order for a credible V1 demo and pilot-ready MVP.
              </p>

              {[
                "1. One municipality configuration",
                "2. One permit/license intake flow",
                "3. Shared status + progress tracking",
                "4. Department dashboard and due dates",
                "5. AI-assisted code search and summarization",
              ].map((text) => (
                <div key={text} style={{ border: "1px solid #e2e8f0", borderRadius: 16, padding: 12, marginBottom: 10 }}>
                  {text}
                </div>
              ))}
            </div>
          </div>
        )}
        
        {activeTab === "newpermit" && (
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 16 }}>
            <div style={cardStyle()}>
              <div style={{ fontWeight: 700, marginBottom: 8, fontSize: 20 }}>
                Start New Permit Intake
              </div>
              <p style={{ color: "#64748b", marginTop: 0 }}>
                This is the first real handshake step. A business or applicant enters information, and the system creates a trackable permit record.
              </p>

              <form onSubmit={handleSubmitPermit}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                  <div>
                    <label style={{ display: "block", marginBottom: 6, fontWeight: 600 }}>
                      Applicant Name
                    </label>
                    <input
                      type="text"
                      name="applicant_name"
                      value={formData.applicant_name}
                      onChange={handleInputChange}
                      placeholder="Enter applicant or business name"
                      style={{
                        width: "100%",
                        padding: 12,
                        borderRadius: 14,
                        border: "1px solid #cbd5e1",
                      }}
                      required
                    />
                  </div>

                  <div>
                    <label style={{ display: "block", marginBottom: 6, fontWeight: 600 }}>
                      Municipality
                    </label>
                    <input
                      type="text"
                      name="municipality"
                      value={formData.municipality}
                      onChange={handleInputChange}
                      style={{
                        width: "100%",
                        padding: 12,
                        borderRadius: 14,
                        border: "1px solid #cbd5e1",
                      }}
                      required
                    />
                  </div>

                  <div>
                    <label style={{ display: "block", marginBottom: 6, fontWeight: 600 }}>
                      Business Type
                    </label>
                    <input
                      type="text"
                      name="business_type"
                      value={formData.business_type}
                      onChange={handleInputChange}
                      placeholder="Example: Coffee Shop"
                      style={{
                        width: "100%",
                        padding: 12,
                        borderRadius: 14,
                        border: "1px solid #cbd5e1",
                      }}
                      required
                    />
                  </div>

                  <div>
                    <label style={{ display: "block", marginBottom: 6, fontWeight: 600 }}>
                      Permit Type
                    </label>
                    <input
                      type="text"
                      name="permit_type"
                      value={formData.permit_type}
                      onChange={handleInputChange}
                      placeholder="Example: Food Service License"
                      style={{
                        width: "100%",
                        padding: 12,
                        borderRadius: 14,
                        border: "1px solid #cbd5e1",
                      }}
                      required
                    />
                  </div>

                  <div>
                    <label style={{ display: "block", marginBottom: 6, fontWeight: 600 }}>
                      Due Date
                    </label>
                    <input
                      type="date"
                      name="due_date"
                      value={formData.due_date}
                      onChange={handleInputChange}
                      style={{
                        width: "100%",
                        padding: 12,
                        borderRadius: 14,
                        border: "1px solid #cbd5e1",
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: "block", marginBottom: 6, fontWeight: 600 }}>
                      Current Department
                    </label>
                    <input
                      type="text"
                      name="current_department"
                      value={formData.current_department}
                      onChange={handleInputChange}
                      placeholder="Example: Clerk"
                      style={{
                        width: "100%",
                        padding: 12,
                        borderRadius: 14,
                        border: "1px solid #cbd5e1",
                      }}
                    />
                  </div>
                </div>

                <div style={{ marginTop: 14 }}>
                  <label style={{ display: "block", marginBottom: 6, fontWeight: 600 }}>
                    Missing Items
                  </label>
                  <input
                    type="text"
                    name="missing_items"
                    value={formData.missing_items}
                    onChange={handleInputChange}
                    placeholder="Example: Floor plan, Seating count"
                    style={{
                      width: "100%",
                      padding: 12,
                      borderRadius: 14,
                      border: "1px solid #cbd5e1",
                    }}
                  />
                </div>

                <button
                  type="submit"
                  style={{
                    marginTop: 18,
                    padding: "12px 16px",
                    borderRadius: 14,
                    border: "none",
                    background: "#2563eb",
                    color: "#fff",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  Create Permit
                </button>
              </form>
            </div>

            <div style={cardStyle()}>
              <div style={{ fontWeight: 700, marginBottom: 8 }}>Why this matters</div>
              <p style={{ color: "#64748b", marginTop: 0 }}>
                This takes CivicFlow from a read-only dashboard to a real intake system.
              </p>

              {[
                "Applicant information becomes a real permit record",
                "Permit records are stored in PostgreSQL",
                "The dashboard can reflect live workflow data",
                "This is the foundation of the municipal handshake",
              ].map((text) => (
                <div
                  key={text}
                  style={{
                    border: "1px solid #e2e8f0",
                    borderRadius: 16,
                    padding: 12,
                    marginBottom: 10,
                  }}
                >
                  {text}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}