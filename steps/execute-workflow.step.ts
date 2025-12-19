export const config = {
  name: 'ExecuteWorkflow',
  type: 'api' as const,
  path: '/workflows/:id/execute',
  method: 'POST',
  emits: ['workflow-execute'],
  flows: ['workflow-management']
};

export async function handler(data, { logger, state, emit, traceId }) {
  try {
    const workflowId = data.pathParams?.id || '';
    
    logger.info('Executing workflow', { workflowId });
    
    const workflows = await state.get('default', 'workflows') || [];
    const workflow = workflows.find((w: any) => w.id === workflowId);
    
    if (!workflow) {
      return {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
        body: {
          success: false,
          error: 'Workflow not found'
        }
      };
    }
    
    const body = data.body || {};
    
    // Create execution record
    const executionId = `exec-${Date.now()}`;
    const executions = await state.get('default', 'executions') || [];
    const execution = {
      id: executionId,
      workflowId,
      status: 'running',
      startedAt: new Date().toISOString(),
      input: body
    };
    executions.push(execution);
    await state.set('default', 'executions', executions);
    
    // Emit event to start workflow execution
    await emit('workflow-execute', {
      executionId,
      workflowId,
      workflowName: workflow.name,
      input: body
    });
    
    logger.info('Workflow execution started', { executionId, workflowId });
    
    return {
      status: 202,
      headers: { 'Content-Type': 'application/json' },
      body: {
        success: true,
        execution: {
          id: executionId,
          workflowId,
          status: 'running'
        }
      }
    };
  } catch (error: any) {
    const errorMessage = error?.message || error?.toString() || 'Unknown error';
    logger.error('Failed to execute workflow', { error: errorMessage });
    
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
