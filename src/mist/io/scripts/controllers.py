import logging
import yaml
from yaml.parser import ParserError as YamlParserError
from yaml.scanner import ScannerError as YamlScannerError
from mist.core.exceptions import ScriptFormatError


from mist.io.exceptions import BadRequestError

from mist.io.scripts.base import BaseScriptController
log = logging.getLogger(__name__)

class AnsibleScriptController(BaseScriptController):

    # def get_file(self):
    #     file = super(AnsibleScriptController, self).get_file()

    def _preparse_file(self):
        from mist.io.scripts.models import InlineLocation
        if isinstance(self.script.location, InlineLocation):
            try:
                yaml.load(self.script.location.source_code)
            except (YamlParserError, YamlScannerError):
                raise ScriptFormatError


class ExecutableScriptController(BaseScriptController):
    # def get_file(self):
    #     file = super(ExecutableScriptController, self).get_file()
    def _preparse_file(self):
        from mist.io.scripts.models import InlineLocation
        if isinstance(self.script.location, InlineLocation):
            if not self.script.location.source_code.startswith('#!'):
                raise BadRequestError(
                    "script' must start with a hashbang/shebang ('#!')."
                )

#
# class CollectdScript(BaseScriptController):
