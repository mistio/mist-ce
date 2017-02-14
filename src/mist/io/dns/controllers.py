# Wrapper class for DNS actions

class ZoneController(object):

    def __init__(self, zone):
        """Initialize zone controller given a zone
        """
        self.zone = zone

    def create_zone(self, **kwargs):
        """Create a zone under the specific cloud"""
        return self.zone.cloud.ctl.dns.create_zone(self.zone, **kwargs)

    def list_records(self):
        """Wrapper for the DNS cloud controller list_records() functionality
        """
        return self.zone.cloud.ctl.dns.list_records(self.zone)

    def delete_zone(self):
        """Wrapper for the DNS cloud controller delete_zone() functionality
        """
        return self.zone.cloud.ctl.dns.delete_zone(self.zone)


class RecordController(object):

    def __init__(self, record):
        """Initialize record controller given a record
        """
        self.record = record

    def create_record(self, **kwargs):
        """Wrapper for the DNS cloud controller create_record() functionality
        """
        return self.record.zone.cloud.ctl.dns.create_record(self.record,
                                                            **kwargs)

    def delete_record(self):
        """Wrapper for the delete_record DNSController functionality."""
        return self.record.zone.cloud.ctl.dns.delete_record(self.record)
