const form = document.getElementById('task-form');
const taskList = document.getElementById('task-list');
const sortSelect = document.getElementById('sort');

const API_URL = 'http://localhost:8080/api/tasks'; // Change this to your friend's backend URL

let tasks = [];
let editingTaskId = null;

window.addEventListener('DOMContentLoaded', fetchTasks);

form.addEventListener('submit', async function (e) {
  e.preventDefault();

  const title = document.getElementById('title').value;
  const description = document.getElementById('description').value;
  const date = document.getElementById('date').value;

  const taskData = {
    title,
    description,
    date,
    status: 'To-Do'
  };

  if (editingTaskId) {
    // Update task
    await fetch(`${API_URL}/${editingTaskId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...taskData, id: editingTaskId })
    });
    editingTaskId = null;
    form.querySelector('button[type="submit"]').textContent = "Add Task";
  } else {
    // Create task
    await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(taskData)
    });
  }

  form.reset();
  fetchTasks();
});

sortSelect.addEventListener('change', renderTasks);

async function fetchTasks() {
  const res = await fetch(API_URL);
  tasks = await res.json();
  renderTasks();
}

function renderTasks() {
  taskList.innerHTML = '';

  let sortedTasks = [...tasks];
  const sortBy = sortSelect.value;

  if (sortBy === 'newest') {
    sortedTasks.sort((a, b) => new Date(b.date) - new Date(a.date));
  } else if (sortBy === 'oldest') {
    sortedTasks.sort((a, b) => new Date(a.date) - new Date(b.date));
  } else if (sortBy === 'created') {
    sortedTasks.sort((a, b) => b.id - a.id);
  }

  sortedTasks.forEach(task => renderTask(task));
}

function renderTask(task) {
  const taskItem = document.createElement('li');
  taskItem.classList.add('task');
  if (task.status === 'Done') taskItem.classList.add('done');

  taskItem.innerHTML = `
    <h3>${task.title}</h3>
    <p>${task.description}</p>
    <p><strong>Due:</strong> ${task.date}</p>
    <p><strong>Status:</strong> <span class="status">${task.status}</span></p>
    <button class="done-btn">${task.status === 'Done' ? 'Undo' : 'Mark as Done'}</button>
    <button class="edit-btn">Edit</button>
    <button class="delete-btn">Delete</button>
  `;

  const doneBtn = taskItem.querySelector('.done-btn');
  const editBtn = taskItem.querySelector('.edit-btn');
  const deleteBtn = taskItem.querySelector('.delete-btn');

  if (task.status === 'Done') {
    editBtn.disabled = true;
    editBtn.style.opacity = 0.5;
    editBtn.style.cursor = 'not-allowed';
  }

  doneBtn.addEventListener('click', async () => {
    const newStatus = task.status === 'Done' ? 'To-Do' : 'Done';
    await fetch(`${API_URL}/${task.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...task, status: newStatus })
    });
    fetchTasks();
  });

  editBtn.addEventListener('click', () => {
    if (editBtn.disabled) return;
    document.getElementById('title').value = task.title;
    document.getElementById('description').value = task.description;
    document.getElementById('date').value = task.date;
    editingTaskId = task.id;
    form.querySelector('button[type="submit"]').textContent = "Update Task";
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  deleteBtn.addEventListener('click', async () => {
    await fetch(`${API_URL}/${task.id}`, {
      method: 'DELETE'
    });
    fetchTasks();
  });

  taskList.appendChild(taskItem);
}
