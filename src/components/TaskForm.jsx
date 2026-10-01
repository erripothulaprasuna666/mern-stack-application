import { useState } from "react";
const TaskForm = ({ onAdd }) => {
 const [title, setTitle] = useState("");
 const [description, setDescription] = useState("");
 const handleSubmit = (e) => {
 e.preventDefault(); // stop the page from reloading
 if (!title.trim()) return;
 onAdd({ title, description });
 setTitle("");
 setDescription("");
 };
 return (
 <form onSubmit={handleSubmit} style={{ marginBottom: 20 }}>
 <input
 placeholder="Task title"
 value={title}
 onChange={(e) => setTitle(e.target.value)}
 />
 <textarea
 placeholder="Description (optional)"
 value={description}
 onChange={(e) => setDescription(e.target.value)}
 />
 <button type="submit">Add Task</button>
 </form>
 );
};
export default TaskForm;

