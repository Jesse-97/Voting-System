import React, { useState } from "react";
import "./create.css";

export default function Create({ onClose, onCreate, currentUser }) {
  const [question, setQuestion] = useState("");
  const [description, setDescription] = useState("");
  const [tagsInput, setTagsInput] = useState("");
  const [category, setCategory] = useState("General");
  const [durationHours, setDurationHours] = useState(24);
  const [allowMultiple, setAllowMultiple] = useState(false);
  const [visibility, setVisibility] = useState("public");
  const [answers, setAnswers] = useState([
    { id: 1, text: "" },
    { id: 2, text: "" },
  ]);

  const handleClose = () => {
    if (typeof onClose === "function") {
      onClose();
    }
  };

  const handleCreatePoll = (e) => {
    e.preventDefault();

    const trimmedQuestion = question.trim();
    const trimmedDescription = description.trim();
    const tags = [
      ...new Set(
        tagsInput
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean)
      ),
    ];
    const cleanedOptions = answers
      .map((answer) => answer.text.trim())
      .filter(Boolean);

    const preparedOptions = cleanedOptions.map((text, index) => ({
      id: `opt-${Date.now()}-${index}`,
      text,
      votes: 0,
    }));

    if (!trimmedQuestion || preparedOptions.length < 2) {
      return;
    }

    const createdAt = new Date();
    const expiresAt = new Date(
      createdAt.getTime() + Number(durationHours) * 60 * 60 * 1000
    );

    const poll = {
      id: `poll-${Date.now()}`,
      question: trimmedQuestion,
      description: trimmedDescription,
      options: preparedOptions,
      category,
      allowMultiple,
      visibility,
      createdAt: createdAt.toISOString(),
      expiresAt: expiresAt.toISOString(),
      createdBy: currentUser?.username || "Unknown",
      createdById: currentUser?.id || null,
      tags,
      votesByUser: {},
    };

    if (typeof onCreate === "function") {
      onCreate(poll);
    }

    handleClose();
  };

  return (
    <>
      <div className="create-overlay">
        <div className="create-container">
          <header className="create-header">
            <h2>Create a poll</h2>
            <button onClick={handleClose}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 640 640"
                style={{ width: "24px", height: "24px" }}
              >
                <path
                  fill="#e9e9e9ff"
                  d="M504.6 148.5C515.9 134.9 514.1 114.7 500.5 103.4C486.9 92.1 466.7 93.9 455.4 107.5L320 270L184.6 107.5C173.3 93.9 153.1 92.1 139.5 103.4C125.9 114.7 124.1 134.9 135.4 148.5L278.3 320L135.4 491.5C124.1 505.1 125.9 525.3 139.5 536.6C153.1 547.9 173.3 546.1 184.6 532.5L320 370L455.4 532.5C466.7 546.1 486.9 547.9 500.5 536.6C514.1 525.3 515.9 505.1 504.6 491.5L361.7 320L504.6 148.5z"
                />
              </svg>
            </button>
          </header>

          <div className="create-body">
            <form className="create-form" onSubmit={handleCreatePoll}>
              <label className="question-label">
                Question:
                <input
                  type="text"
                  placeholder="What do you want to ask?"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  maxLength={120}
                  required
                />
              </label>

              <label className="question-label">
                Description (optional):
                <textarea
                  rows={3}
                  placeholder="Add context for voters..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  maxLength={240}
                />
              </label>

              <label className="question-label">
                Tags (comma separated):
                <input
                  type="text"
                  placeholder="e.g. school, sports, finals"
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                  maxLength={120}
                />
              </label>

              <div className="poll-settings-grid">
                <label>
                  Category:
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                  >
                    <option value="General">General</option>
                    <option value="Technology">Technology</option>
                    <option value="Sports">Sports</option>
                    <option value="Entertainment">Entertainment</option>
                    <option value="Education">Education</option>
                  </select>
                </label>

                <label>
                  Poll duration:
                  <select
                    value={durationHours}
                    onChange={(e) => setDurationHours(Number(e.target.value))}
                  >
                    <option value={24}>24 hours</option>
                    <option value={72}>3 days</option>
                    <option value={168}>7 days</option>
                    <option value={336}>14 days</option>
                  </select>
                </label>

                <label>
                  Visibility:
                  <select
                    value={visibility}
                    onChange={(e) => setVisibility(e.target.value)}
                  >
                    <option value="public">Public</option>
                    <option value="private">Private</option>
                  </select>
                </label>

                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={allowMultiple}
                    onChange={(e) => setAllowMultiple(e.target.checked)}
                  />
                  Allow multiple selections
                </label>
              </div>

              <label className="answers-label">
                Options:
                {answers.map((answer) => (
                  <div className="answer-box" key={answer.id}>
                    <input
                      type="text"
                      placeholder="Type your answer"
                      value={answer.text}
                      onChange={(e) => {
                        setAnswers(
                          answers.map((a) =>
                            a.id === answer.id
                              ? { ...a, text: e.target.value }
                              : a
                          )
                        );
                      }}
                    />

                    <button
                      className="delete-btn"
                      onClick={() =>
                        setAnswers((prevAnswers) => {
                          if (prevAnswers.length <= 2) {
                            return prevAnswers;
                          }

                          return prevAnswers.filter((a) => a.id !== answer.id);
                        })
                      }
                      type="button"
                      disabled={answers.length <= 2}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 640 640"
                        style={{ width: "20px", height: "20px" }}
                      >
                        <path
                          fill="#dbdbdbff"
                          d="M232.7 69.9L224 96L128 96C110.3 96 96 110.3 96 128C96 145.7 110.3 160 128 160L512 160C529.7 160 544 145.7 544 128C544 110.3 529.7 96 512 96L416 96L407.3 69.9C402.9 56.8 390.7 48 376.9 48L263.1 48C249.3 48 237.1 56.8 232.7 69.9zM512 208L128 208L149.1 531.1C150.7 556.4 171.7 576 197 576L443 576C468.3 576 489.3 556.4 490.9 531.1L512 208z"
                        />
                      </svg>
                    </button>
                  </div>
                ))}
                <button
                  className="add-answer"
                  onClick={() =>
                    setAnswers([...answers, { id: Date.now(), text: "" }])
                  }
                  type="button"
                >
                  + Add new option
                </button>
              </label>
              <button className="post-btn" type="submit">
                Post
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
