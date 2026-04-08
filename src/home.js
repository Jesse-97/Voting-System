import { useNavigate, useLocation } from "react-router-dom";
import React, { useEffect, useMemo, useState } from "react";
import "./home.css";
import CreatePoll from "./create.js";
import { loadPolls, normalizePoll, savePolls } from "./pollStorage";

const MAX_POLL_CARDS = 8;

const PIE_COLORS = ["#4fc3f7", "#81c784", "#ffb74d", "#e57373", "#ba68c8"];

const formatPollDate = (dateString) => {
  if (!dateString) {
    return "N/A";
  }

  const parsed = new Date(dateString);
  if (Number.isNaN(parsed.getTime())) {
    return "N/A";
  }

  return parsed.toLocaleDateString();
};

const getSearchableText = (poll, mode) => {
  if (mode === "tag") {
    return (poll.tags || []).join(" ").toLowerCase();
  }

  if (mode === "question") {
    return (poll.question || "").toLowerCase();
  }

  return `${poll.question || ""} ${(poll.tags || []).join(" ")}`.toLowerCase();
};

const buildPieGradient = (options = []) => {
  const totalVotes = options.reduce((sum, option) => sum + (Number(option.votes) || 0), 0);

  if (totalVotes <= 0) {
    return "conic-gradient(#4a4a4a 0deg 360deg)";
  }

  let currentAngle = 0;
  const slices = options
    .filter((option) => Number(option.votes) > 0)
    .map((option, index) => {
      const angle = ((Number(option.votes) || 0) / totalVotes) * 360;
      const start = currentAngle;
      const end = currentAngle + angle;
      currentAngle = end;

      return `${PIE_COLORS[index % PIE_COLORS.length]} ${start}deg ${end}deg`;
    });

  return `conic-gradient(${slices.join(",")})`;
};

