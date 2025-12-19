// FlowSync Frontend Application
const API_BASE = 'http://localhost:3000';

// State
let workflows = [];
let executions = [];
let metrics = {};

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadData();
    setInterval(loadData, 5000); // Refresh every 5 seconds
});

// API Functions
async function apiCall(endpoint, options = {}) {
    try {
        const response = await fetch(`${API_BASE}${endpoint}`, {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        });
        return await response.json();
    } catch (error) {
        console.error('API Error:', error);
        showAlert('Error connecting to server. Make sure FlowSync is running!', 'error');
        return null;
    }
}

// Load Data
async function loadData() {
    await Promise.all([
        loadWorkflows(),
        loadMetrics()
    ]);
    updateStats();
}

async function loadWorkflows() {
    const data = await apiCall('/workflows');
    if (data && data.success) {
        workflows = data.workflows || [];
        renderWorkflows();
    }
}

async function loadMetrics() {
    const data = await apiCall('/metrics');
    if (data && data.success) {
        metrics = data.metrics || {};
        renderMetrics();
        updateStats();
    }
}

async function loadExecutions() {
    // For now, we'll track executions from workflow executions
    // In a real app, you'd have an endpoint to list all executions
    renderExecutions();
}

// Render Functions
function renderWorkflows() {
    const container = document.getElementById('workflows-list');
    
    if (workflows.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">📝</div>
                <p>No workflows yet. Create your first workflow to get started!</p>
            </div>
        `;
        return;
    }

    container.innerHTML = workflows.map(workflow => `
        <div class="workflow-card">
            <div class="workflow-header">
                <div>
                    <div class="workflow-title">${escapeHtml(workflow.name)}</div>
                    <div class="workflow-description">${escapeHtml(workflow.description || 'No description')}</div>
                </div>
                <span class="status-badge status-${workflow.status || 'active'}">${workflow.status || 'active'}</span>
            </div>
            <div class="workflow-steps">
                <div class="workflow-steps-title">Steps (${workflow.steps?.length || 0})</div>
                ${(workflow.steps || []).map(step => 
                    `<span class="step-badge">${step.id} (${step.type})</span>`
                ).join('')}
            </div>
            <div class="workflow-actions">
                <button class="btn btn-primary btn-small" onclick="openExecuteModal('${workflow.id}')">
                    ▶️ Execute
                </button>
                <button class="btn btn-secondary btn-small" onclick="viewWorkflowDetails('${workflow.id}')">
                    👁️ View
                </button>
            </div>
        </div>
    `).join('');
}

function renderExecutions() {
    const container = document.getElementById('executions-list');
    
    // Get executions from localStorage or state
    const storedExecutions = JSON.parse(localStorage.getItem('executions') || '[]');
    
    if (storedExecutions.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">⚡</div>
                <p>No executions yet. Execute a workflow to see it here!</p>
            </div>
        `;
        return;
    }

    container.innerHTML = storedExecutions.slice(0, 10).map(exec => `
        <div class="execution-card">
            <div class="execution-header">
                <div>
                    <div class="workflow-title">Execution: ${exec.id}</div>
                    <div class="execution-id">Workflow: ${exec.workflowId}</div>
                </div>
                <span class="status-badge status-${exec.status || 'running'}">${exec.status || 'running'}</span>
            </div>
            <div class="execution-details">
                <div class="detail-item">
                    <div class="detail-label">Started</div>
                    <div class="detail-value">${formatDate(exec.startedAt)}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Status</div>
                    <div class="detail-value">${exec.status || 'running'}</div>
                </div>
                ${exec.completedAt ? `
                <div class="detail-item">
                    <div class="detail-label">Completed</div>
                    <div class="detail-value">${formatDate(exec.completedAt)}</div>
                </div>
                ` : ''}
            </div>
            <div class="workflow-actions" style="margin-top: 1rem;">
                <button class="btn btn-secondary btn-small" onclick="viewExecutionDetails('${exec.id}')">
                    View Details
                </button>
            </div>
        </div>
    `).join('');
}

