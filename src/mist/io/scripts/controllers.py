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
        from mist.io.scripts.models import InlineLocation
        if isinstance(self.script.location, InlineLocation):
            try:
                yaml.load(self.script.location.source_code)
            except (YamlParserError, YamlScannerError):
                raise ScriptFormatError


class ExecutableScriptController(BaseScriptController):

    def _preparse_file(self):
        from mist.io.scripts.models import InlineLocation
        if isinstance(self.script.location, InlineLocation):
            if not self.script.location.source_code.startswith('#!'):
                raise BadRequestError(
                    "script' must start with a hashbang/shebang ('#!')."
                )


class CollectdScriptController(ExecutableScriptController):

    def deploy_and_assoc_python_plugin_from_script(self, machine, host):
        from mist.core.methods import assoc_metric, update_metric
        from mist.io.methods import deploy_python_plugin
        from mist.io.scripts.models import CollectdScript

        if not isinstance(self.script, CollectdScript):
            raise BadRequestError("Script should have exec_type of "
                                  "'collectd_python_plugin'.")

        # Construct plugin_id from script name
        plugin_id = self.script.name.lower()
        plugin_id = re.sub('[^a-z0-9_]+', '_', plugin_id)
        plugin_id = re.sub('_+', '_', plugin_id)
        plugin_id = re.sub('^_', '', plugin_id)
        plugin_id = re.sub('_$', '', plugin_id)
        ret = deploy_python_plugin(
            self.script.owner, machine.cloud.id, machine.machine_id, plugin_id,
            self.script.extra.get('value_type', 'gauge'), self.script.script,
            host
        )
        metric_id = ret['metric_id']
        update_metric(self.script.owner, metric_id=metric_id,
                      name=self.script.name,
                      unit=self.script.extra.get('value_unit', ''))
        assoc_metric(self.script.owner, machine.cloud.id, machine.machine_id,
                     metric_id)
        return ret
