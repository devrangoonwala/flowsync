export const config = {
  name: 'WorkflowMonitor',
  type: 'event' as const,
  subscribes: [
    'workflow-created',
    'workflow-execution-completed',
    'workflow-execution-failed',
    'job-completed',
    'job-failed'
  ],
  emits: [],
  flows: ['observability', 'monitoring']
};

export async function handler({ event, logger, state, traceId }) {
  try {
    const eventType = event.type || 'unknown';
    
    logger.debug('Monitoring event received', { eventType });
    
    // Update metrics based on event type
    const metrics = await state.get('default', 'metrics') || {
      workflowsCreated: 0,
      workflowsExecuted: 0,
      workflowsFailed: 0,
      jobsCompleted: 0,
      jobsFailed: 0,
      lastUpdated: new Date().toISOString()
    };
    
    switch (eventType) {
      case 'workflow-created':
        metrics.workflowsCreated = (metrics.workflowsCreated || 0) + 1;
        break;
      case 'workflow-execution-completed':
        metrics.workflowsExecuted = (metrics.workflowsExecuted || 0) + 1;
        break;
      case 'workflow-execution-failed':
        metrics.workflowsFailed = (metrics.workflowsFailed || 0) + 1;
        break;
      case 'job-completed':
        metrics.jobsCompleted = (metrics.jobsCompleted || 0) + 1;
        break;
      case 'job-failed':
        metrics.jobsFailed = (metrics.jobsFailed || 0) + 1;
        break;
    }
    
    metrics.lastUpdated = new Date().toISOString();
    await state.set('default', 'metrics', metrics);
    
    // Store event log for observability
    const eventLogs = await state.get('default', 'event_logs') || [];
    eventLogs.push({
      type: eventType,
      timestamp: new Date().toISOString(),
      data: event
    });
    
    // Keep only last 1000 events
    if (eventLogs.length > 1000) {
      eventLogs.splice(0, eventLogs.length - 1000);
    }
    
    await state.set('default', 'event_logs', eventLogs);
    
    logger.debug('Metrics updated', { eventType, metrics });
  } catch (error: any) {
    const errorMessage = error?.message || error?.toString() || 'Unknown error';
    logger.error('Monitoring failed', { error: errorMessage });
  }
}
