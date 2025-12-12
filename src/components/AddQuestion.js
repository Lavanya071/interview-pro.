import React, { useState } from 'react';
import api from '../api';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

export default function AddQuestion() {
  const [question_text, setQuestionText] = useState('');
  const [option_a, setOptionA] = useState('');
  const [option_b, setOptionB] = useState('');
  const [option_c, setOptionC] = useState('');
  const [option_d, setOptionD] = useState('');
  const [correct_option, setCorrectOption] = useState('A');
  const [category, setCategory] = useState('General');
  const [difficulty, setDifficulty] = useState('Medium');

  const nav = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/questions', {
        question_text,
        option_a,
        option_b,
        option_c,
        option_d,
        correct_option,
        category,
        difficulty
      });
      toast.success('Question added');
      nav('/');
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.msg || 'Add failed');
    }
  };

  return (
    <div className="card">
      <h3>Add Question</h3>
      <form className="form" onSubmit={submit}>
        <input placeholder="Question" value={question_text} onChange={e => setQuestionText(e.target.value)} />
        <input placeholder="Option A" value={option_a} onChange={e => setOptionA(e.target.value)} />
        <input placeholder="Option B" value={option_b} onChange={e => setOptionB(e.target.value)} />
        <input placeholder="Option C" value={option_c} onChange={e => setOptionC(e.target.value)} />
        <input placeholder="Option D" value={option_d} onChange={e => setOptionD(e.target.value)} />
        <select value={correct_option} onChange={e => setCorrectOption(e.target.value)}>
          <option>A</option>
          <option>B</option>
          <option>C</option>
          <option>D</option>
        </select>
        <input placeholder="Category" value={category} onChange={e => setCategory(e.target.value)} />
        <select value={difficulty} onChange={e => setDifficulty(e.target.value)}>
          <option>Easy</option>
          <option>Medium</option>
          <option>Hard</option>
        </select>
        <button type="submit">Add Question</button>
      </form>
    </div>
  );
}
