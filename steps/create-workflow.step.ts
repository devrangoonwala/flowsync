import { z } from 'zod';

const WorkflowSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  steps: z.array(z.object({
    id: z.string(),
    type: z.enum(['api', 'event', 'job', 'scheduled', 'ai']),
    config: z.record(z.any())
  })),
  triggers: z.array(z.object({
    type: z.enum(['api', 'schedule', 'event']),
    config: z.record(z.any())
  })).optional()
});

export const config = {
  name: 'CreateWorkflow',
  type: 'api' as const,
  path: '/workflows',
  method: 'POST',
  emits: ['workflow-created'],
  flows: ['workflow-management']
};

export async function handler(data, { logger, state, emit, traceId }) {
  try {
    const body = data.body || {};
    const workflowData = WorkflowSchema.parse(body);
    
    logger.info('Creating new workflow', { name: workflowData.name });
    
    // Store workflow in state (using shared groupId)
    const workflows = await state.get('default', 'workflows') || [];
    const newWorkflow = {
      id: `workflow-${Date.now()}`,
      ...workflowData,
      createdAt: new Date().toISOString(),
      status: 'active'
    };
    
    workflows.push(newWorkflow);
    await state.set('default', 'workflows', workflows);
    
    // Emit event to trigger workflow analysis (non-blocking)
    try {
      await emit({ topic: 'workflow-created', data: {
        workflowId: newWorkflow.id,
        workflowName: newWorkflow.name
      }});
    } catch (emitError: any) {
      // Log but don't fail workflow creation if emit fails
      logger.warn('Failed to emit workflow-created event', { error: emitError?.message || 'Unknown error' });
    }
    
    logger.info('Workflow created successfully', { workflowId: newWorkflow.id });
    
    return {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
      body: {
        success: true,
        workflow: newWorkflow
      }
    };
  } catch (error: any) {
    const errorMessage = error?.message || error?.toString() || 'Unknown error';
    logger.error('Failed to create workflow', { error: errorMessage });
    
    if (error instanceof z.ZodError) {
      return {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
        body: {
          success: false,
          error: 'Validation error',
          details: error.errors
        }
      };
    }
    
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
