from fabric.api import env

env.command_timeout = 200
env.abort_on_prompts = True
env.no_keys = True
env.no_agent = True
env.warn_only = True
env.combine_stderr = True
env.keepalive = 15
