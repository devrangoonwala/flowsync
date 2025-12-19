export const config = {
  name: 'BackgroundProcessor',
  type: 'event' as const,
  subscribes: ['job-trigger'],
  emits: ['job-completed', 'job-failed'],
  flows: ['background-jobs', 'async-processing']
};

export async function handler({ event, logger, state, emit, traceId }) {
  try {
    const jobData = event.data || event || {};
    const jobId = event.jobId || jobData.jobId || `job-${Date.now()}`;
    
    logger.info('Processing background job', { jobId, type: jobData.type });
    
    // Simulate async processing
    const processingTime = jobData.duration || 2000;
    await new Promise(resolve => setTimeout(resolve, processingTime));
    
    // Process based on job type
    let result;
    switch (jobData.type) {
      case 'data_processing':
        result = {
          processed: true,
          recordsProcessed: jobData.records || 100,
          message: 'Data processing completed'
        };
        break;
      case 'ai_inference':
        result = {
          processed: true,
          inference: 'AI processing completed',
          confidence: 0.95
        };
        break;
      case 'report_generation':
        result = {
          processed: true,
          reportUrl: `/reports/${jobId}`,
          generatedAt: new Date().toISOString()
        };
        break;
      default:
        result = {
          processed: true,
          message: 'Background job completed'
        };
    }
    
    // Store job result
    const jobs = await state.get('default', 'background_jobs') || [];
    jobs.push({
      jobId,
      type: jobData.type,
      status: 'completed',
      result,
      completedAt: new Date().toISOString()
    });
    await state.set('default', 'background_jobs', jobs);
    
    // Emit completion event
    await emit('job-completed', {
      jobId,
      type: jobData.type,
      result
    });
    
    logger.info('Background job completed', { jobId, type: jobData.type });
    
    return result;
  } catch (error: any) {
    const errorMessage = error?.message || error?.toString() || 'Unknown error';
    logger.error('Background job failed', { error: errorMessage, jobId: event.jobId });
    
    await emit('job-failed', {
      jobId: event.jobId,
      error: errorMessage
    });
    
    throw error;
  }
}