function renderMetrics() {
    const container = document.getElementById('metrics-content');
    
    container.innerHTML = `
        <div class="metrics-grid">
            <div class="metric-item">
                <div class="metric-label">Workflows Created</div>
                <div class="metric-value">${metrics.workflowsCreated || 0}</div>
            </div>
            <div class="metric-item">
                <div class="metric-label">Workflows Executed</div>
                <div class="metric-value">${metrics.workflowsExecuted || 0}</div>
            </div>
            <div class="metric-item">
                <div class="metric-label">Workflows Failed</div>
                <div class="metric-value">${metrics.workflowsFailed || 0}</div>
            </div>
            <div class="metric-item">
                <div class="metric-label">Success Rate</div>
                <div class="metric-value">${metrics.successRate || '0%'}</div>
            </div>
            <div class="metric-item">
                <div class="metric-label">Active Workflows</div>
                <div class="metric-value">${metrics.activeWorkflows || 0}</div>
            </div>
            <div class="metric-item">
                <div class="metric-label">Total Workflows</div>
                <div class="metric-value">${metrics.totalWorkflows || 0}</div>
            </div>
            <div class="metric-item">
                <div class="metric-label">Running Executions</div>
                <div class="metric-value">${metrics.runningExecutions || 0}</div>
            </div>
            <div class="metric-item">
                <div class="metric-label">Total Executions</div>
                <div class="metric-value">${metrics.totalExecutions || 0}</div>
            </div>
            <div class="metric-item">
                <div class="metric-label">Jobs Completed</div>
                <div class="metric-value">${metrics.jobsCompleted || 0}</div>
            </div>
            <div class="metric-item">
                <div class="metric-label">Jobs Failed</div>
                <div class="metric-value">${metrics.jobsFailed || 0}</div>
            </div>
        </div>
        ${metrics.lastUpdated ? `
        <div style="margin-top: 1.5rem; padding-top: 1.5rem; border-top: 1px solid var(--border);">
            <div class="detail-label">Last Updated</div>
            <div class="detail-value">${formatDate(metrics.lastUpdated)}</div>
        </div>
        ` : ''}
    `;
}

function updateStats() {
    document.getElementById('totalWorkflows').textContent = metrics.totalWorkflows || workflows.length || 0;
    document.getElementById('runningExecutions').textContent = metrics.runningExecutions || 0;
    document.getElementById('successRate').textContent = metrics.successRate || '0%';
    document.getElementById('totalExecutions').textContent = metrics.totalExecutions || 0;
}

// Tab Navigation
function showTab(tabName) {
    // Hide all tabs
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });

    // Show selected tab
    document.getElementById(`${tabName}-tab`).classList.add('active');
    event.target.classList.add('active');

    // Load tab-specific data
    if (tabName === 'executions') {
        loadExecutions();
    }
}

// Modal Functions
function showCreateWorkflowModal() {
    document.getElementById('create-modal').classList.add('active');
}

function closeModal() {
    document.getElementById('create-modal').classList.remove('active');
    document.getElementById('workflow-form').reset();
    document.getElementById('steps-container').innerHTML = `
        <div class="step-item">
            <input type="text" placeholder="Step ID (e.g., step-1)" class="step-id" required>
            <select class="step-type" required>
                <option value="">Select type...</option>
                <option value="api">API</option>
                <option value="job">Background Job</option>
                <option value="ai">AI Agent</option>
                <option value="event">Event</option>
                <option value="scheduled">Scheduled</option>
            </select>
            <input type="text" placeholder="Config (JSON)" class="step-config" value="{}">
            <button type="button" class="btn-remove" onclick="removeStep(this)">✕</button>
        </div>
    `;
}

function openExecuteModal(workflowId) {
    document.getElementById('execute-workflow-id').value = workflowId;
    document.getElementById('execute-modal').classList.add('active');
}

function closeExecuteModal() {
    document.getElementById('execute-modal').classList.remove('active');
    document.getElementById('execute-form').reset();
}

// Form Functions
function addStep() {
    const container = document.getElementById('steps-container');
    const stepDiv = document.createElement('div');
    stepDiv.className = 'step-item';
    stepDiv.innerHTML = `
        <input type="text" placeholder="Step ID (e.g., step-1)" class="step-id" required>
        <select class="step-type" required>
            <option value="">Select type...</option>
            <option value="api">API</option>
            <option value="job">Background Job</option>
            <option value="ai">AI Agent</option>
            <option value="event">Event</option>
            <option value="scheduled">Scheduled</option>
        </select>
        <input type="text" placeholder="Config (JSON)" class="step-config" value="{}">
        <button type="button" class="btn-remove" onclick="removeStep(this)">✕</button>
    `;
    container.appendChild(stepDiv);
}

