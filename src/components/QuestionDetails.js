import React, { useEffect, useState } from 'react';
import api from '../api';
import { useParams } from 'react-router-dom';
import { toast } from 'react-toastify';

export default function QuestionDetails() {
  const { id } = useParams();
  const [q, setQ] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await api.get(`/questions/${id}`);
        setQ(data);
      } catch (err) {
        console.error(err);
        toast.error('Load failed');
      }
    };
    load();
  }, [id]);

  if (!q) return <div className="card">Loading...</div>;

  return (
    <div className="card">
      <h3>{q.title}</h3>
      <p><strong>Category:</strong> {q.category} • <strong>Difficulty:</strong> {q.difficulty}</p>
      <pre style={{whiteSpace:'pre-wrap'}}>{q.description}</pre>
      <p>Votes: {q.votes}</p>
    </div>
  );
}
