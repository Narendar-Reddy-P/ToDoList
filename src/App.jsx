import { useState } from "react";
import { useEffect } from "react";
const EMPTY_FORM = {
  title: "",
  description: "",
  category: "Maths",
  priority: "medium",
};

const CATEGORIES = ["Maths", "Science", "History", "English", "Art"];
const PRIORITY = {
  critical: {
    label: "Critical",
    border: "border-l-red-500",
    bg: "bg-red-50",
    badge: "bg-red-100 text-red-600",
    dot: "bg-red-500",
    hint: "Must do immediately",
  },
  high: {
    label: "High",
    border: "border-l-orange-400",
    bg: "bg-orange-50",
    badge: "bg-orange-100 text-orange-600",
    dot: "bg-orange-400",
    hint: "Do it soon",
  },
  medium: {
    label: "Medium",
    border: "border-l-yellow-400",
    bg: "bg-yellow-50",
    badge: "bg-yellow-100 text-yellow-600",
    dot: "bg-yellow-400",
    hint: "Can wait a little",
  },
  low: {
    label: "Low",
    border: "border-l-green-500",
    bg: "bg-green-50",
    badge: "bg-green-100 text-green-600",
    dot: "bg-green-500",
    hint: "Whenever you have time",
  },
};

const INITIAL_TASKS = [
  {
    id: 1,
    title: "Complete algebra worksheet",
    description: "Finish exercises 1–20 from chapter 4",
    category: "Maths",
    priority: "critical",
    completed: false,
  },
  {
    id: 2,
    title: "Read chapter 5",
    description: "Photosynthesis and cell respiration",
    category: "Science",
    priority: "high",
    completed: false,
  },
  {
    id: 3,
    title: "Essay outline",
    description: "Draft outline for WW2 essay",
    category: "History",
    priority: "medium",
    completed: true,
  },
  {
    id: 4,
    title: "Vocabulary list",
    description: "Learn 20 new words for Friday quiz",
    category: "English",
    priority: "low",
    completed: false,
  },
];