function removeStep(btn) {
    btn.closest('.step-item').remove();
}

async function createWorkflow(event) {
    event.preventDefault();
    
    const name = document.getElementById('workflow-name').value;
    const description = document.getElementById('workflow-description').value;
    const stepItems = document.querySelectorAll('.step-item');
    
    const steps = Array.from(stepItems).map(item => {
        const id = item.querySelector('.step-id').value;
        const type = item.querySelector('.step-type').value;
        let config = {};
        try {
            config = JSON.parse(item.querySelector('.step-config').value || '{}');
        } catch (e) {
            showAlert('Invalid JSON in step config', 'error');
            return null;
        }
        return { id, type, config };
    }).filter(step => step !== null);

    if (steps.length === 0) {
        showAlert('Please add at least one step', 'error');
        return;
    }

    const workflowData = {
        name,
        description,
        steps
    };

    const result = await apiCall('/workflows', {
        method: 'POST',
        body: JSON.stringify(workflowData)
    });

    if (result && result.success) {
        showAlert('Workflow created successfully!', 'success');
        closeModal();
        loadWorkflows();
    } else {
        showAlert(result?.error || 'Failed to create workflow', 'error');
    }
}

async function executeWorkflow(event) {
    event.preventDefault();
    
    const workflowId = document.getElementById('execute-workflow-id').value;
    let input = {};
    
    try {
        input = JSON.parse(document.getElementById('execute-input').value || '{}');
    } catch (e) {
        showAlert('Invalid JSON input', 'error');
        return;
    }

    const result = await apiCall(`/workflows/${workflowId}/execute`, {
        method: 'POST',
        body: JSON.stringify({ input })
    });

    if (result && result.success) {
        showAlert('Workflow execution started!', 'success');
        closeExecuteModal();
        
        // Store execution for display
        const execution = result.execution;
        const stored = JSON.parse(localStorage.getItem('executions') || '[]');
        stored.unshift(execution);
        localStorage.setItem('executions', JSON.stringify(stored.slice(0, 50))); // Keep last 50
        
        // Refresh data
        setTimeout(() => {
            loadData();
            loadExecutions();
            if (document.getElementById('executions-tab').classList.contains('active')) {
                showTab('executions');
            }
        }, 1000);
    } else {
        showAlert(result?.error || 'Failed to execute workflow', 'error');
    }
}

// Utility Functions
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function formatDate(dateString) {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString();
}

function showAlert(message, type = 'success') {
    const alert = document.createElement('div');
    alert.className = `alert alert-${type}`;
    alert.textContent = message;
    alert.style.position = 'fixed';
    alert.style.top = '1rem';
    alert.style.right = '1rem';
    alert.style.zIndex = '10000';
    alert.style.minWidth = '300px';
    
    document.body.appendChild(alert);
    
    setTimeout(() => {
        alert.remove();
    }, 5000);
}

function refreshData() {
    loadData();
    showAlert('Data refreshed!', 'success');
}

function viewWorkflowDetails(workflowId) {
    const workflow = workflows.find(w => w.id === workflowId);
    if (workflow) {
        alert(`Workflow: ${workflow.name}\n\nSteps: ${workflow.steps.length}\nStatus: ${workflow.status}\n\nID: ${workflow.id}`);
    }
}

async function viewExecutionDetails(executionId) {
    const result = await apiCall(`/executions/${executionId}`);
    if (result && result.success) {
        const exec = result.execution;
        const details = `
Execution ID: ${exec.id}
Workflow ID: ${exec.workflowId}
Status: ${exec.status}
Started: ${formatDate(exec.startedAt)}
${exec.completedAt ? `Completed: ${formatDate(exec.completedAt)}` : ''}
${exec.error ? `Error: ${exec.error}` : ''}
        `.trim();
        alert(details);
    } else {
        showAlert('Execution not found', 'error');
    }
}

// Close modal on outside click
window.onclick = function(event) {
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
        if (event.target === modal) {
            modal.classList.remove('active');
        }
    });
}

