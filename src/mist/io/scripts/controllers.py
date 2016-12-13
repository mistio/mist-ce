import re
import yaml
import logging
from mist.io.exceptions import BadRequestError
from mist.core.exceptions import ScriptFormatError
from mist.io.scripts.base import BaseScriptController
from yaml.parser import ParserError as YamlParserError
from yaml.scanner import ScannerError as YamlScannerError

log = logging.getLogger(__name__)


class AnsibleScriptController(BaseScriptController):

    def _preparse_file(self):
        if self.script.location.type == 'inline':
            try:
                yaml.load(self.script.location.source_code)
            except (YamlParserError, YamlScannerError):
                raise ScriptFormatError()

    def run_script(self, shell, params=None, job_id=None):
        params = '"%s"' % params.replace('"', r'\"')
        path, params, wparams = super(
            AnsibleScriptController, self).run_script(shell, params=params,
                                                      job_id=job_id)
        wparams += " -a"
        return path, params, wparams


class ExecutableScriptController(BaseScriptController):

    def _preparse_file(self):
        if self.script.location.type == 'inline':
            if not self.script.location.source_code.startswith('#!'):
                raise BadRequestError(
                    "script' must start with a hashbang/shebang ('#!')."
                )


class CollectdScriptController(BaseScriptController):

    def run_script(self, shell, params=None, job_id=None):
        # FIXME i don't like this, why not to put this into run_script
        # with a simple 'if'. do we need print read()?
        if self.script.location.type == 'inline':
            # wrap collectd python plugin so that it can run as script
            source_code = self.script.location.source_code
            if not self.script.location.source_code.startswith('!#'):
                self.script.location.source_code = \
                    '#!/usr/bin/env python\n\n' + source_code
            # self.script.location.source_code += '\n\nprint read()\n' FIXME
        path, params, wparams = super(CollectdScriptController,
                                      self).run_script(shell, params=params,
                                                       job_id=job_id)
        return path, params, wparams

    def deploy_and_assoc_python_plugin_from_script(self, machine, host):
        from mist.core.methods import assoc_metric, update_metric
        from mist.io.methods import deploy_python_plugin

        # FIXME this works only for inline source_code
        # else we must_download the source from url or github
        # Construct plugin_id from script name
        plugin_id = self.script.name.lower()
        plugin_id = re.sub('[^a-z0-9_]+', '_', plugin_id)
        plugin_id = re.sub('_+', '_', plugin_id)
        plugin_id = re.sub('^_', '', plugin_id)
        plugin_id = re.sub('_$', '', plugin_id)
        ret = deploy_python_plugin(
            self.script.owner, machine.cloud.id, machine.machine_id, plugin_id,
            self.script.extra.get('value_type', 'gauge'),
            self.script.location.source_code,
            host
        )
        metric_id = ret['metric_id']
        update_metric(self.script.owner, metric_id=metric_id,
                      name=self.script.name,
                      unit=self.script.extra.get('value_unit', ''))
        assoc_metric(self.script.owner, machine.cloud.id, machine.machine_id,
                     metric_id)
        return ret
