Module.register("MMM-ClashRoyaleChests", {
    defaults: {
        refresh_every: 300, //number of seconds between data refreshes

        api_key: "",        //generate a new key at https://developer.clashroyale.com/#/account

        player_tag: "",     //find instructions for finding your player tag at https://royalechests.com/faq

        limit: 5,           //number of chests to show; integer in the range of [1, 9]

        //development
        debug: false        //true or false; if true you will see more information in your log files
    },

    /**
     * Entry point for our module
     * 
     * @return void
     */
    start: function() {
        let self = this;
        this.is_loading = true;
        this.has_data_retrieval_failed = false;
        this.chests = [];

        //make sure that limit is a sane value
        if (this.config.limit < 1 || this.config.limit > 9) {
            this.config.limit = 5;
        }

        if (this.config.refresh_every < 60 || this.config.refresh_every > 86400) {
            this.config.refresh_every = 300;
        }

        //make sure that player tag starts with a #
        if (!this.config.player_tag.startsWith("#", 0)) {
            this.config.player_tag = "#" + this.config.player_tag;
        }

        this.sendSocketNotification(this.normalizeNotification("SET_CONFIG"), {
            instance_identifier: this.identifier,
            config: this.config
        });

        this.refreshData();

        setInterval(function() {
            self.is_loading = true;
            self.has_data_retrieval_failed = false;
            self.chests = [];

           self.refreshData(); 
        }, this.config.refresh_every * 1000);
    },

    /**
     * Wrapper function to kick off the appropriate backend requests.
     *
     * @return void
     */
    refreshData: function() {
        this.sendSocketNotification(this.normalizeNotification("REQUEST_UPCOMING_CHESTS"), {
            instance_identifier: this.identifier
        });
    },

    /**
     * Wrapper for Log.log function.  This will use Log.log if the debug
     * confirguration is true.  This will prefix the name of the module
     * and the instance identifier to the string_to_log.
     *
     * This expects string_to_log to be a string.  If you have an object
     * that you want to log you should try something like:
     *
     *     this.debug(JSON.stringify(object, null, 2));
     *
     * @param string string_to_log
     *
     * @return void
     */
    debug: function(string_to_log) {
        if (this.config.debug) {
            Log.log("[" + this.name + ":" + this.identifier + "] " + string_to_log);
        }
    },

    /**
     * Returns the name of the template that this widget should load.
     * 
     * @return string
     */
    getTemplate: function() {
        return "templates/chests.njk";
    },

    /**
     * Sets the data to be used by our template.
     * 
     * @return object
     */
    getTemplateData: function() {
        let data = {};

        data.is_loading = this.is_loading;
        data.has_data_retrieval_failed = this.has_data_retrieval_failed;
        data.chests = this.getChests();

        return data;
    },

    /**
     * This function will make it so that the socket notification names
     * are guaranteed to be unique for our module.  This makes it so
     * that we do not have to worry about naming collisions with other
     * modules.
     *
     * @param string notification
     *
     * @return string
     */
    normalizeNotification: function(notification) {
        return this.name + "_" + notification;
    },
    
    /**
     * Handles notifications received from the node_helper.
     *
     * @param string notification
     * @param object payload
     *
     * @return void
     */
    socketNotificationReceived: function (notification, payload) {
        let self = this;

        if (payload.instance_identifier == this.identifier) {
            if (notification === "FAILED_TO_RETRIEVE_UPCOMING_CHESTS") {
                this.debug("Front end knows that we were unable to retrieve chests");
                
                this.is_loading = false;
                this.has_data_retrieval_failed = true;
                this.updateDom();
            } else if (notification === "RETRIEVED_UPCOMING_CHESTS") {
                this.debug("Front end knows that we were able to retrieve chests");
                this.is_loading = false;
                this.has_data_retrieval_failed = false;
                this.chests = payload.chests;
                this.updateDom();
            }
        }
    },

    /**
     * This will transform the raw Clash Royale API data for
     * chests and will return the transformed data as an array.
     * 
     * This will return an empty array if the raw data hasn't
     * been fetched.
     * 
     * @return array
     */
    getChests: function() {
        let chests = this.chests;

        chests = chests.slice(0, this.config.limit);

        return chests;
    }
});