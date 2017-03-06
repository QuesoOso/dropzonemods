var gModApi = new ModApi();

function ModApi() {

    /**
     * @type {ModApi}
     * @private
     */
    var _this = this;

    /**
     * Sparkleengine uses coherent. Coherent uses it's own type of promises.
     * This calls coherent promise and converts it to jquery promise
     * @returns {promise}
     * @private
     */
    this.EngineCall = function () {
        var deferred = $.Deferred();

        var EngineCallSuccess = function (data) {
            if (data) {
                deferred.resolve(data);
            } else {
                deferred.resolve();
            }
        };

        var EngineCallFailure = function (error) {
            deferred.reject(error);
        };

        engine.call.apply(engine, arguments).then(EngineCallSuccess, EngineCallFailure);

        return deferred.promise();
    };


    /**
     * Deals with things relating to chat
     * @type {Chat}
     */
    this.Chat = new function () {
        /**
         * Tie into this for getting chat messages
         * @param {function} callback Called when you get a message
         */
        this.OnIncommingChatMessage = function (callback) {
            engine.on("OnIncomingChatMessage", function (messageObject) {
                if (callback) callback(messageObject);
            });
        }

        /**
         * Send a chat
         * @param {string} chatRoom Room name. EX: '#all' - Global Chat
         * @param {string} message
         * @returns {promise}
         */
        this.SendChatMessage = function (chatRoom, message) {
            return _this._EngineCall("SendChatMessage", chatRoom, message);
        }
    }

    this.Player = new function () {

        this.GetUserData = function () {
            var deferred = $.Deferred();
            if (gModManager.GetEnvironment() == "HomeScene") {
                gSingletonManager.WaitForSingleton("PlayerDataMgr").then(function (manager) {
                    // Lets check if the data is there yet
                    if (typeof manager.GetUserData() !== 'undefined') {
                        deferred.resolve(manager.GetUserData());
                    } else {
                        var callbackId;
                        var callbackFunc = function (data) {
                            manager.RemoveUserDataUpdateCallback(callbackId);
                            deferred.resolve(data);
                        }
                        callbackId = manager.RegisterUserDataUpdateCallback(callbackFunc);
                    }
                });
            } else {
                deferred.reject("Can't use this API in current environment");
            }
            return deferred.promise();
        }

    }

}