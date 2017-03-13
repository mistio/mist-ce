# Fields that make up a story.
# Event fields that should be explicitly present in a story must be added here.
FIELDS = (
    'user_id',
    'owner_id',
    'cloud_id',
    'machine_id',
    'script_id',
    'rule_id',
    'stack_id',
    'template_id',
    'job_id',
    'shell_id',
    'session_id',
    'incident_id',
)

# Actions that can close an open incident.
CLOSES_INCIDENT = (
    'update_rule',
    'delete_rule',
    'delete_cloud',
    'destroy_machine',
    'rule_untriggered',
    'disable_monitoring',
)
