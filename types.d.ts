/**
 * Type definitions for Motia runtime
 */
import { EventHandler, ApiRouteHandler, ApiResponse, MotiaStream, CronHandler } from 'motia'

declare module 'motia' {
  interface FlowContextStateStreams {
    
  }

  interface Handlers {
    'WorkflowMonitor': EventHandler<never, never>
    'TriggerBackgroundJob': ApiRouteHandler<Record<string, unknown>, unknown, { topic: 'job-trigger'; data: never }>
    'ScheduledMaintenance': CronHandler<never>
    'ListWorkflows': ApiRouteHandler<Record<string, unknown>, unknown, never>
    'JobTriggerHandler': EventHandler<never, never>
    'HealthCheck': ApiRouteHandler<Record<string, unknown>, unknown, never>
    'GetMetrics': ApiRouteHandler<Record<string, unknown>, unknown, never>
    'GetExecutionStatus': ApiRouteHandler<Record<string, unknown>, unknown, never>
    'ExecuteWorkflow': ApiRouteHandler<Record<string, unknown>, unknown, never>
    'CreateWorkflow': ApiRouteHandler<Record<string, unknown>, unknown, { topic: 'workflow-created'; data: never }>
    'BackgroundProcessor': EventHandler<never, { topic: 'job-completed'; data: never } | { topic: 'job-failed'; data: never }>
  }
    
}