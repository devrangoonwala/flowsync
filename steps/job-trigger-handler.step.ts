export const config = {
  name: 'JobTriggerHandler',
  type: 'event' as const,
  subscribes: ['job-trigger'],
  emits: [],
  flows: ['background-jobs', 'async-processing']
};

export async function handler({ event, logger }) {
  try {
    const { jobId, type, data, duration } = event;
    
    logger.info('Processing job trigger', { jobId, type });
    
    // This event handler will trigger the background job processor
    // The actual job processing happens in the BackgroundProcessor step
    // which is configured as a 'job' type step
    
    logger.info('Job trigger processed', { jobId });
  } catch (error: any) {
    const errorMessage = error?.message || error?.toString() || 'Unknown error';
    logger.error('Job trigger handler failed', { error: errorMessage });
  }
}
