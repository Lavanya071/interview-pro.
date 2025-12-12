import React, { useState } from 'react';
import '../styles.css';

const questions = [
  { id: 1, question_text: 'What is React?', options: ['JS library', 'Framework', 'Language', 'Database'], correct_option: 'a' },
  { id: 2, question_text: 'What is Node.js?', options: ['JS runtime', 'Framework', 'Language', 'Database'], correct_option: 'a' },
];

export default function MockTest() {
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const handleAnswer = (id, option) => {
    if (!submitted) setAnswers({ ...answers, [id]: option });
  };

  const score = Object.keys(answers).reduce(
    (acc, id) => (answers[id] === questions.find(q => q.id === parseInt(id)).correct_option ? acc + 1 : acc),
    0
  );

  return (
    <div className="mock-container">
      <h2>Mock Test</h2>
      {questions.map(q => (
        <div key={q.id} className="mock-card">
          <h4>{q.question_text}</h4>
          <div className="options">
            {q.options.map((opt, idx) => {
              const letter = String.fromCharCode(97 + idx);
              const bg = submitted
                ? q.correct_option === letter
                  ? '#d4edda' // correct
                  : answers[q.id] === letter
                  ? '#f8d7da' // wrong
                  : '#fff'
                : answers[q.id] === letter
                ? '#cce5ff' // selected
                : '#fff';
              return (
                <button
                  key={opt}
                  className="option-btn"
                  style={{ backgroundColor: bg, color: 'black' }} // text stays black
                  onClick={() => handleAnswer(q.id, letter)}
                  disabled={submitted}
                >
                  {letter}) {opt}
                </button>
              );
            })}
          </div>
        </div>
      ))}
      {!submitted ? (
        <button className="submit-btn" onClick={() => setSubmitted(true)}>
          Submit Test
        </button>
      ) : (
        <p className={`score ${score === questions.length ? 'perfect' : score > 0 ? 'good' : 'fail'}`}>
          Your score: {score}/{questions.length}
        </p>
      )}
    </div>
  );
}
