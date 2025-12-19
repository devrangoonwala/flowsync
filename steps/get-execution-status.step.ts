export const config = {
  name: 'GetExecutionStatus',
  type: 'api' as const,
  path: '/executions/:id',
  method: 'GET',
  emits: [],
  flows: ['workflow-management', 'observability']
};

export async function handler(data, { logger, state, traceId }) {
  try {
    const executionId = data.pathParams?.id || '';
    
    logger.info('Fetching execution status', { executionId });
    
    const executions = await state.get('default', 'executions') || [];
    const execution = executions.find((e: any) => e.id === executionId);
    
    if (!execution) {
      return {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
        body: {
          success: false,
          error: 'Execution not found'
        }
      };
    }
    
    // Get workflow details
    const workflows = await state.get('default', 'workflows') || [];
    const workflow = workflows.find((w: any) => w.id === execution.workflowId);
    
    const response = {
      success: true,
      execution: {
        ...execution,
        workflow: workflow ? {
          id: workflow.id,
          name: workflow.name,
          description: workflow.description
        } : null
      }
    };
    
    logger.info('Execution status retrieved', { executionId, status: execution.status });
    
    return {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
      body: response
    };
  } catch (error: any) {
    const errorMessage = error?.message || error?.toString() || 'Unknown error';
    logger.error('Failed to fetch execution status', { error: errorMessage });
    
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
