import { useNavigate } from "react-router-dom";
import React, { useEffect, useState } from "react";
import "./create.css";

export default function Create({ onClose }) {
  const [answers, setAnswers] = useState([
    { id: 1, text: "" },
    { id: 2, text: "" },
  ]);
  return (
    <>
      <div className="create-overlay">
        <div className="create-container">
          <header className="create-header">
            <h2>Create a poll</h2>
            <button onClick={onClose}>
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
            <form className="create-form">
              <label className="question-label">
                Question:
                <input type="text" placeholder="What do you want to ask?" />
              </label>
              <label className="answers-label">
                Options:
                {answers.map((answer, index) => (
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
                        setAnswers(answers.filter((a) => a.id !== answer.id))
                      }
                      type="button"
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
              <button className="post-btn" type="submit">Post</button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
