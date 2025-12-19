export const config = {
  name: 'GetMetrics',
  type: 'api' as const,
  path: '/metrics',
  method: 'GET',
  emits: [],
  flows: ['observability', 'monitoring']
};

export async function handler(data, { logger, state, traceId }) {
  try {
    logger.info('Fetching system metrics');
    
    const metrics = await state.get('default', 'metrics') || {
      workflowsCreated: 0,
      workflowsExecuted: 0,
      workflowsFailed: 0,
      jobsCompleted: 0,
      jobsFailed: 0,
      lastUpdated: new Date().toISOString()
    };
    
    const workflows = await state.get('default', 'workflows') || [];
    const executions = await state.get('default', 'executions') || [];
    const jobs = await state.get('default', 'background_jobs') || [];
    
    // Calculate additional metrics
    const activeWorkflows = workflows.filter((w: any) => w.status === 'active').length;
    const runningExecutions = executions.filter((e: any) => e.status === 'running').length;
    const successRate = metrics.workflowsExecuted > 0
      ? ((metrics.workflowsExecuted / (metrics.workflowsExecuted + metrics.workflowsFailed)) * 100).toFixed(2)
      : '0.00';
    
    const response = {
      success: true,
      metrics: {
        ...metrics,
        activeWorkflows,
        totalWorkflows: workflows.length,
        runningExecutions,
        totalExecutions: executions.length,
        totalJobs: jobs.length,
        successRate: `${successRate}%`
      },
      timestamp: new Date().toISOString()
    };
    
    logger.info('Metrics retrieved successfully');
    
    return {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
      body: response
    };
  } catch (error: any) {
    const errorMessage = error?.message || error?.toString() || 'Unknown error';
    logger.error('Failed to fetch metrics', { error: errorMessage });
    
    return {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
      body: {
        success: false,
        error: 'Internal server error'
      }
    };
  }
}
