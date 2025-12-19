export const config = {
  name: 'HealthCheck',
  type: 'api' as const,
  path: '/health',
  method: 'GET',
  emits: [],
  flows: ['monitoring']
};

export async function handler(data, { logger, state, traceId }) {
  try {
    if (logger) logger.info('Health check requested');
    
    // Get basic system info
    const workflows = (await state?.get('default', 'workflows')) || [];
    const executions = (await state?.get('default', 'executions')) || [];
    const metrics = (await state?.get('default', 'metrics')) || {};
    
    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      system: {
        workflows: Array.isArray(workflows) ? workflows.length : 0,
        executions: Array.isArray(executions) ? executions.length : 0,
        uptime: 'operational'
      },
      metrics: {
        workflowsCreated: metrics?.workflowsCreated || 0,
        workflowsExecuted: metrics?.workflowsExecuted || 0,
        successRate: (metrics?.workflowsExecuted || 0) > 0
          ? (((metrics?.workflowsExecuted || 0) / ((metrics?.workflowsExecuted || 0) + (metrics?.workflowsFailed || 0))) * 100).toFixed(2) + '%'
          : '0%'
      }
    };
    
    return {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
      body: health
    };
  } catch (error: any) {
    const errorMessage = error?.message || String(error) || 'Unknown error';
    if (logger) {
      try {
        logger.error('Health check failed', { error: errorMessage });
      } catch (e) {
        console.error('Health check failed:', errorMessage);
      }
    }
    
    return {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
      body: {
        status: 'unhealthy',
        error: errorMessage,
        timestamp: new Date().toISOString()
      }
    };
  }
}
