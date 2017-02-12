import re
import yaml
import random
import logging
import mist.io.shell
from StringIO import StringIO
from mist.io.exceptions import BadRequestError
from mist.io.exceptions import ScriptFormatError
from mist.io.scripts.base import BaseScriptController
from yaml.parser import ParserError as YamlParserError
from yaml.scanner import ScannerError as YamlScannerError
from mist.io.exceptions import RequiredParameterMissingError

log = logging.getLogger(__name__)


class AnsibleScriptController(BaseScriptController):

    def _preparse_file(self):
        if self.script.location.type == 'inline':
            try:
                yaml.load(self.script.location.source_code)
            except (YamlParserError, YamlScannerError):
                raise ScriptFormatError()

    def run_script(self, shell, params=None, job_id=None):
        if params:
            params = '"%s"' % params.replace('"', r'\"')
        path, params, wparams = super(
            AnsibleScriptController, self).run_script(shell, params=params,
                                                      job_id=job_id)
        wparams += " -a"
        return path, params, wparams


class ExecutableScriptController(BaseScriptController):

    def _preparse_file(self):
        if self.script.location.type == 'inline':
            if self.script.location.source_code:
                if not self.script.location.source_code.startswith('#!'):
                    raise BadRequestError(
                        "'script' must start with a hashbang/shebang ('#!')."
                    )
            else:
                raise BadRequestError("for inline script you must provide "
                                      "source code")


