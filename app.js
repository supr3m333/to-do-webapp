// app.js — Taskr
// Handles task logic, rendering, filtering, and localStorage persistence.

(function () {
  "use strict";

  // ---- State ----

  let tasks = [];
  let currentFilter = "all";

  // ---- DOM references ----

  const taskInput     = document.getElementById("taskInput");
  const prioritySelect = document.getElementById("prioritySelect");
  const addBtn        = document.getElementById("addBtn");
  const taskList      = document.getElementById("taskList");
  const emptyState    = document.getElementById("emptyState");
  const listFooter    = document.getElementById("listFooter");
  const progressBar   = document.getElementById("progressBar");
  const completedCount = document.getElementById("completedCount");
  const totalCount    = document.getElementById("totalCount");
  const remainingLabel = document.getElementById("remainingLabel");
  const clearDoneBtn  = document.getElementById("clearDoneBtn");
  const dateDisplay   = document.getElementById("dateDisplay");
  const filterBtns    = document.querySelectorAll(".filter-btn");

  // ---- Init ----

  function init() {
    loadFromStorage();
    renderDateDisplay();
    renderAll();
    bindEvents();
  }

  // ---- Storage ----

  function loadFromStorage() {
    try {
      const saved = localStorage.getItem("taskr_tasks");
      if (saved) tasks = JSON.parse(saved);
    } catch (e) {
      tasks = [];
    }
  }

  function saveToStorage() {
    localStorage.setItem("taskr_tasks", JSON.stringify(tasks));
  }

  // ---- Task operations ----

  function createTask(text, priority) {
    return {
      id: Date.now().toString(),
      text: text.trim(),
      priority: priority,
      completed: false,
      createdAt: new Date().toISOString(),
    };
  }

  function addTask() {
    const text = taskInput.value.trim();
    if (!text) {
      taskInput.focus();
      taskInput.classList.add("shake");
      setTimeout(() => taskInput.classList.remove("shake"), 400);
      return;
    }

    const task = createTask(text, prioritySelect.value);
    tasks.unshift(task);

    taskInput.value = "";
    prioritySelect.value = "medium";
    taskInput.focus();

    saveToStorage();
    renderAll();
  }

  function toggleTask(id) {
    const task = tasks.find(t => t.id === id);
    if (!task) return;
    task.completed = !task.completed;
    saveToStorage();
    renderAll();
  }

  function deleteTask(id) {
    const el = document.querySelector(`[data-id="${id}"]`);
    if (el) {
      el.classList.add("removing");
      // wait for CSS transition, then remove from array
      setTimeout(() => {
        tasks = tasks.filter(t => t.id !== id);
        saveToStorage();
        renderAll();
      }, 220);
    }
  }

  function clearCompleted() {
    tasks = tasks.filter(t => !t.completed);
    saveToStorage();
    renderAll();
  }

  // ---- Filtering ----

  function getFilteredTasks() {
    switch (currentFilter) {
      case "active":
        return tasks.filter(t => !t.completed);
      case "completed":
        return tasks.filter(t => t.completed);
      case "high":
        return tasks.filter(t => t.priority === "high" && !t.completed);
      default:
        return tasks;
    }
  }

  // ---- Render ----

  function renderAll() {
    renderTasks();
    renderProgress();
    renderFooter();
  }

  function renderTasks() {
    const filtered = getFilteredTasks();

    taskList.innerHTML = "";

    if (filtered.length === 0) {
      emptyState.hidden = false;
    } else {
      emptyState.hidden = true;
      filtered.forEach(task => {
        const li = buildTaskElement(task);
        taskList.appendChild(li);
      });
    }
  }

  function buildTaskElement(task) {
    const li = document.createElement("li");
    li.className = "task-item" + (task.completed ? " completed-item" : "");
    li.setAttribute("data-id", task.id);
    li.setAttribute("data-priority", task.priority);
    li.setAttribute("role", "listitem");

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.className = "task-checkbox";
    checkbox.checked = task.completed;
    checkbox.setAttribute("aria-label", "Mark complete");
    checkbox.addEventListener("change", () => toggleTask(task.id));

    const span = document.createElement("span");
    span.className = "task-text";
    span.textContent = task.text;

    const badge = document.createElement("span");
    badge.className = `priority-badge ${task.priority}`;
    badge.textContent = task.priority;

    const deleteBtn = document.createElement("button");
    deleteBtn.className = "delete-btn";
    deleteBtn.setAttribute("aria-label", "Delete task");
    deleteBtn.textContent = "×";
    deleteBtn.addEventListener("click", () => deleteTask(task.id));

    li.appendChild(checkbox);
    li.appendChild(span);
    li.appendChild(badge);
    li.appendChild(deleteBtn);

    return li;
  }

  function renderProgress() {
    const total = tasks.length;
    const done  = tasks.filter(t => t.completed).length;
    const pct   = total > 0 ? Math.round((done / total) * 100) : 0;

    completedCount.textContent = done;
    totalCount.textContent = total;
    progressBar.style.width = pct + "%";
  }

  function renderFooter() {
    const active  = tasks.filter(t => !t.completed).length;
    const hasDone = tasks.some(t => t.completed);

    if (tasks.length === 0) {
      listFooter.hidden = true;
      return;
    }

    listFooter.hidden = false;
    remainingLabel.textContent = `${active} task${active !== 1 ? "s" : ""} remaining`;
    clearDoneBtn.style.visibility = hasDone ? "visible" : "hidden";
  }

  function renderDateDisplay() {
    const now = new Date();
    const dayNames = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
    const monthNames = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

    const dayName  = dayNames[now.getDay()];
    const monthName = monthNames[now.getMonth()];
    const date = now.getDate();

    dateDisplay.innerHTML = `${dayName}<br>${monthName} ${date}, ${now.getFullYear()}`;
  }

  // ---- Event binding ----

  function bindEvents() {
    addBtn.addEventListener("click", addTask);

    taskInput.addEventListener("keydown", function (e) {
      if (e.key === "Enter") addTask();
    });

    clearDoneBtn.addEventListener("click", clearCompleted);

    filterBtns.forEach(btn => {
      btn.addEventListener("click", function () {
        filterBtns.forEach(b => b.classList.remove("active"));
        this.classList.add("active");
        currentFilter = this.dataset.filter;
        renderTasks();
      });
    });
  }

  // ---- Go ----

  document.addEventListener("DOMContentLoaded", init);

})();
