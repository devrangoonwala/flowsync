export const config = {
  name: 'ListWorkflows',
  type: 'api' as const,
  path: '/workflows',
  method: 'GET',
  emits: [],
  flows: ['workflow-management']
};

export async function handler(data, { logger, state, traceId }) {
  try {
    logger.info('Fetching all workflows');
    
    const workflows = await state.get('default', 'workflows') || [];
    const status = data.queryParams?.status;
    
    let filteredWorkflows = workflows;
    if (status) {
      filteredWorkflows = workflows.filter((w: any) => w.status === status);
    }
    
    logger.info('Workflows retrieved', { count: filteredWorkflows.length });
    
    return {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
      body: {
        success: true,
        workflows: filteredWorkflows,
        count: filteredWorkflows.length
      }
    };
  } catch (error: any) {
    const errorMessage = error?.message || error?.toString() || 'Unknown error';
    logger.error('Failed to list workflows', { error: errorMessage });
    
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
