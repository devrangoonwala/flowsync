"""
WorkflowAnalyzer - AI Agent Step
Analyzes workflow structure and provides optimization recommendations
"""

config = {
    'name': 'WorkflowAnalyzer',
    'type': 'event',
    'subscribes': ['workflow-created'],
    'emits': ['workflow-analyzed'],
    'flows': ['ai-agents', 'workflow-optimization']
}

async def handler(event, context):
    """
    Analyzes a workflow and provides recommendations
    """
    logger = context.get('logger')
    state = context.get('state')
    emit = context.get('emit')
    
    try:
        workflow_id = event.get('data', {}).get('workflowId') or event.get('workflowId')
        workflow_name = event.get('data', {}).get('workflowName') or event.get('workflowName')
        
        if logger:
            logger.info(f'Analyzing workflow: {workflow_name} (ID: {workflow_id})')
        
        # Get workflow from state
        workflows = await state.get('default', 'workflows') if state else []
        workflow = None
        if workflows:
            workflow = next((w for w in workflows if w.get('id') == workflow_id), None)
        
        if not workflow:
            if logger:
                logger.warn(f'Workflow not found for analysis: {workflow_id}')
            return
        
        # AI Analysis (simulated - in production, this would use actual AI)
        steps_count = len(workflow.get('steps', []))
        has_parallel_steps = steps_count > 3
        has_ai_steps = any(step.get('type') == 'ai' for step in workflow.get('steps', []))
        
        analysis = {
            'workflowId': workflow_id,
            'workflowName': workflow_name,
            'analyzedAt': __import__('datetime').datetime.utcnow().isoformat(),
            'recommendations': [],
            'complexity': 'low' if steps_count < 3 else 'medium' if steps_count < 6 else 'high',
            'optimizationOpportunities': []
        }
        
        # Generate recommendations
        if steps_count > 5:
            analysis['recommendations'].append({
                'type': 'parallelization',
                'message': 'Consider parallelizing independent steps to improve performance',
                'priority': 'high'
            })
            analysis['optimizationOpportunities'].append('parallel-execution')
        
        if not has_ai_steps and steps_count > 3:
            analysis['recommendations'].append({
                'type': 'ai-enhancement',
                'message': 'Consider adding AI agents for intelligent decision-making',
                'priority': 'medium'
            })
            analysis['optimizationOpportunities'].append('ai-integration')
        
        if steps_count < 2:
            analysis['recommendations'].append({
                'type': 'simplification',
                'message': 'Workflow is very simple - consider adding more steps for better orchestration',
                'priority': 'low'
            })
        
        # Store analysis in state
        if state:
            analyses = await state.get('default', 'workflow_analyses') or []
            analyses.append(analysis)
            await state.set('default', 'workflow_analyses', analyses)
        
        # Emit analysis event
        if emit:
            try:
                await emit({
                    'topic': 'workflow-analyzed',
                    'data': {
                        'workflowId': workflow_id,
                        'analysis': analysis
                    }
                })
            except Exception as e:
                if logger:
                    logger.warn(f'Failed to emit workflow-analyzed event: {str(e)}')
        
        if logger:
            logger.info(f'Workflow analysis completed: {workflow_id}, recommendations: {len(analysis["recommendations"])}')
        
        return analysis
        
    except Exception as e:
        error_msg = str(e) if e else 'Unknown error'
        if logger:
            logger.error(f'Workflow analysis failed: {error_msg}')
        raise

