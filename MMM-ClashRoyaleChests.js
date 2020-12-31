Module.register("MMM-ClashRoyaleChests", {
    defaults: {
        //timer
        refresh_every: 300, //number of seconds between data refreshes

        api_key: "",        //generate a new key at https://developer.clashroyale.com/#/account

        player_tag: "",     //find instructions for finding your player tag at https://royalechests.com/faq

        limit: 5,           //number of chests to show; integer in the range of [1, 9]

        //development
        debug: false        //true or false; if true you will see more information in your log files
    },

    start: function() {
        //make sure that limit is a sane value
        if (this.config.limit < 1 || this.config.limit > 9) {
            this.config.limit = 5;
        }

        //make sure that player tag starts with a #
        if (!this.config.player_tag.startsWith("#", 0)) {
            this.config.player_tag = "#" + this.config.player_tag;
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

        return data;
    }
});