import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./userMenu.css";

const API_BASE_URL = process.env.REACT_APP_API_URL || "";

export default function UserMenu() {
  const location = useLocation();
  const navigate = useNavigate();
  const [allPolls, setAllPolls] = useState([]);
  const [editingPollId, setEditingPollId] = useState(null);
  const [editingForm, setEditingForm] = useState({
    question: "",
    description: "",
    category: "General",
    visibility: "public",
    allowMultiple: false,
    tagsInput: "",
  });

  const user = (() => {
    if (location.state?.user) {
      return location.state.user;
    }

    const stored = localStorage.getItem("user");
    if (!stored) {
      return null;
    }

    try {
      return JSON.parse(stored);
    } catch {
      return null;
    }
  })();

  useEffect(() => {
    const fetchPolls = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/polls`);

        if (!response.ok) {
          throw new Error("Failed to load polls");
        }

        const data = await response.json();
        setAllPolls(
          data.filter((poll) => poll.createdById === user?.id)
        );
      } catch (error) {
        console.error("Load polls error:", error);
        setAllPolls([]);
      }
    };

    fetchPolls();
  }, [user]);

  const myPolls = useMemo(() => {
    if (!user) {
      return [];
    }

    return allPolls.filter((poll) => poll.createdById === user.id);
  }, [allPolls, user]);

  const handleDeletePoll = async (pollId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/polls/${pollId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete poll");
      }

      const refreshed = await fetch(`${API_BASE_URL}/polls`);

      if (!refreshed.ok) {
        throw new Error("Failed to refresh polls");
      }

      const data = await refreshed.json();
      setAllPolls(data.filter((poll) => poll.createdById === user?.id));
    } catch (error) {
      console.error("Delete poll error:", error);
    }
  };

  const beginEditPoll = (poll) => {
    if (poll.createdById !== user?.id) {
      return;
    }

    setEditingPollId(poll.id);
    setEditingForm({
      question: poll.question || "",
      description: poll.description || "",
      category: poll.category || "General",
      visibility: poll.visibility || "public",
      allowMultiple: Boolean(poll.allowMultiple),
      tagsInput: (poll.tags || []).join(", "),
    });
  };

  const handleSaveEdit = (pollId) => {
    const trimmedQuestion = editingForm.question.trim();
    const tags = [
      ...new Set(
        editingForm.tagsInput
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean)
      ),
    ];

    if (!trimmedQuestion) {
      return;
    }

    const saveEdit = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/polls/${pollId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            question: trimmedQuestion,
            description: editingForm.description.trim(),
            category: editingForm.category,
            visibility: editingForm.visibility,
            allowMultiple: editingForm.allowMultiple,
            tags,
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to save poll");
        }

        const refreshed = await fetch(`${API_BASE_URL}/polls`);

        if (!refreshed.ok) {
          throw new Error("Failed to refresh polls");
        }

        const data = await refreshed.json();
        setAllPolls(data.filter((poll) => poll.createdById === user?.id));
        setEditingPollId(null);
      } catch (error) {
        console.error("Save edit error:", error);
      }
    };

    saveEdit();
  };

  if (!user) {
    return (
      <div className="user-menu-root">
        <div className="video-background">
          <video autoPlay muted loop playsInline preload="auto">
            <source src="/damascus.mp4" type="video/mp4" />
          </video>
        </div>

        <div className="user-menu-card">
          <h2>User details unavailable</h2>
          <p>Please log in again.</p>
          <button onClick={() => navigate("/")}>Go to Login</button>
        </div>
      </div>
    );
  }

  return (
    <div className="user-menu-root">
      <div className="video-background">
        <video autoPlay muted loop playsInline preload="auto">
          <source src="/damascus.mp4" type="video/mp4" />
        </video>
      </div>

      <div className="user-menu-card">
        <h2>User Menu</h2>
        <div className="detail-row">
          <span className="label">Username</span>
          <span className="value">{user.username || "N/A"}</span>
        </div>
        <div className="detail-row">
          <span className="label">User ID</span>
          <span className="value">{user.id || "N/A"}</span>
        </div>
        <div className="detail-row">
          <span className="label">Status</span>
          <span className="value">Logged in</span>
        </div>

        <div className="my-polls-section">
          <h3>My created polls ({myPolls.length})</h3>

          {myPolls.length === 0 ? (
            <p className="empty-polls">No polls created yet.</p>
          ) : (
            <div className="my-polls-list">
              {myPolls.map((poll) => {
                const isEditing = editingPollId === poll.id;

                return (
                  <div key={poll.id} className="my-poll-card">
                    {isEditing ? (
                      <div className="edit-grid">
                        <label>
                          Question
                          <input
                            value={editingForm.question}
                            onChange={(e) =>
                              setEditingForm((prev) => ({
                                ...prev,
                                question: e.target.value,
                              }))
                            }
                          />
                        </label>
                        <label>
                          Description
                          <textarea
                            rows={2}
                            value={editingForm.description}
                            onChange={(e) =>
                              setEditingForm((prev) => ({
                                ...prev,
                                description: e.target.value,
                              }))
                            }
                          />
                        </label>
                        <label>
                          Category
                          <select
                            value={editingForm.category}
                            onChange={(e) =>
                              setEditingForm((prev) => ({
                                ...prev,
                                category: e.target.value,
                              }))
                            }
                          >
                            <option value="General">General</option>
                            <option value="Technology">Technology</option>
                            <option value="Sports">Sports</option>
                            <option value="Entertainment">Entertainment</option>
                            <option value="Education">Education</option>
                          </select>
                        </label>
                        <label>
                          Visibility
                          <select
                            value={editingForm.visibility}
                            onChange={(e) =>
                              setEditingForm((prev) => ({
                                ...prev,
                                visibility: e.target.value,
                              }))
                            }
                          >
                            <option value="public">Public</option>
                            <option value="private">Private</option>
                          </select>
                        </label>
                        <label>
                          Tags
                          <input
                            value={editingForm.tagsInput}
                            onChange={(e) =>
                              setEditingForm((prev) => ({
                                ...prev,
                                tagsInput: e.target.value,
                              }))
                            }
                            placeholder="tag1, tag2"
                          />
                        </label>
                        <label className="check-inline">
                          <input
                            type="checkbox"
                            checked={editingForm.allowMultiple}
                            onChange={(e) =>
                              setEditingForm((prev) => ({
                                ...prev,
                                allowMultiple: e.target.checked,
                              }))
                            }
                          />
                          Allow multiple selections
                        </label>
                        <div className="poll-actions">
                          <button onClick={() => handleSaveEdit(poll.id)}>Save</button>
                          <button
                            className="danger"
                            onClick={() => setEditingPollId(null)}
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <h4>{poll.question}</h4>
                        <p>{poll.description || "No description"}</p>
                        <div className="poll-meta">
                          <span>{poll.category}</span>
                          <span>{poll.visibility}</span>
                          <span>{poll.options?.length || 0} options</span>
                        </div>
                        {!!poll.tags?.length && (
                          <div className="poll-tags">
                            {poll.tags.map((tag) => (
                              <span key={`${poll.id}-${tag}`}>#{tag}</span>
                            ))}
                          </div>
                        )}
                        <div className="poll-actions">
                          <button onClick={() => beginEditPoll(poll)}>Modify</button>
                          <button
                            className="danger"
                            onClick={() => handleDeletePoll(poll.id)}
                          >
                            Delete
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="button-row">
          <button onClick={() => navigate("/home", { state: { user } })}>
            Back to Home
          </button>
          <button
            className="logout-btn"
            onClick={() => {
              localStorage.removeItem("user");
              navigate("/");
            }}
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}
