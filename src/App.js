import React, { useState, useEffect, useRef } from "react";

export default function TerminalWithAdmin() {
  const [showAdmin, setShowAdmin] = useState(false);
  const [input, setInput] = useState("");
  const [history, setHistory] = useState([]);
  const [currentPath, setCurrentPath] = useState("~");
  const inputRef = useRef(null);
  const terminalRef = useRef(null);

  // Load content from localStorage or use defaults
  const [writings, setWritings] = useState(() => {
    const saved = localStorage.getItem("writings");
    return saved
      ? JSON.parse(saved)
      : [
          {
            name: "digital-minimalism",
            title: "On Digital Minimalism",
            date: "2024-03-15",
            content:
              "Exploring the intersection of technology and intentional living.",
          },
        ];
  });

  const [photos, setPhotos] = useState(() => {
    const saved = localStorage.getItem("photos");
    return saved
      ? JSON.parse(saved)
      : [
          {
            name: "urban-landscapes",
            title: "Urban Landscapes",
            location: "Tokyo, 2024",
            date: "2024-03-20",
            imageUrl:
              "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800",
            description: "A series capturing urban environments.",
          },
          {
            name: "night-streets",
            title: "Night Streets",
            location: "New York, 2023",
            date: "2023-11-15",
            imageUrl:
              "https://images.unsplash.com/photo-1514565131-fce0801e5785?w=800",
            description: "City streets after dark.",
          },
          {
            name: "natural-light",
            title: "Natural Light",
            location: "California, 2023",
            date: "2023-08-10",
            imageUrl:
              "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800",
            description: "Exploring natural light and shadow.",
          },
        ];
  });

  const [work, setWork] = useState(() => {
    const saved = localStorage.getItem("work");
    return saved
      ? JSON.parse(saved)
      : [
          {
            name: "barclays",
            title: "Barclays",
            role: "Graduate Technology Analyst",
            year: "2024",
            description:
              "Graduate Technology Analyst at Barclays. Class of 2024.",
          },
          {
            name: "orbit-labs",
            title: "Orbit Labs",
            role: "Co-Founder",
            year: "2023-Present",
            description:
              "Co-Founder of Orbit Labs, a technology solutions agency.",
          },
        ];
  });

  // Save to localStorage whenever content changes
  useEffect(() => {
    localStorage.setItem("writings", JSON.stringify(writings));
  }, [writings]);

  useEffect(() => {
    localStorage.setItem("photos", JSON.stringify(photos));
  }, [photos]);

  useEffect(() => {
    localStorage.setItem("work", JSON.stringify(work));
  }, [work]);

  const commands = {
    help: () => [
      "Available commands:",
      "",
      "  ls              list contents",
      "  cd [dir]        change directory (writings/photos/work)",
      "  [name]          view details of an item",
      "  about           about me",
      "  contact         contact information",
      "  admin           open admin panel",
      "  clear           clear terminal",
      "  help            show this help",
      "",
    ],
    about: () => [
      "About Me",
      "─────────",
      "",
      "Writer. Photographer. Creator.",
      "",
      "I explore the intersection of art, technology, and human experience.",
      "",
    ],
    contact: () => [
      "Contact",
      "───────",
      "",
      "Email: hello@example.com",
      "Twitter: @yourhandle",
      "Instagram: @yourhandle",
      "",
    ],
    admin: () => {
      const password = prompt("Enter admin password:");
      if (password === "your-secure-password-123") {
        setShowAdmin(true);
        return ["Opening admin panel..."];
      } else {
        return ["Access denied. Incorrect password."];
      }
    },
    clear: () => "CLEAR",
    ls: () => {
      if (currentPath === "~") {
        return ["writings/", "photos/", "work/", ""];
      } else if (currentPath === "~/writings") {
        return writings
          .map((w) => `* ${w.name}`)
          .concat(["", "Type an item name to view details"]);
      } else if (currentPath === "~/photos") {
        return photos
          .map((p) => `* ${p.name}`)
          .concat(["", "Type an item name to view details"]);
      } else if (currentPath === "~/work") {
        return work
          .map((w) => `* ${w.name}`)
          .concat(["", "Type an item name to view details"]);
      }
    },
    cd: (args) => {
      const dir = args[0];
      if (!dir || dir === "~" || dir === "/") {
        setCurrentPath("~");
        return dir ? ["Changed to home directory", ""] : [""];
      } else if (dir === ".." && currentPath !== "~") {
        setCurrentPath("~");
        return ["Changed to home directory", ""];
      } else if (["writings", "photos", "work"].includes(dir)) {
        setCurrentPath(`~/${dir}`);
        let items = [];
        if (dir === "writings") items = writings.map((w) => `* ${w.name}`);
        else if (dir === "photos") items = photos.map((p) => `* ${p.name}`);
        else if (dir === "work") items = work.map((w) => `* ${w.name}`);
        return [
          `Changed to ${dir}`,
          "",
          ...items,
          "",
          "Type an item name to view details",
        ];
      } else {
        return [`cd: ${dir}: No such directory`];
      }
    },
  };

  useEffect(() => {
    setHistory([
      { type: "system", content: "adam moses" },
      { type: "system", content: "" },
      { type: "system", content: "type help for available commands" },
      { type: "system", content: "" },
    ]);
  }, []);

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [history]);

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (!input.trim()) return;

      const trimmedInput = input.trim();
      const [cmd, ...args] = trimmedInput.split(" ");

      setHistory((prev) => [
        ...prev,
        { type: "input", content: trimmedInput, path: currentPath },
      ]);

      if (cmd === "clear") {
        setHistory([]);
      } else if (commands[cmd]) {
        const output = commands[cmd](args);
        if (output === "CLEAR") {
          setHistory([]);
        } else {
          setHistory((prev) => [...prev, { type: "output", content: output }]);
        }
      } else {
        let found = false;

        if (currentPath === "~/writings") {
          const item = writings.find((w) => w.name === cmd);
          if (item) {
            found = true;
            setHistory((prev) => [
              ...prev,
              {
                type: "output",
                content: [
                  item.title,
                  "─".repeat(item.title.length),
                  `Date: ${item.date}`,
                  "",
                  item.content,
                  "",
                ],
              },
            ]);
          }
        } else if (currentPath === "~/photos") {
          const item = photos.find((p) => p.name === cmd);
          if (item) {
            found = true;
            setHistory((prev) => [
              ...prev,
              {
                type: "output",
                content: [
                  item.title,
                  "─".repeat(item.title.length),
                  `Location: ${item.location}`,
                  "",
                  item.description,
                  "",
                ],
              },
            ]);
          }
        } else if (currentPath === "~/work") {
          const item = work.find((w) => w.name === cmd);
          if (item) {
            found = true;
            setHistory((prev) => [
              ...prev,
              {
                type: "output",
                content: [
                  item.title,
                  "─".repeat(item.title.length),
                  `Role: ${item.role}`,
                  `Year: ${item.year}`,
                  "",
                  item.description,
                  "",
                ],
              },
            ]);
          }
        }

        if (!found) {
          setHistory((prev) => [
            ...prev,
            {
              type: "error",
              content: `Command not found: ${cmd}. Type "help" for available commands.`,
            },
          ]);
        }
      }

      setInput("");
    }
  };

  const styles = {
    background: {
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      width: "100%",
      height: "100vh",
      background: "#f5f5f0",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      margin: 0,
    },
    container: {
      width: "800px",
      height: "600px",
      background: "#000",
      color: "#0f0",
      fontFamily: '"Courier New", monospace',
      borderRadius: "8px",
      boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
      overflow: "hidden",
      display: "flex",
      flexDirection: "column",
    },
    titleBar: {
      height: "32px",
      background: "#e5e5e5",
      borderBottom: "1px solid #ccc",
      display: "flex",
      alignItems: "center",
      padding: "0 12px",
      gap: "8px",
    },
    dot: { width: "12px", height: "12px", borderRadius: "50%" },
    redDot: { background: "#ff5f57" },
    yellowDot: { background: "#ffbd2e" },
    greenDot: { background: "#28ca42" },
    titleText: {
      flex: 1,
      textAlign: "center",
      fontSize: "13px",
      color: "#666",
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    },
    content: {
      flex: 1,
      padding: "24px",
      display: "flex",
      flexDirection: "column",
      overflow: "hidden",
    },
    terminal: { flex: 1, overflowY: "auto", marginBottom: "16px" },
    line: { marginTop: "8px", marginBottom: "8px" },
    prompt: { color: "#0f0", fontWeight: "bold", marginRight: "8px" },
    inputLine: { color: "#0f0" },
    output: { color: "#ccc", marginLeft: "16px", whiteSpace: "pre-wrap" },
    error: { color: "#f44", marginLeft: "16px" },
    system: { color: "#888" },
    inputContainer: { display: "flex", gap: "8px", alignItems: "center" },
    input: {
      flex: 1,
      background: "transparent",
      border: "none",
      outline: "none",
      color: "#00ff00",
      fontFamily: '"Courier New", monospace',
      fontSize: "16px",
      caretColor: "#00ff00",
    },
    cursor: { color: "#0f0", animation: "blink 1s infinite" },
  };

  if (showAdmin) {
    return (
      <AdminPanel
        writings={writings}
        photos={photos}
        work={work}
        setWritings={setWritings}
        setPhotos={setPhotos}
        setWork={setWork}
        onClose={() => setShowAdmin(false)}
      />
    );
  }

  return (
    <div style={styles.background}>
      <div style={styles.container}>
        <style>{`
          @keyframes blink {
            0%, 49% { opacity: 1; }
            50%, 100% { opacity: 0; }
          }
        `}</style>

        <div style={styles.titleBar}>
          <div style={{ ...styles.dot, ...styles.redDot }}></div>
          <div style={{ ...styles.dot, ...styles.yellowDot }}></div>
          <div style={{ ...styles.dot, ...styles.greenDot }}></div>
          <div style={styles.titleText}>terminal — adam moses</div>
        </div>

        <div style={styles.content} onClick={() => inputRef.current?.focus()}>
          <div ref={terminalRef} style={styles.terminal}>
            {history.map((entry, i) => (
              <div key={i} style={styles.line}>
                {entry.type === "input" && (
                  <div style={{ display: "flex" }}>
                    <span style={styles.prompt}>{entry.path} $</span>
                    <span style={styles.inputLine}>{entry.content}</span>
                  </div>
                )}
                {entry.type === "output" && (
                  <div style={styles.output}>
                    {Array.isArray(entry.content)
                      ? entry.content.join("\n")
                      : entry.content}
                  </div>
                )}
                {entry.type === "error" && (
                  <div style={styles.error}>{entry.content}</div>
                )}
                {entry.type === "system" && (
                  <div style={styles.system}>{entry.content}</div>
                )}
              </div>
            ))}
          </div>

          <div style={styles.inputContainer}>
            <span style={styles.prompt}>{currentPath} $</span>
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              style={styles.input}
              autoFocus
              spellCheck={false}
            />
            <span style={styles.cursor}>▊</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function AdminPanel({
  writings,
  photos,
  work,
  setWritings,
  setPhotos,
  setWork,
  onClose,
}) {
  const [activeTab, setActiveTab] = useState("work");
  const [formData, setFormData] = useState({});

  const handleAdd = () => {
    const newItem = { ...formData };
    if (activeTab === "work") setWork([...work, newItem]);
    else if (activeTab === "writings") setWritings([...writings, newItem]);
    else if (activeTab === "photos") setPhotos([...photos, newItem]);
    setFormData({});
  };

  const handleDelete = (name) => {
    if (activeTab === "work") setWork(work.filter((w) => w.name !== name));
    else if (activeTab === "writings")
      setWritings(writings.filter((w) => w.name !== name));
    else if (activeTab === "photos")
      setPhotos(photos.filter((p) => p.name !== name));
  };

  const currentItems =
    activeTab === "work" ? work : activeTab === "writings" ? writings : photos;

  return (
    <div
      style={{
        padding: "40px",
        maxWidth: "1000px",
        margin: "0 auto",
        fontFamily: "system-ui",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: "30px",
        }}
      >
        <h1 style={{ margin: 0 }}>Admin Panel</h1>
        <button
          onClick={onClose}
          style={{ padding: "10px 20px", cursor: "pointer" }}
        >
          Back to Terminal
        </button>
      </div>

      <div style={{ display: "flex", gap: "10px", marginBottom: "30px" }}>
        {["work", "writings", "photos"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: "10px 20px",
              cursor: "pointer",
              background: activeTab === tab ? "#000" : "#ddd",
              color: activeTab === tab ? "#fff" : "#000",
              border: "none",
              borderRadius: "4px",
            }}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      <div
        style={{
          background: "#f9f9f9",
          padding: "20px",
          borderRadius: "8px",
          marginBottom: "30px",
        }}
      >
        <h3>Add New {activeTab.slice(0, -1)}</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          <input
            placeholder="name (e.g., my-project)"
            value={formData.name || ""}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            style={{
              padding: "10px",
              borderRadius: "4px",
              border: "1px solid #ccc",
            }}
          />
          <input
            placeholder="title"
            value={formData.title || ""}
            onChange={(e) =>
              setFormData({ ...formData, title: e.target.value })
            }
            style={{
              padding: "10px",
              borderRadius: "4px",
              border: "1px solid #ccc",
            }}
          />
          {activeTab === "work" && (
            <>
              <input
                placeholder="role"
                value={formData.role || ""}
                onChange={(e) =>
                  setFormData({ ...formData, role: e.target.value })
                }
                style={{
                  padding: "10px",
                  borderRadius: "4px",
                  border: "1px solid #ccc",
                }}
              />
              <input
                placeholder="year"
                value={formData.year || ""}
                onChange={(e) =>
                  setFormData({ ...formData, year: e.target.value })
                }
                style={{
                  padding: "10px",
                  borderRadius: "4px",
                  border: "1px solid #ccc",
                }}
              />
            </>
          )}
          {activeTab === "writings" && (
            <input
              placeholder="date (e.g., 2024-03-15)"
              value={formData.date || ""}
              onChange={(e) =>
                setFormData({ ...formData, date: e.target.value })
              }
              style={{
                padding: "10px",
                borderRadius: "4px",
                border: "1px solid #ccc",
              }}
            />
          )}
          {activeTab === "photos" && (
            <input
              placeholder="location"
              value={formData.location || ""}
              onChange={(e) =>
                setFormData({ ...formData, location: e.target.value })
              }
              style={{
                padding: "10px",
                borderRadius: "4px",
                border: "1px solid #ccc",
              }}
            />
          )}
          <textarea
            placeholder={activeTab === "writings" ? "content" : "description"}
            value={
              formData[activeTab === "writings" ? "content" : "description"] ||
              ""
            }
            onChange={(e) =>
              setFormData({
                ...formData,
                [activeTab === "writings" ? "content" : "description"]:
                  e.target.value,
              })
            }
            style={{
              padding: "10px",
              borderRadius: "4px",
              border: "1px solid #ccc",
              minHeight: "100px",
            }}
          />
          <button
            onClick={handleAdd}
            style={{
              padding: "10px",
              background: "#28ca42",
              color: "#fff",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            Add Item
          </button>
        </div>
      </div>

      <h3>Current {activeTab}</h3>
      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        {currentItems.map((item, i) => (
          <div
            key={i}
            style={{
              background: "#fff",
              padding: "15px",
              borderRadius: "8px",
              border: "1px solid #ddd",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "start",
              }}
            >
              <div>
                <strong>{item.title}</strong> ({item.name})
                <div
                  style={{ fontSize: "14px", color: "#666", marginTop: "5px" }}
                >
                  {activeTab === "work" && `${item.role} - ${item.year}`}
                  {activeTab === "writings" && item.date}
                  {activeTab === "photos" && item.location}
                </div>
              </div>
              <button
                onClick={() => handleDelete(item.name)}
                style={{
                  padding: "5px 10px",
                  background: "#ff5f57",
                  color: "#fff",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                }}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
