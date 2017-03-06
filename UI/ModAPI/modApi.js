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
    this._EngineCall = function () {
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
     * Deals with accessing files and folders
     * @type {Files}
     */
    this.Files = new function () {
        /**
         * Gets the folder path of Environment Directory
         * This Environment Directory is internal to sparkleengine
         * @param {int} folderId Enum number for folder
         * TODO: Change the @param folder option to not be an int from enum
         */
        this.GetEnvironmentDirectory = function (folderId) {
            return _this._EngineCall("GetEnvironmentDirectory", folderId);
        };

        /**
         *
         * @param {string} folder Full path to folder we are getting files
         * @param {string} subfolder Subfolder from @param Folder
         * @param {string} searchPattern Search pattern that is checked on file path. Includes * and ?
         * @param {boolean} recursive Should we look in all folder
         * @param {boolean} includeRootFolder Should we include the root folder in the results
         */
        this.GatherFiles = function (folder, subfolder, searchPattern, recursive, includeRootFolder) {
            return _this._EngineCall("GatherFiles", folder, subfolder, searchPattern, recursive, includeRootFolder);
        };
    }

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