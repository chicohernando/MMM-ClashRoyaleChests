var request = require("request");
const NodeHelper = require("node_helper");
const Log = require("../../js/logger");

module.exports = NodeHelper.create({
    /**
     * Entry point for our Node Helper.
     * 
     * @return void
     */
    start: function () {
        Log.log("Starting node helper for: " + this.name);

        this.instances = [];
        this.peloton_api_url = "https://api.clashroyale.com/v1/";
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
     * Wrapper for Log.log function.  This will use Log.log if the debug
     * confirguration is true.  This will prefix the name of the module
     * and the instance identifier to the string_to_log.
     *
     * This expects string_to_log to be a string.  If you have an object
     * that you want to log you should try something like:
     *
     *     this.debug(JSON.stringify(object, null, 2));
     *
     * instance_identifier is used to determine if the instance has been
     * configured for debugging.  If instance_identifier is not passed in
     * then the default is to log the data.
     *
     * @param string string_to_log
     * @param string|null instance_identifier
     *
     * @return void
     */
    debug: function(string_to_log, instance_identifier = null) {
        let should_log = instance_identifier === null || this.instances[instance_identifier].config.debug === true;
        let prefix = "";

        if (should_log) {
            if (instance_identifier) {
                prefix = "[" + this.name + ":" + instance_identifier + "] ";
            } else {
                prefix = "[" + this.name + "] ";
            }

            Log.log(prefix + string_to_log);
        }
    },
    
    /**
     * This function captures requests from the front end and determines
     * if the request was meant for this node_helper.  If it is then this
     * will dispatch the appropriate calls.
     *
     * @param string notification
     * @param object payload
     *
     * @return void
     */
    socketNotificationReceived: function(notification, payload) {
        this.debug("Received socket notification: " + notification);

        switch (notification) {
            case this.normalizeNotification("SET_CONFIG"):
                this.createInstance(payload.instance_identifier, payload.config);
                break;
            case this.normalizeNotification("REQUEST_UPCOMING_CHESTS"):
                this.debug("This is where we would request some chests", payload.instance_identifier);
                break;
        }
    },

    /**
     * This node_helper keeps track of data per instance that
     * is loaded on the front end.  It does so by keeping track
     * of instance data.  This function will create a new instance
     * keyed by the front end instance_identifier.  It will store
     * the instance config as part of this instance data along with
     * other instance specific data accumulated via API calls.
     *
     * @param string instance_identifier
     * @param object config
     *
     * @return void
     */
    createInstance: function(instance_identifier, config) {
        let instance = {};

        instance.config = config;
        instance.chests = [];

        this.instances[instance_identifier] = instance;
    }
});