/**
 * WorkflowStream - Stream Step
 * Demonstrates Motia streams for real-time workflow data streaming
 */

export const config = {
  name: 'WorkflowStream',
  type: 'api' as const,
  path: '/workflows/stream',
  method: 'GET',
  emits: [],
  flows: ['streaming', 'observability']
};

export async function handler(data, { logger, state, traceId }) {
  try {
    logger?.info('Streaming workflow data');
    
    // Get workflows from state
    const workflows = await state.get('default', 'workflows') || [];
    const executions = await state.get('default', 'executions') || [];
    const metrics = await state.get('default', 'metrics') || {};
    
    // Stream data as Server-Sent Events (SSE)
    // In a real implementation, this would use Motia's stream API
    // For now, we return a JSON response that represents streamed data
    
    const streamData = {
      workflows: workflows.map((w: any) => ({
        id: w.id,
        name: w.name,
        status: w.status,
        stepCount: w.steps?.length || 0
      })),
      executions: executions.slice(-10).map((e: any) => ({
        id: e.id,
        workflowId: e.workflowId,
        status: e.status,
        startedAt: e.startedAt
      })),
      metrics: {
        totalWorkflows: workflows.length,
        activeExecutions: executions.filter((e: any) => e.status === 'running').length,
        completedExecutions: executions.filter((e: any) => e.status === 'completed').length,
        ...metrics
      },
      timestamp: new Date().toISOString()
    };
    
    // Return as JSON (in production, this would be a proper SSE stream)
    return {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive'
      },
      body: {
        success: true,
        stream: streamData,
        message: 'Stream data (in production, this would be Server-Sent Events)'
      }
    };
  } catch (error: any) {
    const errorMessage = error?.message || error?.toString() || 'Unknown error';
    logger?.error('Failed to stream workflow data', { error: errorMessage });
    
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