export default function App() {
  const [tasks, setTasks] = useState([]);
  const [selectedCat, setSelectedCat] = useState("All");
  const [showCompleted, setShowCompleted] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);

  useEffect(() => {
    async function loadTasks() {
      const res = await fetch("http://localhost:5000/api/tasks");
      const data = await res.json();
      setTasks(data);
    }
    loadTasks();
  }, []);

  // --- Filtered tasks ---
  const filtered = tasks.filter((t) => {
    const catOk = selectedCat === "All" || t.category === selectedCat;
    const compOk = showCompleted ? t.completed : !t.completed;
    return catOk && compOk;
  });

  const completedCount = tasks.filter((t) => t.completed).length;

  // --- Handlers ---
  async function handleToggleComplete(id) {
    const res = await fetch(`http://localhost:5000/api/tasks/${id}/complete`, {
      method: "PATCH",
    });
    const updated = await res.json();
    setTasks(tasks.map((t) => (t._id === id ? updated : t)));
  }

  async function handleDelete(id) {
    await fetch(`http://localhost:5000/api/tasks/${id}`, { method: "DELETE" });
    setTasks(tasks.filter((t) => t._id !== id));
  }

  function handleOpenNew() {
    setEditingTask(null);
    setForm(EMPTY_FORM);
    setShowModal(true);
  }

  function handleOpenEdit(task) {
    setEditingTask(task);
    setForm({
      title: task.title,
      description: task.description,
      category: task.category,
      priority: task.priority,
    });
    setShowModal(true);
  }

  async function handleSave() {
    if (!form.title.trim()) return;
    // REPLACE with this:
    if (editingTask) {
      const res = await fetch(
        `http://localhost:5000/api/tasks/${editingTask._id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        },
      );
      const updated = await res.json();
      setTasks(tasks.map((t) => (t._id === updated._id ? updated : t)));
    } else {
      const res = await fetch("http://localhost:5000/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const newTask = await res.json();
      setTasks([...tasks, newTask]);
    }
    setShowModal(false);
  }

  function handleCloseModal() {
    setShowModal(false);
  }

  return (
    <div className="min-h-screen bg-stone-100 p-6">
      <link
        href="https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=DM+Sans:wght@300;400;500;600&display=swap"
        rel="stylesheet"
      />

      {/* Priority Legend */}
      <PriorityLegend />

      {/* Layout */}
      <div className="flex gap-5 max-w-5xl mx-auto">
        {/* Sidebar */}
        <Sidebar
          selectedCat={selectedCat}
          onSelectCat={setSelectedCat}
          showCompleted={showCompleted}
          onToggleCompleted={() => setShowCompleted(!showCompleted)}
          completedCount={completedCount}
          onAddNew={handleOpenNew}
        />

        {/* Main task list */}
        <Main
          tasks={filtered}
          showCompleted={showCompleted}
          onToggleComplete={handleToggleComplete}
          onEdit={handleOpenEdit}
          onDelete={handleDelete}
          onAddNew={handleOpenNew}
        />
      </div>

      {/* Modal */}
      {showModal && (
        <Modal
          isEditing={!!editingTask}
          form={form}
          onFormChange={setForm}
          onSave={handleSave}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
}

/**
 * PriorityLegend
 * Displays a horizontal legend bar showing all priority levels with color dots and hints.
 */
function PriorityLegend() {
  return (
    <div className="flex flex-wrap gap-4 mb-5 bg-white rounded-xl px-5 py-3 w-fit shadow-sm">
      <span className="text-xs font-semibold text-stone-400 uppercase tracking-widest self-center mr-1">
        Priority:
      </span>
      {Object.entries(PRIORITY).map(([key, p]) => (
        <span
          key={key}
          className="flex items-center gap-1.5 text-sm font-medium text-stone-600"
        >
          <span className={`w-2.5 h-2.5 rounded-full ${p.dot}`} />
          {p.label}
          <span className="text-stone-400 text-xs">— {p.hint}</span>
        </span>
      ))}
    </div>
  );
}

/**
 * Sidebar
 * Props:
 *  - selectedCat: string — currently selected category
 *  - onSelectCat: (cat: string) => void
 *  - showCompleted: boolean
 *  - onToggleCompleted: () => void
 *  - completedCount: number
 *  - onAddNew: () => void
 */
function Sidebar({
  selectedCat,
  onSelectCat,
  showCompleted,
  onToggleCompleted,
  completedCount,
  onAddNew,
}) {
  return (
    <aside className="w-48 shrink-0 bg-white rounded-2xl shadow-sm p-4 flex flex-col gap-1 h-fit">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-base font-semibold text-stone-800">
          📋 ToDoList
        </span>
        <button
          onClick={onAddNew}
          title="Add new task"
          className="w-7 h-7 bg-stone-900 text-white rounded-lg text-lg flex items-center justify-center hover:bg-stone-700 transition-colors leading-none"
        >
          +
        </button>
      </div>

      {/* Category label */}
      <p className="text-xs font-semibold tracking-widest text-stone-400 uppercase mb-1">
        Category
      </p>

      {/* Category buttons */}
      {["All", ...CATEGORIES].map((cat) => (
        <button
          key={cat}
          onClick={() => onSelectCat(cat)}
          className={`text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
            selectedCat === cat
              ? "bg-stone-900 text-white"
              : "text-stone-600 hover:bg-stone-100"
          }`}
        >
          {cat}
        </button>
      ))}

      {/* Completed toggle */}
      <button
        onClick={onToggleCompleted}
        className={`mt-4 text-left px-3 py-2 rounded-lg text-sm font-medium border transition-colors ${
          showCompleted
            ? "bg-stone-900 text-white border-stone-900"
            : "border-stone-200 text-stone-500 hover:bg-stone-50"
        }`}
      >
        ✓ Completed ({completedCount})
      </button>
    </aside>
  );
}

/**
 * TaskCard
 * A single task row with expand/collapse, edit, delete, and complete toggle.
 */
function TaskCard({ task, onToggleComplete, onEdit, onDelete }) {
  const [expanded, setExpanded] = useState(false);
  const p = PRIORITY[task.priority];

  return (
    <div
      className={`bg-white rounded-xl shadow-sm border-l-4 overflow-hidden transition-all
        ${p.border}
        ${expanded ? p.bg : ""}
        ${task.completed ? "opacity-60" : ""}
      `}
    >
      {/* Collapsed row */}
      <div className="flex items-center gap-3 px-4 py-3.5">
        <input
          type="checkbox"
          checked={task.completed}
          onChange={() => onToggleComplete(task._id)}
          className="w-4 h-4 cursor-pointer accent-stone-800 shrink-0"
        />

        <span
          className={`flex-1 text-sm font-medium text-stone-800 ${
            task.completed ? "line-through" : ""
          }`}
        >
          {task.title}
        </span>

        {/* Priority badge */}
        <span
          className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${p.badge}`}
        >
          <span className={`w-1.5 h-1.5 rounded-full ${p.dot}`} />
          {p.label}
        </span>

        {/* Category badge */}
        <span className="text-xs text-stone-500 bg-stone-100 px-2.5 py-1 rounded-full">
          {task.category}
        </span>

        {/* Edit */}
        <button
          onClick={() => onEdit(task)}
          title="Edit"
          className="text-sm opacity-50 hover:opacity-100 transition-opacity px-1"
        >
          ✏️
        </button>

        {/* Delete */}
        <button
          onClick={() => onDelete(task._id)}
          title="Delete"
          className="text-sm opacity-50 hover:opacity-100 transition-opacity px-1"
        >
          🗑
        </button>

        {/* Expand / Collapse */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-stone-500 font-bold text-base px-1 hover:text-stone-900 transition-colors"
        >
          {expanded ? "∧" : "∨"}
        </button>
      </div>

      {/* Expanded description */}
      {expanded && (
        <div className="px-4 pb-4 pt-1 border-t border-stone-100 ml-10">
          <p className="text-sm text-stone-600 leading-relaxed mt-2">
            {task.description || (
              <em className="text-stone-400">No description provided.</em>
            )}
          </p>
        </div>
      )}
    </div>
  );
}

