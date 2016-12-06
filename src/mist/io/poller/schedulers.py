from celerybeatmongo.schedulers import MongoScheduler

from mist.io.poller.models import PollingSchedule


class PollingScheduler(MongoScheduler):
    Model = PollingSchedule