class CollectdScriptController(BaseScriptController):

    def run_script(self, shell, params=None, job_id=None):
        if self.script.location.type == 'inline':
            # wrap collectd python plugin so that it can run as script
            source_code = self.script.location.source_code
            hashbang = '#!/usr/bin/env python\n\n'
            if not source_code.startswith('!#'):
                self.script.location.source_code = hashbang + source_code
            self.script.location.source_code += '\n\nprint read()\n'

        path, params, wparams = super(CollectdScriptController,
                                      self).run_script(shell,
                                                       params=params,
                                                       job_id=job_id)
        return path, params, wparams

    def deploy_python_plugin(self, machine):
        # Construct plugin_id from script name
        plugin_id = self.script.name.lower()
        plugin_id = re.sub('[^a-z0-9_]+', '_', plugin_id)
        plugin_id = re.sub('_+', '_', plugin_id)
        plugin_id = re.sub('^_', '', plugin_id)
        plugin_id = re.sub('_$', '', plugin_id)

        owner = self.script.owner
        value_type = self.script.extra.get('value_type', 'gauge')
        read_function = self.script.location.source_code
        host = machine.hostname

        # Sanity checks
        if not plugin_id:
            raise RequiredParameterMissingError('plugin_id')
        if not value_type:
            raise RequiredParameterMissingError('value_type')
        if not read_function:
            raise RequiredParameterMissingError('read_function')
        if not host:
            raise RequiredParameterMissingError('host')
        chars = [chr(ord('a') + i) for i in range(26)] + list('0123456789_')
        for c in plugin_id:
            if c not in chars:
                raise BadRequestError(
                    "Invalid plugin_id '%s'.plugin_id can only "
                    "lower case chars, numeric digits and"
                    "underscores" % plugin_id)
        if plugin_id.startswith('_') or plugin_id.endswith('_'):
            raise BadRequestError(
                "Invalid plugin_id '%s'. plugin_id can't start "
                "or end with an underscore." % plugin_id)
        if value_type not in ('gauge', 'derive'):
            raise BadRequestError(
                "Invalid value_type '%s'. Must be 'gauge' or "
                "'derive'." % value_type)

        # Initialize SSH connection
        shell = mist.io.shell.Shell(host)
        key_id, ssh_user = shell.autoconfigure(owner, machine.cloud.id,
                                               machine.machine_id)
        sftp = shell.ssh.open_sftp()

        tmp_dir = "/tmp/mist-python-plugin-%d" % random.randrange(2 ** 20)
        retval, stdout = shell.command(
"""
sudo=$(command -v sudo)
mkdir -p %s
cd /opt/mistio-collectd/
$sudo mkdir -p plugins/mist-python/
$sudo chown -R root plugins/mist-python/""" % tmp_dir
        )

        # Test read function
        test_code = """
import time

from %s_read import *

for i in range(3):
    val = read()
    if val is not None and not isinstance(val, (int, float, long)):
        raise Exception("read() must return a single int, float or long "
                        "(or None to not submit any sample to collectd)")
    time.sleep(1)
print("READ FUNCTION TEST PASSED")
        """ % plugin_id

        sftp.putfo(StringIO(read_function),
                   "%s/%s_read.py" % (tmp_dir, plugin_id))
        sftp.putfo(StringIO(test_code), "%s/test.py" % tmp_dir)

        retval, test_out = shell.command(
            "$(command -v sudo) python %s/test.py" % tmp_dir)
        stdout += test_out

        if not test_out.strip().endswith("READ FUNCTION TEST PASSED"):
            stdout += "\nERROR DEPLOYING PLUGIN\n"
            raise BadRequestError(stdout)

        # Generate plugin script
        plugin = """# Generated by mist.io web ui

import collectd

%(read_function)s

def read_callback():
    val = read()
    if val is None:
        return
    vl = collectd.Values(type="%(value_type)s")
    vl.plugin = "mist.python"
    vl.plugin_instance = "%(plugin_instance)s"
    vl.dispatch(values=[val])

collectd.register_read(read_callback)""" % {'read_function': read_function,
                                            'value_type': value_type,
                                            'plugin_instance': plugin_id}

        sftp.putfo(StringIO(plugin), "%s/%s.py" % (tmp_dir, plugin_id))
        retval, cmd_out = shell.command("""
cd /opt/mistio-collectd/
$(command -v sudo) mv %s/%s.py plugins/mist-python/
$(command -v sudo) chown -R root plugins/mist-python/""" % (tmp_dir, plugin_id)
                                        )
        stdout += cmd_out

        # Prepare collectd.conf
        script = """
sudo=$(command -v sudo)
cd /opt/mistio-collectd/

if ! grep '^Include.*plugins/mist-python' collectd.conf; then
    echo "Adding Include line in collectd.conf for plugins/mist-python/include.conf"
    $sudo su -c 'echo Include \\"/opt/mistio-collectd/plugins/mist-python/include.conf\\" >> collectd.conf'
else
    echo "plugins/mist-python/include.conf is already included in collectd.conf"
fi
if [ ! -f plugins/mist-python/include.conf ]; then
    echo "Generating plugins/mist-python/include.conf"
    $sudo su -c 'echo -e "# Do not edit this file, unless you are looking for trouble.\n\n<LoadPlugin python>\n    Globals true\n</LoadPlugin>\n\n\n<Plugin python>\n    ModulePath \\"/opt/mistio-collectd/plugins/mist-python/\\"\n    LogTraces true\n    Interactive false\n</Plugin>\n" > plugins/mist-python/include.conf'
else
    echo "plugins/mist-python/include.conf already exists, continuing"
fi

echo "Adding Import line for plugin in plugins/mist-python/include.conf"
if ! grep '^ *Import %(plugin_id)s *$' plugins/mist-python/include.conf; then
    $sudo cp plugins/mist-python/include.conf plugins/mist-python/include.conf.backup
    $sudo sed -i 's/^<\/Plugin>$/    Import %(plugin_id)s\\n<\/Plugin>/' plugins/mist-python/include.conf
    echo "Checking that python plugin is available"
    if $sudo /usr/bin/collectd -C /opt/mistio-collectd/collectd.conf -t 2>&1 | grep 'Could not find plugin python'; then
        echo "WARNING: collectd python plugin is not installed, will attempt to install it"
        zypper in -y collectd-plugin-python
        if $sudo /usr/bin/collectd -C /opt/mistio-collectd/collectd.conf -t 2>&1 | grep 'Could not find plugin python'; then
            echo "Install collectd-plugin-python failed"
            $sudo cp plugins/mist-python/include.conf.backup plugins/mist-python/include.conf
            echo "ERROR DEPLOYING PLUGIN"
        fi
    fi
    echo "Restarting collectd"
    $sudo /opt/mistio-collectd/collectd.sh restart
    sleep 2
    if ! $sudo /opt/mistio-collectd/collectd.sh status; then
        echo "Restarting collectd failed, restoring include.conf"
        $sudo cp plugins/mist-python/include.conf.backup plugins/mist-python/include.conf
        $sudo /opt/mistio-collectd/collectd.sh restart
        echo "ERROR DEPLOYING PLUGIN"
    fi
else
    echo "Plugin already imported in include.conf"
fi
$sudo rm -rf %(tmp_dir)s""" % {'plugin_id': plugin_id, 'tmp_dir': tmp_dir}

        retval, cmd_out = shell.command(script)
        stdout += cmd_out
        if stdout.strip().endswith("ERROR DEPLOYING PLUGIN"):
            raise BadRequestError(stdout)

        shell.disconnect()

        parts = ["mist", "python"]  # strip duplicates (bucky also does this)
        for part in plugin_id.split("."):
            if part != parts[-1]:
                parts.append(part)
        ## parts.append(value_type)  # not needed since MistPythonConverter in bucky
        metric_id = ".".join(parts)

        return {'metric_id': metric_id, 'stdout': stdout}

    def deploy_and_assoc_python_plugin_from_script(self, machine):
        from mist.core.methods import assoc_metric, update_metric

        # FIXME this works only for inline source_code
        # else we must_download the source from url or github

        ret = self.deploy_python_plugin(machine)
        metric_id = ret['metric_id']
        update_metric(self.script.owner, metric_id=metric_id,
                      name=self.script.name,
                      unit=self.script.extra.get('value_unit', ''))
        assoc_metric(self.script.owner, machine.cloud.id, machine.machine_id,
                     metric_id)
        return ret
