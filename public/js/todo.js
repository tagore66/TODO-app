const BASE_URL = '';
const token = localStorage.getItem('token');


const urlParams = new URLSearchParams(window.location.search);
const tokenFromUrl = urlParams.get('token');

if (tokenFromUrl) {
  localStorage.setItem('token', tokenFromUrl);

  window.history.replaceState({}, document.title, window.location.pathname);
  location.reload();
}

if (!localStorage.getItem('token')) {
  window.location.href = '/';
}

const user = JSON.parse(localStorage.getItem('user') || '{}');
document.getElementById('user-name').textContent = user.name || 'User';


async function checkSubscription() {
  try {
    const res = await fetch(`${BASE_URL}/auth/me`, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
    const userData = await res.json();
    

    if (userData.name) {
      document.getElementById('user-name').textContent = userData.name;
    }



    if (userData.subscription && userData.subscription.isSubscribed) {
      const now = new Date();
      const expiry = new Date(userData.subscription.expiryDate);
      
      if (expiry > now) {
        document.getElementById('premium-badge').classList.remove('hidden');
        document.getElementById('header-premium-btn').classList.add('hidden');
        document.getElementById('subscription-status').classList.remove('hidden');
        document.getElementById('task-limit-info').textContent = 'Unlimited tasks unlocked ✨';
        
        document.getElementById('active-plan').textContent = userData.subscription.plan;
        
        const diffTime = Math.abs(expiry - now);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
        document.getElementById('expiry-date').textContent = `Expires in ${diffDays} days`;
        return true; 
      }
    }
    return false; 
  } catch (err) {
    console.error('Error checking subscription:', err);
    return false;
  }
}
checkSubscription();


const premiumBtn = document.getElementById('header-premium-btn');
if (premiumBtn) {
  premiumBtn.onclick = openSubModal;
}


const subModal = document.getElementById('subscription-modal');
const closeSubBtn = document.getElementById('close-sub-modal');

closeSubBtn.onclick = () => subModal.classList.remove('active');
window.onclick = (event) => {
  if (event.target == subModal) subModal.classList.remove('active');
};

function openSubModal() {
  subModal.classList.add('active');
}


const logoutBtn = document.getElementById('logout-btn');
if (logoutBtn) {
  logoutBtn.addEventListener('click', () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/';
  });
}


async function fetchTodos() {
  try {
    const res = await fetch(`${BASE_URL}/todos`, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
    if (res.status === 401) return logout();
    const todos = await res.json();
    

    const isPro = await checkSubscription();
    if (!isPro) {
      const remaining = Math.max(0, 4 - todos.length);
      document.getElementById('task-limit-info').textContent = `${remaining} complimentary tasks remaining`;
    }

    renderTodos(todos);
  } catch (err) {
    console.error('Error fetching todos:', err);
  }
}

function renderTodos(todos) {
  const list = document.getElementById('todo-list');
  list.innerHTML = '';
  

  const sortedTodos = [...todos].sort((a, b) => {
    const now = new Date().setHours(0,0,0,0);
    const aDeadline = a.deadline ? new Date(a.deadline).getTime() : Infinity;
    const bDeadline = b.deadline ? new Date(b.deadline).getTime() : Infinity;
    
    const aOverdue = !a.completed && aDeadline < now;
    const bOverdue = !b.completed && bDeadline < now;

    if (a.completed !== b.completed) return a.completed ? 1 : -1;
    if (aOverdue !== bOverdue) return aOverdue ? 1 : -1;
    return new Date(b.createdAt) - new Date(a.createdAt);
  });

  let overdueCount = 0;

  sortedTodos.forEach(todo => {
    const now = new Date().setHours(0,0,0,0);
    const deadlineDate = todo.deadline ? new Date(todo.deadline).getTime() : null;
    const isOverdue = !todo.completed && deadlineDate && deadlineDate < now;
    
    if (isOverdue) overdueCount++;

    const li = document.createElement('li');
    li.className = `todo-item ${todo.completed ? 'completed' : ''} ${isOverdue ? 'overdue' : ''}`;
    
    let deadlineHtml = '';
    if (todo.deadline) {
      const date = new Date(todo.deadline);
      deadlineHtml = `<span class="deadline-badge ${isOverdue ? 'deadline-overdue' : ''}">
        ${date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
      </span>`;
      if (isOverdue) {
        deadlineHtml += `<span class="overdue-badge">OVERDUE</span>`;
      }
    }

    const checkbox = document.createElement('div');
    checkbox.className = `checkbox ${todo.completed ? 'checked' : ''}`;
    checkbox.title = todo.completed ? 'Mark as undone?' : 'Mark as done?';
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
  if (!deadline) {
    alert('⚠️ Please mention a deadline for your task!');
    return;
  }

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
    } else if (res.status === 403) {

      openSubModal();
    }
  } catch (err) {
    console.error('Error adding todo:', err);
  }
}


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


document.querySelectorAll('.select-plan-btn').forEach(btn => {
  btn.onclick = () => {
    const plan = btn.parentElement.getAttribute('data-plan');
    processSubscription(plan);
  };
});

async function processSubscription(plan) {
  try {
    const res = await fetch(`${BASE_URL}/auth/create-order`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({ plan })
    });
    
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Order creation failed');

    const options = {
      key: data.key_id,
      amount: data.order.amount,
      currency: "INR",
      name: "Todo App Pro",
      description: `${plan.charAt(0).toUpperCase() + plan.slice(1)} Subscription`,
      order_id: data.order.id,
      handler: async function (response) {

        const verifyRes = await fetch(`${BASE_URL}/auth/verify-payment`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({
            plan,
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature
          })
        });

        const verifyData = await verifyRes.json();
        if (verifyData.success) {
          alert('Welcome to PRO! Your subscription is active.');
          location.reload();
        } else {
          alert('Payment verification failed.');
        }
      },
      theme: { color: "#6366f1" }
    };

    const rzp = new Razorpay(options);
    rzp.open();
  } catch (err) {
    console.error('Payment Error:', err);
    alert(err.message || 'Payment failed to initialize');
  }
}

fetchTodos();
