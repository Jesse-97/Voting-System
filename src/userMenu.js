import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./userMenu.css";
import { isPollOwner, loadPolls, normalizePoll, savePolls } from "./pollStorage";

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
    setAllPolls(loadPolls());
  }, []);

  const myPolls = useMemo(() => {
    if (!user) {
      return [];
    }

    return allPolls.filter((poll) => isPollOwner(poll, user));
  }, [allPolls, user]);

  const handleDeletePoll = (pollId) => {
    setAllPolls((prevPolls) => {
      const targetPoll = prevPolls.find((poll) => poll.id === pollId);

      if (!targetPoll || !isPollOwner(targetPoll, user)) {
        return prevPolls;
      }

      const updated = prevPolls.filter((poll) => poll.id !== pollId);
      savePolls(updated);
      return updated;
    });
  };

  const beginEditPoll = (poll) => {
    if (!isPollOwner(poll, user)) {
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

    setAllPolls((prevPolls) => {
      const updated = prevPolls.map((poll) => {
        if (poll.id !== pollId) {
          return poll;
        }

        if (!isPollOwner(poll, user)) {
          return poll;
        }

        return normalizePoll({
          ...poll,
          question: trimmedQuestion,
          description: editingForm.description.trim(),
          category: editingForm.category,
          visibility: editingForm.visibility,
          allowMultiple: editingForm.allowMultiple,
          tags,
        });
      });

      savePolls(updated);
      return updated;
    });

    setEditingPollId(null);
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
