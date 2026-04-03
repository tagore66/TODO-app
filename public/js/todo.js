const BASE_URL = '';
const token = localStorage.getItem('token');

// Redirect if not logged in
const urlParams = new URLSearchParams(window.location.search);
const tokenFromUrl = urlParams.get('token');

if (tokenFromUrl) {
  localStorage.setItem('token', tokenFromUrl);
  // Clean URL
  window.history.replaceState({}, document.title, window.location.pathname);
  location.reload();
}

if (!localStorage.getItem('token')) {
  window.location.href = '/';
}

const user = JSON.parse(localStorage.getItem('user') || '{}');
document.getElementById('user-name').textContent = user.name || 'User';

// Logout
document.getElementById('logout-btn').addEventListener('click', () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = '/';
});

// Fetch Todos
async function fetchTodos() {
  try {
    const res = await fetch(`${BASE_URL}/todos`, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
    if (res.status === 401) return logout();
    const todos = await res.json();
    console.log('Fetched Todos:', todos);
    renderTodos(todos);
  } catch (err) {
    console.error('Error fetching todos:', err);
  }
}

function renderTodos(todos) {
  const list = document.getElementById('todo-list');
  list.innerHTML = '';
  todos.forEach(todo => {
    const li = document.createElement('li');
    li.className = `todo-item ${todo.completed ? 'completed' : ''}`;
    
    let deadlineHtml = '';
    if (todo.deadline) {
      const date = new Date(todo.deadline);
      const isOverdue = !todo.completed && date < new Date().setHours(0,0,0,0);
      deadlineHtml = `<span class="deadline-badge ${isOverdue ? 'deadline-overdue' : ''}">
        ${date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
      </span>`;
    }

    const checkbox = document.createElement('div');
    checkbox.className = `checkbox ${todo.completed ? 'checked' : ''}`;
    checkbox.onclick = () => window.toggleTodo(todo._id, todo.completed);

    const span = document.createElement('span');
    span.innerHTML = `${todo.task} ${deadlineHtml}`;

    const delBtn = document.createElement('button');
    delBtn.className = 'delete-btn';
    delBtn.title = 'Delete Task';
    delBtn.innerHTML = `
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="3 6 5 6 21 6"></polyline>
        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
        <line x1="10" y1="11" x2="10" y2="17"></line>
        <line x1="14" y1="11" x2="14" y2="17"></line>
      </svg>
    `;
    delBtn.onclick = () => window.deleteTodo(todo._id);

    li.appendChild(checkbox);
    li.appendChild(span);
    li.appendChild(delBtn);
    list.appendChild(li);
  });
}

// Add Todo
document.getElementById('add-todo-btn').addEventListener('click', addTodo);
document.getElementById('todo-input').addEventListener('keypress', (e) => {
  if (e.key === 'Enter') addTodo();
});

async function addTodo() {
  const input = document.getElementById('todo-input');
  const deadlineInput = document.getElementById('todo-deadline');
  const task = input.value.trim();
  const deadline = deadlineInput.value;
  if (!task) return;

  try {
    const res = await fetch(`${BASE_URL}/todos`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({ task, deadline })
    });
    if (res.ok) {
      input.value = '';
      deadlineInput.value = '';
      fetchTodos();
    }
  } catch (err) {
    console.error('Error adding todo:', err);
  }
}

// Toggle Todo
window.toggleTodo = async (id, completed) => {
  try {
    const res = await fetch(`${BASE_URL}/todos/${id}`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({ completed: !completed })
    });
    if (res.ok) fetchTodos();
  } catch (err) {
    console.error('Error toggling todo:', err);
  }
};

let todoToDelete = null;

// Delete Todo
window.deleteTodo = (id) => {
  todoToDelete = id;
  document.getElementById('confirm-modal').classList.add('active');
};

document.getElementById('cancel-delete').addEventListener('click', () => {
  document.getElementById('confirm-modal').classList.remove('active');
  todoToDelete = null;
});

document.getElementById('confirm-delete').addEventListener('click', async () => {
  if (!todoToDelete) return;
  try {
    const res = await fetch(`${BASE_URL}/todos/${todoToDelete}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
    if (res.ok) {
      fetchTodos();
    } else {
      const data = await res.json();
      alert(data.message || 'Failed to delete task');
    }
  } catch (err) {
    console.error('Error deleting todo:', err);
    alert('Something went wrong while deleting');
  } finally {
    document.getElementById('confirm-modal').classList.remove('active');
    todoToDelete = null;
  }
});

function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = '/';
}

fetchTodos();
