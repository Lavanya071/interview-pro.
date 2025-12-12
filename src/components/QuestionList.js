import React, { useEffect, useState, useContext } from 'react';
import api from '../api';
import AuthContext from '../contexts/AuthContext';
import { toast } from 'react-toastify';
import '../styles.css';

export default function QuestionList() {
  const [questions, setQuestions] = useState([]);
  const { user } = useContext(AuthContext);

  const fetchQuestions = async () => {
    try { const { data } = await api.get('/questions'); setQuestions(data); }
    catch { toast.info('Load failed'); }
  };
  useEffect(()=>{ fetchQuestions(); },[]);

  const vote = async id => {
    if (!user) return toast.info('Login to vote');
    try { await api.post(`/questions/${id}/vote`); setQuestions(qs=>qs.map(q=>q.id===id?{...q,votes:q.votes+1}:q)); toast.success('Voted!'); }
    catch(err){ toast.error(err?.response?.data?.msg||'Vote failed'); }
  };

  const bookmark = async id => {
    if (!user) return toast.info('Login to bookmark');
    try { await api.post('/users/bookmark',{questionId:id}); toast.success('Bookmarked!'); }
    catch(err){ toast.error(err?.response?.data?.msg||'Bookmark failed'); }
  };

  return (
    <div>
      {questions.map(q=>(
        <div key={q.id} className="question-card">
          <h4>{q.question_text}</h4>
          <p>Votes: {q.votes}</p>
          <button onClick={()=>vote(q.id)}>Upvote</button>
          {user && <button onClick={()=>bookmark(q.id)}>Bookmark</button>}
        </div>
      ))}
    </div>
  );
}