export default function Home() {
  const [query, setQuery] = useState("");
  const [searchMode, setSearchMode] = useState("all");
  const navigate = useNavigate();
  const location = useLocation();
  const [user] = useState(() => {
    if (location.state?.user) {
      return location.state.user;
    }

    const stored = localStorage.getItem("user");
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        return null;
      }
    }

    return null;
  });

  useEffect(() => {
    if (!user) {
      navigate("/", { replace: true });
    }
  }, [user, navigate]);

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Search query:", query);
  };

  const [showCreate, setShowCreate] = useState(false);
  const [polls, setPolls] = useState([]);
  const [activePollId, setActivePollId] = useState(null);
  const [selectedOptionIds, setSelectedOptionIds] = useState([]);

  const [open, setOpen] = useState(false);

  const handleSidebarClick = () => {
    setOpen(!open);
    console.log("Sidebar clicked");
  };

  const handleLogoutClick = () => {
    localStorage.removeItem("user");
    navigate("/");
  };

  const handleUserMenuClick = () => {
    navigate("/user-menu", { state: { user } });
  };

  const handleCreatePoll = (poll) => {
    setPolls((prevPolls) => [
      normalizePoll({
        ...poll,
        createdBy: poll.createdBy || user?.username || "Unknown",
        createdById: poll.createdById || user?.id || null,
      }),
      ...prevPolls,
    ]);
    setShowCreate(false);
  };

  useEffect(() => {
    setPolls(loadPolls());
  }, []);

  useEffect(() => {
    savePolls(polls);
  }, [polls]);

  const filteredPolls = useMemo(() => {
    const lowerQuery = query.trim().toLowerCase();

    if (!lowerQuery) {
      return polls;
    }

    return polls.filter((poll) =>
      getSearchableText(poll, searchMode).includes(lowerQuery)
    );
  }, [polls, query, searchMode]);

  const activePoll = polls.find((poll) => poll.id === activePollId) || null;

  const openPollPopup = (poll) => {
    const userId = user?.id;
    const existingSelection = userId
      ? poll.votesByUser?.[userId] || []
      : [];

    setSelectedOptionIds(existingSelection);
    setActivePollId(poll.id);
  };

  const closePollPopup = () => {
    setActivePollId(null);
    setSelectedOptionIds([]);
  };

  const handleOptionToggle = (optionId) => {
    if (!activePoll) {
      return;
    }

    if (activePoll.allowMultiple) {
      setSelectedOptionIds((prev) =>
        prev.includes(optionId)
          ? prev.filter((id) => id !== optionId)
          : [...prev, optionId]
      );
      return;
    }

    setSelectedOptionIds([optionId]);
  };

  const handleVoteSubmit = () => {
    if (!activePoll || !user?.id || selectedOptionIds.length === 0) {
      return;
    }

    setPolls((prevPolls) =>
      prevPolls.map((poll) => {
        if (poll.id !== activePoll.id) {
          return poll;
        }

        const previousSelection = poll.votesByUser?.[user.id] || [];

        const updatedOptions = poll.options.map((option) => {
          const wasSelected = previousSelection.includes(option.id);
          const isSelected = selectedOptionIds.includes(option.id);

          let updatedVotes = option.votes;
          if (wasSelected && !isSelected) {
            updatedVotes = Math.max(0, updatedVotes - 1);
          } else if (!wasSelected && isSelected) {
            updatedVotes += 1;
          }

          return {
            ...option,
            votes: updatedVotes,
          };
        });

        return {
          ...poll,
          options: updatedOptions,
          votesByUser: {
            ...(poll.votesByUser || {}),
            [user.id]: selectedOptionIds,
          },
        };
      })
    );

    closePollPopup();
  };

  const cards = [...filteredPolls.slice(0, MAX_POLL_CARDS)];
  while (cards.length < MAX_POLL_CARDS) {
    cards.push(null);
  }

  const availableTags = useMemo(
    () => [...new Set(polls.flatMap((poll) => poll.tags || []))],
    [polls]
  );

  const firstRowCards = cards.slice(0, 4);
  const secondRowCards = cards.slice(4, 8);

  const renderPollCard = (poll, key) => (
    <div
      className={`item ${poll ? "poll-item" : ""}`}
      key={key}
      onClick={() => poll && openPollPopup(poll)}
    >
      {poll ? (
        <div className="poll-card-content">
          <div className="poll-meta-row">
            <span className="poll-badge">{poll.category}</span>
            <span className="poll-visibility">{poll.visibility}</span>
          </div>
          <h3 className="poll-question">{poll.question}</h3>
          <p className="poll-description">
            {poll.description || "No description provided."}
          </p>

          {!!poll.tags?.length && (
            <div className="poll-tags-row">
              {poll.tags.slice(0, 3).map((tag) => (
                <span key={`${poll.id}-${tag}`} className="poll-tag">
                  #{tag}
                </span>
              ))}
            </div>
          )}

          <div className="poll-stats-row">
            <div
              className="poll-pie-chart"
              style={{
                background: buildPieGradient(poll.options),
              }}
              title="Vote distribution"
            >
              <span>
                {poll.options.reduce(
                  (sum, option) => sum + (Number(option.votes) || 0),
                  0
                )}
              </span>
            </div>
            <p className="poll-options-count">
              {poll.options?.length || 0} options ·
              {poll.allowMultiple ? " Multiple selections" : " Single selection"}
            </p>
          </div>

          <div className="poll-footer">
            <span>By: {poll.createdBy || "Unknown"}</span>
            <span>Ends: {formatPollDate(poll.expiresAt)}</span>
          </div>
        </div>
      ) : (
        <div className="poll-card-placeholder">No poll yet</div>
      )}
    </div>
  );

  if (!user) {
    return (
      <div className="home-root">
        <div className="video-background">
          <video autoPlay muted loop playsInline preload="auto">
            <source src="/damascus.mp4" type="video/mp4" />
          </video>
        </div>
        <div className="main-container">
          <h2 style={{ color: "white" }}>Redirecting to login...</h2>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="home-root">
        <div className="video-background">
          <video autoPlay muted loop playsInline preload="auto">
            <source src="/damascus.mp4" type="video/mp4" />
          </video>
        </div>
        <div className="main-container">
          <div className={`sidebar ${open ? "open" : ""}`}>
            <div className="top">
              <button onClick={handleSidebarClick}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 640 640"
                  style={{ width: "25px", height: "25px" }}
                >
                  <path
                    fill="#e0e0e0"
                    d="M96 160C96 142.3 110.3 128 128 128L512 128C529.7 128 544 142.3 544 160C544 177.7 529.7 192 512 192L128 192C110.3 192 96 177.7 96 160zM96 320C96 302.3 110.3 288 128 288L512 288C529.7 288 544 302.3 544 320C544 337.7 529.7 352 512 352L128 352C110.3 352 96 337.7 96 320zM544 480C544 497.7 529.7 512 512 512L128 512C110.3 512 96 497.7 96 480C96 462.3 110.3 448 128 448L512 448C529.7 448 544 462.3 544 480z"
                  />
                </svg>
              </button>
              <div className="visionText visionColor">
                <h1 style={{ fontSize: "1.25rem" }}>Vision</h1>
                <h1 className="ent" style={{ fontSize: "0.8rem" }}>
                  .ent
                </h1>
              </div>
            </div>
            <div className="bottom">
              <div className="text-container">
                <button onClick={handleUserMenuClick} className="user-menu-trigger">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 640 640"
                    style={{ width: "25px", height: "25px" }}
                  >
                    <path
                      fill="#e0e0e0"
                      d="M463 448.2C440.9 409.8 399.4 384 352 384L288 384C240.6 384 199.1 409.8 177 448.2C212.2 487.4 263.2 512 320 512C376.8 512 427.8 487.3 463 448.2zM64 320C64 178.6 178.6 64 320 64C461.4 64 576 178.6 576 320C576 461.4 461.4 576 320 576C178.6 576 64 461.4 64 320zM320 336C359.8 336 392 303.8 392 264C392 224.2 359.8 192 320 192C280.2 192 248 224.2 248 264C248 303.8 280.2 336 320 336z"
                    />
                  </svg>
                  {open && (
                    <span className="user-label">{user?.username || "User"}</span>
                  )}
                </button>
              </div>
              <div className="text-container">
                <button onClick={handleLogoutClick}>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 640 640"
                    style={{ width: "25px", height: "25px" }}
                  >
                    <path
                      fill="#e0e0e0"
                      d="M569 337C578.4 327.6 578.4 312.4 569 303.1L425 159C418.1 152.1 407.8 150.1 398.8 153.8C389.8 157.5 384 166.3 384 176L384 256L272 256C245.5 256 224 277.5 224 304L224 336C224 362.5 245.5 384 272 384L384 384L384 464C384 473.7 389.8 482.5 398.8 486.2C407.8 489.9 418.1 487.9 425 481L569 337zM224 160C241.7 160 256 145.7 256 128C256 110.3 241.7 96 224 96L160 96C107 96 64 139 64 192L64 448C64 501 107 544 160 544L224 544C241.7 544 256 529.7 256 512C256 494.3 241.7 480 224 480L160 480C142.3 480 128 465.7 128 448L128 192C128 174.3 142.3 160 160 160L224 160z"
                    />
                  </svg>
                </button>
                <h1 className="visionText" style={{ fontSize: "1.15rem" }}>
                  Logout
                </h1>
              </div>
            </div>
          </div>
          {showCreate && (
            <CreatePoll
              onClose={() => setShowCreate(false)}
              onCreate={handleCreatePoll}
              currentUser={user}
            />
          )}
          <div className="container">
            <div className="create-button">
              <button onClick={() => setShowCreate(true)}>Create</button>
            </div>
            <div className="search-container">
              <img src="vector_logo1.png" className="logo" alt="" />
              <form onSubmit={handleSubmit}>
                <div className="search-controls">
                  <input
                    type="text"
                    placeholder={
                      searchMode === "tag"
                        ? "Search by tag (e.g. sports)"
                        : "Search polls..."
                    }
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    list={searchMode === "tag" ? "poll-tags-list" : undefined}
                  />
                  <select
                    className="search-mode-select"
                    value={searchMode}
                    onChange={(e) => setSearchMode(e.target.value)}
                    aria-label="Search mode"
                  >
                    <option value="all">All</option>
                    <option value="question">Question</option>
                    <option value="tag">Tag</option>
                  </select>
                </div>
                {searchMode === "tag" && (
                  <datalist id="poll-tags-list">
                    {availableTags.map((tag) => (
                      <option key={tag} value={tag} />
                    ))}
                  </datalist>
                )}
              </form>
            </div>
            <div className="display-container">
              <div className="grid-container">
                {firstRowCards.map((poll, index) =>
                  renderPollCard(poll, `poll-row1-${index}`)
                )}
              </div>
              <div className="grid-container">
                {secondRowCards.map((poll, index) =>
                  renderPollCard(poll, `poll-row2-${index}`)
                )}
              </div>
            </div>
          </div>
        </div>

        {activePoll && (
          <div className="poll-popup-overlay" onClick={closePollPopup}>
            <div className="poll-popup" onClick={(e) => e.stopPropagation()}>
              <div className="poll-popup-header">
                <h3>{activePoll.question}</h3>
                <button onClick={closePollPopup} aria-label="Close poll popup">
                  ×
                </button>
              </div>

              <p className="poll-popup-description">
                {activePoll.description || "No description provided."}
              </p>

              {!!activePoll.tags?.length && (
                <div className="poll-tags-row">
                  {activePoll.tags.map((tag) => (
                    <span key={`${activePoll.id}-popup-${tag}`} className="poll-tag">
                      #{tag}
                    </span>
                  ))}
                </div>
              )}

              <div className="poll-popup-options">
                {activePoll.options.map((option) => {
                  const totalVotes = activePoll.options.reduce(
                    (sum, item) => sum + (Number(item.votes) || 0),
                    0
                  );
                  const percent =
                    totalVotes > 0
                      ? Math.round(((option.votes || 0) / totalVotes) * 100)
                      : 0;

                  return (
                    <button
                      key={option.id}
                      className={`poll-option-btn ${
                        selectedOptionIds.includes(option.id) ? "selected" : ""
                      }`}
                      onClick={() => handleOptionToggle(option.id)}
                    >
                      <div>
                        <strong>{option.text}</strong>
                        <p>
                          {option.votes || 0} votes ({percent}%)
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="poll-popup-footer">
                <span>
                  {activePoll.allowMultiple
                    ? "Multiple selections allowed"
                    : "Single selection poll"}
                </span>
                <button
                  className="submit-vote-btn"
                  onClick={handleVoteSubmit}
                  disabled={selectedOptionIds.length === 0}
                >
                  Submit vote
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
