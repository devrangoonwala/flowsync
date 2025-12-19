export const config = {
  name: 'TriggerBackgroundJob',
  type: 'api' as const,
  path: '/jobs',
  method: 'POST',
  emits: ['job-trigger'],
  flows: ['background-jobs', 'async-processing']
};

export async function handler(data, { logger, emit }) {
  try {
    const { type, data: jobData, duration } = data.body;
    
    if (!type) {
      return {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
        body: {
          success: false,
          error: 'Job type is required'
        }
      };
    }
    
    const jobId = `job-${Date.now()}`;
    
    logger.info('Triggering background job', { jobId, type });
    
    // Emit event to trigger background job
    await emit('job-trigger', {
      jobId,
      type,
      data: jobData || {},
      duration: duration || 2000
    });
    
    return {
      status: 202,
      headers: { 'Content-Type': 'application/json' },
      body: {
        success: true,
        job: {
          id: jobId,
          type,
          status: 'queued'
        }
      }
    };
  } catch (error: any) {
    const errorMessage = error?.message || error?.toString() || 'Unknown error';
    logger.error('Failed to trigger background job', { error: errorMessage });
    
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
