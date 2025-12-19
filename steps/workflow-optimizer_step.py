"""
WorkflowOptimizer - AI Agent Step
Applies optimizations based on workflow analysis
"""

def config():
    return {
        'name': 'WorkflowOptimizer',
        'type': 'event',
        'subscribes': ['workflow-analyzed'],
        'emits': ['workflow-optimized'],
        'flows': ['ai-agents', 'workflow-optimization']
    }

async def handler(event, context):
    """
    Applies optimizations to a workflow based on analysis
    """
    logger = context.get('logger')
    state = context.get('state')
    emit = context.get('emit')
    
    try:
        workflow_id = event.get('data', {}).get('workflowId') or event.get('workflowId')
        analysis = event.get('data', {}).get('analysis') or event.get('analysis')
        
        if logger:
            logger.info(f'Optimizing workflow', {'workflowId': workflow_id})
        
        if not analysis:
            if logger:
                logger.warn(f'No analysis data found for optimization: {workflow_id}')
            return
        
        # Get workflow from state
        workflows = await state.get('default', 'workflows') if state else []
        workflow = None
        if workflows:
            workflow = next((w for w in workflows if w.get('id') == workflow_id), None)
        
        if not workflow:
            if logger:
                logger.warn(f'Workflow not found for optimization: {workflow_id}')
            return
        
        # AI-powered optimization
        optimizations_applied = []
        optimization_opportunities = analysis.get('optimizationOpportunities', [])
        
        for opportunity in optimization_opportunities:
            if opportunity == 'parallel-execution':
                # Mark workflow for parallel execution
                optimizations_applied.append({
                    'type': 'parallel-execution',
                    'description': 'Enabled parallel step execution',
                    'impact': 'high'
                })
                if 'optimizations' not in workflow:
                    workflow['optimizations'] = []
                workflow['optimizations'].append('parallel-execution')
            
            elif opportunity == 'ai-integration':
                # Suggest AI agent integration
                optimizations_applied.append({
                    'type': 'ai-integration',
                    'description': 'Recommended AI agent integration for intelligent decision-making',
                    'impact': 'medium'
                })
                if 'optimizations' not in workflow:
                    workflow['optimizations'] = []
                workflow['optimizations'].append('ai-integration')
        
        # Update workflow in state
        if state and optimizations_applied:
            workflows = await state.get('default', 'workflows') or []
            workflow_index = next((i for i, w in enumerate(workflows) if w.get('id') == workflow_id), None)
            if workflow_index is not None:
                workflows[workflow_index] = workflow
                await state.set('default', 'workflows', workflows)
        
        optimization_result = {
            'workflowId': workflow_id,
            'optimizedAt': __import__('datetime').datetime.utcnow().isoformat(),
            'optimizationsApplied': optimizations_applied,
            'optimizationCount': len(optimizations_applied)
        }
        
        # Store optimization in state
        if state:
            optimizations = await state.get('default', 'workflow_optimizations') or []
            optimizations.append(optimization_result)
            await state.set('default', 'workflow_optimizations', optimizations)
        
        # Emit optimization event
        if emit:
            try:
                await emit({
                    'topic': 'workflow-optimized',
                    'data': {
                        'workflowId': workflow_id,
                        'optimization': optimization_result
                    }
                })
            except Exception as e:
                if logger:
                    logger.warn(f'Failed to emit workflow-optimized event: {str(e)}')
        
        if logger:
            logger.info(f'Workflow optimization completed', {
                'workflowId': workflow_id,
                'optimizationsApplied': len(optimizations_applied)
            })
        
        return optimization_result
        
    except Exception as e:
        error_msg = str(e) if e else 'Unknown error'
        if logger:
            logger.error(f'Workflow optimization failed: {error_msg}')
        raise

