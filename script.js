// DOM Elements
const todoInput = document.getElementById('todoInput');
const addBtn = document.getElementById('addBtn');
const todoList = document.getElementById('todoList');
const emptyState = document.getElementById('emptyState');
const filterBtns = document.querySelectorAll('.filter-btn');
const clearCompletedBtn = document.getElementById('clearCompleted');
const clearAllBtn = document.getElementById('clearAll');
const totalCount = document.getElementById('totalCount');
const activeCount = document.getElementById('activeCount');
const completedCount = document.getElementById('completedCount');

// State
let todos = [];
let currentFilter = 'all';

// LocalStorage Keys
const STORAGE_KEY = 'todos';

// Initialize App
function init() {
    loadTodos();
    renderTodos();
    updateStats();
    setupEventListeners();
}

// Setup Event Listeners
function setupEventListeners() {
    addBtn.addEventListener('click', addTodo);
    todoInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') addTodo();
    });
    clearCompletedBtn.addEventListener('click', clearCompleted);
    clearAllBtn.addEventListener('click', clearAll);
    filterBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            filterBtns.forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            currentFilter = e.target.dataset.filter;
            renderTodos();
        });
    });
}

// Add Todo
function addTodo() {
    const text = todoInput.value.trim();
    
    if (!text) {
        alert('Please enter a task!');
        return;
    }

    const todo = {
        id: Date.now(),
        text: text,
        completed: false,
        createdAt: new Date().toLocaleString()
    };

    todos.push(todo);
    saveTodos();
    renderTodos();
    updateStats();
    todoInput.value = '';
    todoInput.focus();
}

// Delete Todo
function deleteTodo(id) {
    todos = todos.filter(todo => todo.id !== id);
    saveTodos();
    renderTodos();
    updateStats();
}

// Toggle Todo Complete
function toggleTodo(id) {
    todos = todos.map(todo => 
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
    );
    saveTodos();
    renderTodos();
    updateStats();
}

// Clear Completed Todos
function clearCompleted() {
    const completedTodos = todos.filter(todo => todo.completed);
    if (completedTodos.length === 0) {
        alert('No completed tasks to clear!');
        return;
    }
    
    if (confirm(`Delete ${completedTodos.length} completed task(s)?`)) {
        todos = todos.filter(todo => !todo.completed);
        saveTodos();
        renderTodos();
        updateStats();
    }
}

// Clear All Todos
function clearAll() {
    if (todos.length === 0) {
        alert('No tasks to clear!');
        return;
    }
    
    if (confirm('Delete ALL tasks? This cannot be undone!')) {
        todos = [];
        saveTodos();
        renderTodos();
        updateStats();
    }
}

// Render Todos
function renderTodos() {
    todoList.innerHTML = '';
    
    let filteredTodos = todos;
    
    if (currentFilter === 'active') {
        filteredTodos = todos.filter(todo => !todo.completed);
    } else if (currentFilter === 'completed') {
        filteredTodos = todos.filter(todo => todo.completed);
    }

    if (filteredTodos.length === 0) {
        emptyState.classList.add('show');
        return;
    }

    emptyState.classList.remove('show');

    filteredTodos.forEach(todo => {
        const li = document.createElement('li');
        li.className = `todo-item ${todo.completed ? 'completed' : ''}`;
        li.innerHTML = `
            <input 
                type="checkbox" 
                class="checkbox" 
                ${todo.completed ? 'checked' : ''}
                onchange="toggleTodo(${todo.id})"
            >
            <span class="todo-text">${escapeHtml(todo.text)}</span>
            <button class="delete-btn" onclick="deleteTodo(${todo.id})">Delete</button>
        `;
        todoList.appendChild(li);
    });
}

// Update Stats
function updateStats() {
    const total = todos.length;
    const active = todos.filter(todo => !todo.completed).length;
    const completed = todos.filter(todo => todo.completed).length;

    totalCount.textContent = total;
    activeCount.textContent = active;
    completedCount.textContent = completed;
}

// Save Todos to LocalStorage
function saveTodos() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
}

// Load Todos from LocalStorage
function loadTodos() {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
        try {
            todos = JSON.parse(stored);
        } catch (e) {
            console.error('Error loading todos:', e);
            todos = [];
        }
    }
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', init);
