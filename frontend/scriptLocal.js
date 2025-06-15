const form = document.getElementById('task-form');
const taskList = document.getElementById('task-list');
const sortSelect = document.getElementById('sort');

let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
let editingTaskId = null; // Track which task is being edited

window.addEventListener('DOMContentLoaded', renderTasks);

form.addEventListener('submit', function (e) {
  e.preventDefault();

  const title = document.getElementById('title').value;
  const description = document.getElementById('description').value;
  const date = document.getElementById('date').value;

  if (editingTaskId) {
    // Update existing task
    const task = tasks.find(t => t.id === editingTaskId);
    if (task) {
      task.title = title;
      task.description = description;
      task.date = date;
      saveTasks();
      renderTasks();
      editingTaskId = null;
      form.querySelector('button[type="submit"]').textContent = "Add Task";
    }
  } else {
    // Add new task
    const task = {
      id: Date.now(),
      title,
      description,
      date,
      status: 'To-Do'
    };
    tasks.push(task);
    saveTasks();
    renderTasks();
  }

  form.reset();
});

sortSelect.addEventListener('change', renderTasks);

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

  // Disable edit if task is done
  if (task.status === 'Done') {
    editBtn.disabled = true;
    editBtn.style.opacity = 0.5;
    editBtn.style.cursor = 'not-allowed';
  }

  // Mark as done / undo
  doneBtn.addEventListener('click', () => {
    task.status = task.status === 'Done' ? 'To-Do' : 'Done';
    saveTasks();
    renderTasks();
  });

  // Edit - load task data into form
  editBtn.addEventListener('click', () => {
    if (editBtn.disabled) return; // Prevent editing if disabled
    document.getElementById('title').value = task.title;
    document.getElementById('description').value = task.description;
    document.getElementById('date').value = task.date;
    editingTaskId = task.id;
    form.querySelector('button[type="submit"]').textContent = "Update Task";
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  // Delete
  deleteBtn.addEventListener('click', () => {
    tasks = tasks.filter(t => t.id !== task.id);
    saveTasks();
    renderTasks();
  });

  taskList.appendChild(taskItem);
}

function saveTasks() {
  localStorage.setItem('tasks', JSON.stringify(tasks));
}