/**
 * Main
 * Renders the list of filtered tasks or an empty state.
 * Props:
 *  - tasks: Task[]
 *  - showCompleted: boolean — used to show the "Add one?" link only on active tab
 *  - onToggleComplete: (id) => void
 *  - onEdit: (task) => void
 *  - onDelete: (id) => void
 *  - onAddNew: () => void
 */
function Main({
  tasks,
  showCompleted,
  onToggleComplete,
  onEdit,
  onDelete,
  onAddNew,
}) {
  return (
    <main className="flex-1 flex flex-col gap-3">
      {tasks.length === 0 && (
        <div className="text-center text-stone-400 mt-20 text-sm">
          No tasks here.{" "}
          {!showCompleted && (
            <span
              onClick={onAddNew}
              className="text-stone-800 font-semibold underline cursor-pointer"
            >
              Add one?
            </span>
          )}
        </div>
      )}

      {tasks.map((task) => (
        <TaskCard
          key={task._id}
          task={task}
          onToggleComplete={onToggleComplete}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </main>
  );
}

/**
 * Modal
 * Add / Edit task form shown as an overlay.
 * Props:
 *  - isEditing: boolean — true if editing an existing task
 *  - form: { title, description, category, priority }
 *  - onFormChange: (updatedForm) => void
 *  - onSave: () => void
 *  - onClose: () => void
 */
function Modal({ isEditing, form, onFormChange, onSave, onClose }) {
  function update(field, value) {
    onFormChange({ ...form, [field]: value });
  }

  return (
    <div
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl p-7 w-110 flex flex-col gap-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Title */}
        <h2 className="text-xl font-bold text-stone-900">
          {isEditing ? "Edit Task" : "New Task"}
        </h2>

        {/* Title field */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-stone-400 uppercase tracking-widest">
            Title
          </label>
          <input
            className="border border-stone-200 rounded-lg px-3 py-2 text-sm text-stone-800 bg-stone-50 outline-none focus:border-stone-400"
            value={form.title}
            onChange={(e) => update("title", e.target.value)}
            placeholder="Task title..."
          />
        </div>

        {/* Description field */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-stone-400 uppercase tracking-widest">
            Description
          </label>
          <textarea
            className="border border-stone-200 rounded-lg px-3 py-2 text-sm text-stone-800 bg-stone-50 outline-none focus:border-stone-400 resize-y h-20"
            value={form.description}
            onChange={(e) => update("description", e.target.value)}
            placeholder="Task description..."
          />
        </div>

        {/* Category + Priority row */}
        <div className="flex gap-3">
          <div className="flex-1 flex flex-col gap-1">
            <label className="text-xs font-semibold text-stone-400 uppercase tracking-widest">
              Category
            </label>
            <select
              className="border border-stone-200 rounded-lg px-3 py-2 text-sm text-stone-800 bg-stone-50 outline-none"
              value={form.category}
              onChange={(e) => update("category", e.target.value)}
            >
              {CATEGORIES.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </div>

          <div className="flex-1 flex flex-col gap-1">
            <label className="text-xs font-semibold text-stone-400 uppercase tracking-widest">
              Priority
            </label>
            <select
              className="border border-stone-200 rounded-lg px-3 py-2 text-sm text-stone-800 bg-stone-50 outline-none"
              value={form.priority}
              onChange={(e) => update("priority", e.target.value)}
            >
              {Object.entries(PRIORITY).map(([k, v]) => (
                <option key={k} value={k}>
                  {v.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Priority Preview */}
        <PriorityPreview priority={form.priority} />

        {/* Action buttons */}
        <div className="flex justify-end gap-3 mt-1">
          <button
            onClick={onClose}
            className="px-5 py-2 text-sm font-medium border border-stone-200 rounded-xl text-stone-600 hover:bg-stone-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onSave}
            className="px-5 py-2 text-sm font-semibold bg-stone-900 text-white rounded-xl hover:bg-stone-700 transition-colors"
          >
            Save Task
          </button>
        </div>
      </div>
    </div>
  );
}

function PriorityPreview({ priority }) {
  const p = PRIORITY[priority];

  return (
    <div className={`flex items-center gap-2.5 px-4 py-3 rounded-xl ${p.bg}`}>
      <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${p.dot}`} />
      <span className={`text-sm font-semibold ${p.badge.split(" ")[1]}`}>
        {p.label} Priority
      </span>
      <span className="text-xs text-stone-400 ml-1">— {p.hint}</span>
    </div>
  );
}
