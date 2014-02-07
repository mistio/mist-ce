define('app/models/image', ['ember'],
    /**
     * Image Model
     *
     * @returns Class
     */
    function() {
        return Ember.Object.extend({
            /*
             * Image types
             *
             * "generic" if not found
             */
            TYPES: {
                    rhel: "RedHat Enterprise Linux",
                    ubuntu: "Ubuntu",
                    ibm: "IBM",
                    canonical: "Canonical",
                    sles: "SUSE Linux Enterprise Server",
                    oracle_linux: "Oracle Linux",
                    karmic: "Karmic",
                    opensolaris: "Open Solaris",
                    windows: "Windows",
                    gentoo: "Gentoo",
                    opensuse: "openSUSE",
                    fedora: "Fedora",
                    centos: "CentOS",
                    debian: "Debian",
                    amazon: "Amazon"
            },

            id: null,
            star: null,
            name: null,
            extra: null,

            type: function(){
                for(type in this.TYPES){
                    if(this.name != null && this.name.toLowerCase().search(type) != -1){
                        return type;
                    }
                }
                return "generic";
            }.property("id"),

            toggle: function(callback) {
                this.backend.toggleImageStar(this, callback);
            }
        });
    }
);
