import { useState } from "react";

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

const initialTasks = [
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

let nextId = 5;

export default function TodoApp() {
  const [tasks, setTasks] = useState(initialTasks);
  const [selectedCat, setSelectedCat] = useState("All");
  const [showCompleted, setShowCompleted] = useState(false);
  const [expandedId, setExpandedId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "Maths",
    priority: "medium",
  });

  const filtered = tasks.filter((t) => {
    const catOk = selectedCat === "All" || t.category === selectedCat;
    const compOk = showCompleted ? t.completed : !t.completed;
    return catOk && compOk;
  });

  const completedCount = tasks.filter((t) => t.completed).length;

  function toggleComplete(id) {
    setTasks(
      tasks.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)),
    );
  }

  function deleteTask(id) {
    setTasks(tasks.filter((t) => t.id !== id));
    if (expandedId === id) setExpandedId(null);
  }

  function openEdit(task) {
    setEditingTask(task);
    setForm({
      title: task.title,
      description: task.description,
      category: task.category,
      priority: task.priority,
    });
    setShowForm(true);
  }

  function openNew() {
    setEditingTask(null);
    setForm({
      title: "",
      description: "",
      category: "Maths",
      priority: "medium",
    });
    setShowForm(true);
  }

  function saveForm() {
    if (!form.title.trim()) return;
    if (editingTask) {
      setTasks(
        tasks.map((t) => (t.id === editingTask.id ? { ...t, ...form } : t)),
      );
    } else {
      setTasks([...tasks, { id: nextId++, ...form, completed: false }]);
    }
    setShowForm(false);
  }

  return (
    <div className="min-h-screen bg-stone-100 p-6">
      <link
        href="https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=DM+Sans:wght@300;400;500;600&display=swap"
        rel="stylesheet"
      />
      <Priority />

      <div className="flex gap-5 max-w-5xl mx-auto">
        {/* Sidebar */}
        <aside className="w-48 shrink-0 bg-white rounded-2xl shadow-sm p-4 flex flex-col gap-1 h-fit">
          <div className="flex items-center justify-between mb-3">
            <span className="text-base font-semibold text-stone-800">
              📋 ToDoList
            </span>
            <button
              onClick={openNew}
              className="w-7 h-7 bg-stone-900 text-white rounded-lg text-lg flex items-center justify-center hover:bg-stone-700 transition-colors leading-none"
            >
              +
            </button>
          </div>

          <p className="text-xs font-semibold tracking-widest text-stone-400 uppercase mb-1">
            Category
          </p>

          {["All", ...CATEGORIES].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCat(cat)}
              className={`text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedCat === cat
                  ? "bg-stone-900 text-white"
                  : "text-stone-600 hover:bg-stone-100"
              }`}
            >
              {cat}
            </button>
          ))}

          <button
            onClick={() => setShowCompleted(!showCompleted)}
            className={`mt-4 text-left px-3 py-2 rounded-lg text-sm font-medium border transition-colors ${
              showCompleted
                ? "bg-stone-900 text-white border-stone-900"
                : "border-stone-200 text-stone-500 hover:bg-stone-50"
            }`}
          >
            ✓ Completed ({completedCount})
          </button>
        </aside>

        {/* Main */}
        <main className="flex-1 flex flex-col gap-3">
          {filtered.length === 0 && (
            <div className="text-center text-stone-400 mt-20 text-sm">
              No tasks here.{" "}
              {!showCompleted && (
                <span
                  onClick={openNew}
                  className="text-stone-800 font-semibold underline cursor-pointer"
                >
                  Add one?
                </span>
              )}
            </div>
          )}

          {filtered.map((task) => {
            const p = PRIORITY[task.priority];
            const expanded = expandedId === task.id;
            return (
              <div
                key={task.id}
                className={`bg-white rounded-xl shadow-sm border-l-4 overflow-hidden transition-all ${p.border} ${expanded ? p.bg : ""} ${task.completed ? "opacity-60" : ""}`}
              >
                <div className="flex items-center gap-3 px-4 py-3.5">
                  <input
                    type="checkbox"
                    checked={task.completed}
                    onChange={() => toggleComplete(task.id)}
                    className="w-4 h-4 cursor-pointer accent-stone-800 shrink-0"
                  />
                  <span
                    className={`flex-1 text-sm font-medium text-stone-800 ${task.completed ? "line-through" : ""}`}
                  >
                    {task.title}
                  </span>
                  <span
                    className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${p.badge}`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${p.dot}`} />
                    {p.label}
                  </span>
                  <span className="text-xs text-stone-500 bg-stone-100 px-2.5 py-1 rounded-full">
                    {task.category}
                  </span>
                  <button
                    onClick={() => openEdit(task)}
                    className="text-sm opacity-50 hover:opacity-100 transition-opacity px-1"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => deleteTask(task.id)}
                    className="text-sm opacity-50 hover:opacity-100 transition-opacity px-1"
                  >
                    🗑
                  </button>
                  <button
                    onClick={() => setExpandedId(expanded ? null : task.id)}
                    className="text-stone-500 font-bold text-base px-1 hover:text-stone-900 transition-colors"
                  >
                    {expanded ? "∧" : "∨"}
                  </button>
                </div>

                {expanded && (
                  <div className="px-4 pb-4 pt-1 border-t border-stone-100 ml-10">
                    <p className="text-sm text-stone-600 leading-relaxed mt-2">
                      {task.description || (
                        <em className="text-stone-400">
                          No description provided.
                        </em>
                      )}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </main>
      </div>

      {/* Modal */}
      {showForm && (
        <div
          className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
          onClick={() => setShowForm(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl p-7 w-110 flex flex-col gap-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-bold text-stone-900">
              {editingTask ? "Edit Task" : "New Task"}
            </h2>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-stone-400 uppercase tracking-widest">
                Title
              </label>
              <input
                className="border border-stone-200 rounded-lg px-3 py-2 text-sm text-stone-800 bg-stone-50 outline-none focus:border-stone-400"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="Task title..."
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-stone-400 uppercase tracking-widest">
                Description
              </label>
              <textarea
                className="border border-stone-200 rounded-lg px-3 py-2 text-sm text-stone-800 bg-stone-50 outline-none focus:border-stone-400 resize-y h-20"
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
                placeholder="Task description..."
              />
            </div>

            <div className="flex gap-3">
              <div className="flex-1 flex flex-col gap-1">
                <label className="text-xs font-semibold text-stone-400 uppercase tracking-widest">
                  Category
                </label>
                <select
                  className="border border-stone-200 rounded-lg px-3 py-2 text-sm text-stone-800 bg-stone-50 outline-none"
                  value={form.category}
                  onChange={(e) =>
                    setForm({ ...form, category: e.target.value })
                  }
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
                  onChange={(e) =>
                    setForm({ ...form, priority: e.target.value })
                  }
                >
                  {Object.entries(PRIORITY).map(([k, v]) => (
                    <option key={k} value={k}>
                      {v.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Priority preview */}
            <div
              className={`flex items-center gap-2.5 px-4 py-3 rounded-xl ${PRIORITY[form.priority].bg}`}
            >
              <span
                className={`w-2.5 h-2.5 rounded-full shrink-0 ${PRIORITY[form.priority].dot}`}
              />
              <span
                className={`text-sm font-semibold ${PRIORITY[form.priority].badge.split(" ")[1]}`}
              >
                {PRIORITY[form.priority].label} Priority
              </span>
              <span className="text-xs text-stone-400 ml-1">
                — {PRIORITY[form.priority].hint}
              </span>
            </div>

            <div className="flex justify-end gap-3 mt-1">
              <button
                onClick={() => setShowForm(false)}
                className="px-5 py-2 text-sm font-medium border border-stone-200 rounded-xl text-stone-600 hover:bg-stone-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={saveForm}
                className="px-5 py-2 text-sm font-semibold bg-stone-900 text-white rounded-xl hover:bg-stone-700 transition-colors"
              >
                Save Task
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Priority() {
  return (
    <div className="flex flex-wrap gap-4 mb-5 bg-white rounded-xl px-5 py-3 w-fit shadow-sm">
      <span className="text-xs font-semibold text-stone-400 uppercase tracking-widest self-center mr-1">
        Priority:
      </span>
      {Object.entries(PRIORITY).map(([k, v]) => (
        <span
          key={k}
          className="flex items-center gap-1.5 text-sm font-medium text-stone-600"
        >
          <span className={`w-2.5 h-2.5 rounded-full ${v.dot}`} />
          {v.label}
          <span className="text-stone-400 text-xs">— {v.hint}</span>
        </span>
      ))}
    </div>
  );
}

function Sidebar({
  openNew,
  setSelectedCat,
  setShowCompleted,
  showCompleted,
  completedCount,
  selectedCat,
}) {
  return (
    <aside className="w-48 shrink-0 bg-white rounded-2xl shadow-sm p-4 flex flex-col gap-1 h-fit">
      <div className="flex items-center justify-between mb-3">
        <span className="text-base font-semibold text-stone-800">
          📋 ToDoList
        </span>
        <button
          onClick={openNew}
          className="w-7 h-7 bg-stone-900 text-white rounded-lg text-lg flex items-center justify-center hover:bg-stone-700 transition-colors leading-none"
        >
          +
        </button>
      </div>

      <p className="text-xs font-semibold tracking-widest text-stone-400 uppercase mb-1">
        Category
      </p>

      {["All", ...CATEGORIES].map((cat) => (
        <button
          key={cat}
          onClick={() => setSelectedCat(cat)}
          className={`text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
            selectedCat === cat
              ? "bg-stone-900 text-white"
              : "text-stone-600 hover:bg-stone-100"
          }`}
        >
          {cat}
        </button>
      ))}

      <button
        onClick={() => setShowCompleted(!showCompleted)}
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
