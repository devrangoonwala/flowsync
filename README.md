# FlowSync - AI-Powered Multi-Agent Workflow Orchestration Platform

## 🏆 Project Overview

**FlowSync** is a production-grade workflow orchestration platform built on Motia's unified backend runtime. It demonstrates the full power of Motia by combining APIs, background jobs, scheduled tasks, events, streams, states, workflows, and AI agents into a cohesive system with built-in observability.

### What is FlowSync?

FlowSync is a **Workflow Orchestration Platform** that helps you organize and automate complex tasks involving multiple steps. Think of it as a manager that:
- ✅ Keeps track of all workflow steps
- ✅ Ensures steps run in the right order
- ✅ Monitors if something goes wrong
- ✅ Can run multiple workflows simultaneously
- ✅ Shows you what's happening in real-time

### Real-World Analogy

Imagine you're running a coffee shop. Making a perfect latte involves several steps:
1. Grind coffee beans
2. Heat milk
3. Brew espresso
4. Steam milk
5. Combine everything
6. Add latte art

FlowSync is like a manager that orchestrates all these steps, ensures they happen in order, monitors progress, and handles multiple orders simultaneously.

## 🎯 Key Features

### 1. **Workflow Management APIs**
- `POST /workflows` - Create new workflows
- `GET /workflows` - List all workflows with filtering
- `POST /workflows/:id/execute` - Execute workflows asynchronously
- `GET /executions/:id` - Get execution status and results
- `GET /workflows/stream` - Stream real-time workflow data

### 2. **AI Agent Steps (Python)**
- **WorkflowAnalyzer**: Analyzes workflows and provides optimization recommendations
- **WorkflowExecutor**: Coordinates workflow execution across multiple steps
- **WorkflowOptimizer**: Applies optimizations based on analysis results

### 3. **Background Job Processing**
- `POST /jobs` - Trigger background jobs for async processing
- Supports multiple job types: data processing, AI inference, report generation
- Automatic job tracking and state management

### 4. **Scheduled Tasks**
- Automated maintenance tasks (runs every 6 hours)
- Cleanup of old executions and job records
- Maintenance logging and reporting

### 5. **Event-Driven Architecture**
- Workflow creation triggers AI analysis
- Execution events trigger monitoring
- Job completion events update metrics
- All events are logged for observability

### 6. **Streams**
- Real-time data streaming endpoint
- Server-Sent Events support
- Live workflow and execution data

### 7. **Observability & Monitoring**
- `GET /metrics` - Real-time system metrics
- Workflow execution tracking
- Job status monitoring
- Event logging and tracing
- Success rate calculations
- Full observability in Motia Workbench

### 8. **Full-Stack Application**
- Frontend dashboard in `public/` directory
- Real-time updates
- Complete workflow management UI

## 🏗️ Architecture

FlowSync leverages Motia's unified runtime with the following step types:

### API Steps (TypeScript)
- `create-workflow.step.ts` - Create workflows
- `list-workflows.step.ts` - List workflows
- `execute-workflow.step.ts` - Execute workflows
- `get-metrics.step.ts` - Get system metrics
- `get-execution-status.step.ts` - Get execution status
- `trigger-background-job.step.ts` - Trigger background jobs
- `workflow-stream.step.ts` - Stream workflow data
- `health-check.step.ts` - Health check endpoint

### Event Steps (TypeScript)
- `workflow-monitor.step.ts` - Monitor all workflow events
- `job-trigger-handler.step.ts` - Handle job triggers

### AI Agent Steps (Python)
- `workflow-analyzer_step.py` - AI-powered workflow analysis
- `workflow-executor_step.py` - AI agent for workflow execution
- `workflow-optimizer_step.py` - AI agent for workflow optimization

### Background Job Steps (TypeScript)
- `background-processor.step.ts` - Process async background jobs

### Scheduled Steps (TypeScript)
- `scheduled-maintenance.step.ts` - Automated maintenance tasks

## 🤖 Agentic Workflow

FlowSync implements an **agentic workflow** where multiple AI agents work together to analyze, optimize, and execute workflows through Motia's event-driven architecture.

### Agentic Workflow Chain

#### Workflow Creation Flow
```
User creates workflow via API
    ↓
POST /workflows
    ↓
CreateWorkflow step stores workflow
    ↓
Emits: workflow-created event
    ↓
┌─────────────────────────────────────┐
│  WorkflowAnalyzer (AI Agent)        │
│  - Analyzes workflow structure       │
│  - Generates recommendations        │
│  - Emits: workflow-analyzed        │
└─────────────────────────────────────┘
    ↓
┌─────────────────────────────────────┐
│  WorkflowOptimizer (AI Agent)       │
│  - Applies optimizations            │
│  - Updates workflow                 │
│  - Emits: workflow-optimized        │
└─────────────────────────────────────┘
```

