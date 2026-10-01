const TaskItem = ({ task, onToggle, onDelete }) => {
 return (
 <div className={`task ${task.completed ? "done" : ""}`}>
 <div>
 <div className="title">{task.title}</div>
 {task.description && (
 <div style={{ fontSize: 12, color: "#666" }}>{task.description}</div>
 )}
 </div>
 <div>
 <button onClick={() => onToggle(task)} style={{ marginRight: 8 }}>
 {task.completed ? "Undo" : "Done"}
 </button>
 <button className="danger" onClick={() => onDelete(task._id)}>Delete</button>
 </div>
 </div>
 );
};
export default TaskItem;
