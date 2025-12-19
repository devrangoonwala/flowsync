export const config = {
  name: 'ScheduledMaintenance',
  type: 'cron' as const,
  cron: '0 */6 * * *', // Every 6 hours
  emits: ['maintenance-completed'],
  flows: ['scheduled-tasks', 'maintenance']
};

export async function handler({ logger, state, emit, traceId }) {
  try {
    logger.info('Running scheduled maintenance task');
    
    // Clean up old executions (older than 7 days)
    const executions = await state.get('default', 'executions') || [];
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const activeExecutions = executions.filter((exec: any) => {
      const execDate = new Date(exec.startedAt || exec.createdAt);
      return execDate > sevenDaysAgo;
    });
    
    const cleanedCount = executions.length - activeExecutions.length;
    await state.set('default', 'executions', activeExecutions);
    
    // Clean up old job records
    const jobs = await state.get('default', 'background_jobs') || [];
    const activeJobs = jobs.filter((job: any) => {
      const jobDate = new Date(job.completedAt || job.createdAt);
      return jobDate > sevenDaysAgo;
    });
    
    const cleanedJobsCount = jobs.length - activeJobs.length;
    await state.set('default', 'background_jobs', activeJobs);
    
    // Generate maintenance report
    const maintenanceReport = {
      timestamp: new Date().toISOString(),
      executionsCleaned: cleanedCount,
      jobsCleaned: cleanedJobsCount,
      activeWorkflows: (await state.get('default', 'workflows') || []).length,
      status: 'success'
    };
    
    // Store maintenance log
    const maintenanceLogs = await state.get('default', 'maintenance_logs') || [];
    maintenanceLogs.push(maintenanceReport);
    await state.set('default', 'maintenance_logs', maintenanceLogs);
    
    // Emit maintenance event
    await emit('maintenance-completed', maintenanceReport);
    
    logger.info('Scheduled maintenance completed', {
      executionsCleaned: cleanedCount,
      jobsCleaned: cleanedJobsCount
    });
    
    return maintenanceReport;
  } catch (error: any) {
    const errorMessage = error?.message || error?.toString() || 'Unknown error';
    logger.error('Scheduled maintenance failed', { error: errorMessage });
    throw error;
  }
}