#### Workflow Execution Flow
```
User executes workflow via API
    ↓
POST /workflows/:id/execute
    ↓
ExecuteWorkflow step creates execution
    ↓
Emits: workflow-execute event
    ↓
┌─────────────────────────────────────┐
│  WorkflowExecutor (AI Agent)        │
│  - Coordinates step execution        │
│  - Makes intelligent decisions       │
│  - Emits: workflow-execution-completed│
└─────────────────────────────────────┘
```

### AI Agents

1. **WorkflowAnalyzer** - Analyzes workflow complexity, identifies optimization opportunities, generates recommendations
2. **WorkflowOptimizer** - Receives analysis and applies intelligent optimizations to workflows
3. **WorkflowExecutor** - Coordinates workflow execution with AI-powered decision-making

## 📦 Installation & Setup

### Prerequisites
- Node.js (v18+)
- Python (3.8+)
- npm

### Installation

1. **Install Dependencies**
```bash
npm install
pip install -r requirements.txt
```

2. **Start Development Server**
```bash
npm run dev
```

This will start:
- Motia runtime
- Workbench UI at `http://localhost:3000`

3. **Start Full-Stack Application (Optional)**
```bash
./START_FULL_STACK.sh
```

This starts both:
- Backend API at `http://localhost:3000`
- Frontend UI at `http://localhost:8080`

### Access Points

- **Motia Workbench**: http://localhost:3000
- **Frontend Dashboard**: http://localhost:8080 (if using full-stack)
- **API Base URL**: http://localhost:3000

## 🎮 Usage Examples

### Create a Workflow

```bash
curl -X POST http://localhost:3000/workflows \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Data Processing Pipeline",
    "description": "Processes data through multiple stages",
    "steps": [
      {
        "id": "step-1",
        "type": "api",
        "config": {"endpoint": "/process"}
      },
      {
        "id": "step-2",
        "type": "ai",
        "config": {"model": "gpt-4"}
      },
      {
        "id": "step-3",
        "type": "job",
        "config": {"type": "data_processing"}
      }
    ]
  }'
```

**What happens:**
1. Workflow is stored in state
2. `workflow-created` event is emitted
3. **WorkflowAnalyzer** (AI) analyzes the workflow
4. **WorkflowOptimizer** (AI) applies optimizations
5. Workflow is ready for execution

### Execute a Workflow

```bash
curl -X POST http://localhost:3000/workflows/{workflow-id}/execute \
  -H "Content-Type: application/json" \
  -d '{
    "input": {"data": "sample"}
  }'
```

**What happens:**
1. Execution record is created
2. `workflow-execute` event is emitted
3. **WorkflowExecutor** (AI) coordinates step execution
4. Results are stored in state
5. Metrics are updated

### Trigger Background Job

```bash
curl -X POST http://localhost:3000/jobs \
  -H "Content-Type: application/json" \
  -d '{
    "type": "data_processing",
    "data": {"records": 1000},
    "duration": 5000
  }'
```

### Get Metrics

```bash
curl http://localhost:3000/metrics
```

### Stream Workflow Data

```bash
curl http://localhost:3000/workflows/stream
```

## 🎯 Use Cases

### Use Case 1: E-commerce Order Processing

```
Workflow: Process Order
├─ Step 1: Validate payment
├─ Step 2: Check inventory
├─ Step 3: Reserve items
├─ Step 4: Send confirmation email
└─ Step 5: Update inventory
```

**FlowSync Benefits:**
- Ensures all steps complete successfully
- Tracks each order execution
- Handles failures gracefully
- Monitors order processing metrics

### Use Case 2: Content Publishing Pipeline

```
Workflow: Publish Article
├─ Step 1: Validate content
├─ Step 2: Generate preview
├─ Step 3: Run spell check
├─ Step 4: Optimize images
├─ Step 5: Publish to website
└─ Step 6: Share on social media
```

**FlowSync Benefits:**
- AI agents analyze and optimize the publishing workflow
- Background jobs handle image processing
- Event-driven architecture ensures proper sequencing
- Full observability of the publishing process

### Use Case 3: Data Analysis Pipeline

```
Workflow: Weekly Report
├─ Step 1: Collect data from multiple sources
├─ Step 2: Clean and merge data
├─ Step 3: Run analysis (AI agent)
├─ Step 4: Create visualizations
└─ Step 5: Email report to team
```

**FlowSync Benefits:**
- AI agents optimize data processing
- Background jobs handle heavy computation
- Scheduled tasks can trigger weekly reports
- Metrics track report generation success

### Use Case 4: Photo Upload & Processing

```
Workflow: Upload Photo
├─ Step 1: Validate file (API)
├─ Step 2: Resize image (Background Job)
├─ Step 3: Generate thumbnails (Background Job)
├─ Step 4: Store in cloud (API)
├─ Step 5: Update database (API)
└─ Step 6: Send notification (Event)
```

**FlowSync Benefits:**
- Parallel processing of image operations
- Event-driven notifications
- Full tracking of upload process
- Error handling at each step

## 🧪 Testing

### Quick Test

1. **Start the server:**
```bash
npm run dev
```

