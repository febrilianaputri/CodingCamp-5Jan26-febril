const form = document.getElementById("todo-form");
const todoInput = document.getElementById("todo-input");
const dateInput = document.getElementById("date-input");
const todoList = document.getElementById("todo-list");
const filterButtons = document.querySelectorAll(".filter button");
const searchInput = document.getElementById("search-input");

const totalCount = document.getElementById("total-count");
const pendingCount = document.getElementById("pending-count");
const completedCount = document.getElementById("completed-count");
const overdueCount = document.getElementById("overdue-count");

let todos = JSON.parse(localStorage.getItem("todos")) || [];
let currentFilter = "all";

form.addEventListener("submit", e => {
  e.preventDefault();

  if (!todoInput.value || !dateInput.value) {
    alert("Fill all fields");
    return;
  }

  todos.push({
    id: Date.now(),
    text: todoInput.value.trim(),
    date: dateInput.value,
    completed: false
  });

  saveAndRender();
  form.reset();
});

function saveAndRender() {
  localStorage.setItem("todos", JSON.stringify(todos));
  renderTodos();
  updateDashboard();
}

function renderTodos() {
  todoList.innerHTML = "";

  let filtered = [...todos];

  if (currentFilter === "pending") {
    filtered = filtered.filter(t => !t.completed);
  }

  if (currentFilter === "completed") {
    filtered = filtered.filter(t => t.completed);
  }

  if (searchInput.value) {
    filtered = filtered.filter(t =>
      t.text.toLowerCase().includes(searchInput.value.toLowerCase())
    );
  }

  filtered.forEach(todo => {
    const li = document.createElement("li");
    li.className = todo.completed ? "completed" : "";

    li.innerHTML = `
      <label class="task-info">
        <input type="checkbox" ${todo.completed ? "checked" : ""}>
        <div>
          ${todo.text}
          <span>${todo.date}</span>
        </div>
      </label>
      <span class="edit">✏️</span>
      <span class="delete">✖</span>
    `;

    li.querySelector("input").onchange = () => toggleComplete(todo.id);
    li.querySelector(".delete").onclick = () => deleteTodo(todo.id);
    li.querySelector(".edit").onclick = () => editTodo(todo.id);

    todoList.appendChild(li);
  });
}

function updateDashboard() {
  const today = new Date();

  totalCount.textContent = todos.length;
  completedCount.textContent = todos.filter(t => t.completed).length;
  pendingCount.textContent = todos.filter(t => !t.completed).length;
  overdueCount.textContent = todos.filter(
    t => !t.completed && new Date(t.date) < today
  ).length;
}

function toggleComplete(id) {
  todos = todos.map(t =>
    t.id === id ? { ...t, completed: !t.completed } : t
  );
  saveAndRender();
}

function deleteTodo(id) {
  todos = todos.filter(t => t.id !== id);
  saveAndRender();
}

function editTodo(id) {
  const todo = todos.find(t => t.id === id);
  const newText = prompt("Edit task", todo.text);
  if (newText) {
    todo.text = newText.trim();
    saveAndRender();
  }
}

filterButtons.forEach(btn => {
  btn.onclick = () => {
    currentFilter = btn.dataset.filter;
    filterButtons.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    renderTodos();
  };
});

searchInput.oninput = renderTodos;

document.getElementById("theme-toggle").onclick = () =>
  document.body.classList.toggle("dark");

renderTodos();
updateDashboard();