2. **Test health endpoint:**
```bash
curl http://localhost:3000/health
```

3. **Test creating a workflow:**
```bash
curl -X POST http://localhost:3000/workflows \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Workflow",
    "steps": [{"id": "step1", "type": "api", "config": {}}]
  }'
```

4. **View in Workbench:**
   - Open http://localhost:3000
   - See your workflow
   - Test endpoints interactively
   - View logs and metrics

### Available Endpoints

- `GET /health` - Health check
- `GET /metrics` - System metrics
- `GET /workflows` - List all workflows
- `POST /workflows` - Create a workflow
- `POST /workflows/:id/execute` - Execute a workflow
- `GET /executions/:id` - Get execution status
- `POST /jobs` - Trigger background job
- `GET /workflows/stream` - Stream workflow data

## 📊 Project Statistics

- **Total Steps**: 14
- **API Steps**: 7 (TypeScript)
- **AI Agent Steps**: 3 (Python)
- **Event Steps**: 2 (TypeScript)
- **Background Job Steps**: 1 (TypeScript)
- **Scheduled Steps**: 1 (TypeScript)
- **Stream Steps**: 1 (TypeScript)
- **Languages**: TypeScript + Python (polyglot)

## 🔄 Workflow Lifecycle

1. **Creation**: User creates workflow via API
2. **Analysis**: AI Analyzer agent analyzes workflow structure
3. **Optimization**: AI Optimizer agent suggests improvements
4. **Execution**: User triggers execution via API
5. **Processing**: AI Executor agent coordinates step execution
6. **Monitoring**: Monitor agent tracks all events
7. **Completion**: Results stored in state, metrics updated

## 📈 State Management

FlowSync uses Motia's built-in state management for:

- **Workflows**: All workflow definitions
- **Executions**: Execution history and status
- **Background Jobs**: Job records and results
- **Metrics**: System-wide metrics
- **Analyses**: Workflow analysis results (from AI agents)
- **Optimizations**: Applied optimizations (from AI agents)
- **Event Logs**: Observability event logs
- **Maintenance Logs**: Scheduled maintenance records

## 🔍 Observability Features

- **Real-time Metrics**: Workflow counts, execution rates, success rates
- **Event Logging**: All events logged with timestamps
- **Execution Tracking**: Detailed execution status and results
- **Job Monitoring**: Background job status and results
- **Trace IDs**: Built-in tracing for request tracking
- **Workbench UI**: Visual representation of all workflows and events

## 🛠️ Technology Stack

- **Backend Runtime**: Motia (unified runtime)
- **Languages**: TypeScript (APIs, jobs, events) + Python (AI agents)
- **State Management**: Motia's built-in state
- **Observability**: Motia's built-in logging and tracing
- **Event System**: Motia's event-driven architecture
- **Streams**: Motia's streaming capabilities

## 📝 Project Structure

```
flowsync/
├── steps/
│   ├── create-workflow.step.ts
│   ├── list-workflows.step.ts
│   ├── execute-workflow.step.ts
│   ├── get-metrics.step.ts
│   ├── get-execution-status.step.ts
│   ├── trigger-background-job.step.ts
│   ├── workflow-stream.step.ts
│   ├── workflow-monitor.step.ts
│   ├── job-trigger-handler.step.ts
│   ├── background-processor.step.ts
│   ├── scheduled-maintenance.step.ts
│   ├── health-check.step.ts
│   ├── workflow-analyzer_step.py
│   ├── workflow-executor_step.py
│   └── workflow-optimizer_step.py
├── public/
│   ├── index.html
│   ├── styles.css
│   └── app.js
├── package.json
├── tsconfig.json
├── requirements.txt
├── motia.config.ts
├── START_FULL_STACK.sh
└── README.md
```

## 🎓 Key Motia Features Demonstrated

1. **APIs** ✅ - Multiple REST endpoints
2. **Background Jobs** ✅ - Async job processing
3. **Streams** ✅ - Real-time data streaming
4. **States** ✅ - Comprehensive state management
5. **Workflows** ✅ - Workflow orchestration
6. **Agentic Workflow** ✅ - AI agents chained together
7. **Observability** ✅ - Full observability features
8. **Scheduled Tasks** ✅ - Cron-based automation
9. **Event-Driven** ✅ - Event-based coordination
10. **Polyglot** ✅ - TypeScript + Python

## 🚀 Production Deployment

```bash
npm run build
npm start
```

## 🐛 Troubleshooting

**Server won't start?**
```bash
# Check if port 3000 is in use
lsof -ti:3000 | xargs kill -9

# Then try again
npm run dev
```

**Endpoints return errors?**
- Check server logs in the terminal
- Make sure server is fully started (wait 20-30 seconds)
- Verify all steps are registered

**Can't access Workbench?**
- Make sure server is running
- Try http://localhost:3000 in your browser
- Check firewall settings

## 📄 License

MIT

## 👥 Credits

Built for the Motia Hackathon 2024

---

**Built with ❤️ using Motia's unified backend runtime**
