var gModManager = new ModManager();


function ModManager() {

    var _this = this;
    var _mods = [];
    var _init = false;
    var _neededIncludes = [
        "ModAPI/modApi.js",
        "ModAPI/sharedApi.js"
    ]

    this.Init = function(callback) {
        if (_init) {
            if (callback) callback();
        } else {
            // Lets make sure we load our API first
            _this.AddIncludes(_neededIncludes).then(function() {
                // Get the directory of our mods
                var modsDirectory = 66;
                gModApi.Files.GetEnvironmentDirectory(modsDirectory).then(function(folder) {
                    gModApi.Files.GatherFiles(folder, "", "mod.json", true, false).then(function(modManifestFiles) {
                        console.log(modManifestFiles);
                        var modPromises = [];
                        for (var modIndex = 0; modIndex < modManifestFiles.length; modIndex++) {
                            modPromises.push(_LoadAndProcessModInfo(modManifestFiles[modIndex]));
                        }
                        $.when.apply($, modPromises).always(function() {
                            console.log("Loaded all mods");
                            _init = true;
                            if (callback) callback();
                        });
                    }).fail(function(error) {
                        //TODO: Error handling
                    });
                }).fail(function(error) {
                    //TODO: Error handling
                });
            }).fail(function(error) {
                //TODO: Error handling
            });
        }
    };

    /**
     * Internal function to load the manifest we get from the mods
     * @param modManifestLocation
     * @returns {*}
     * @private
     */
    _LoadAndProcessModInfo = function(modManifestLocation) {
        var deferred = $.Deferred();
        console.log("Loading mod manifest: " + modManifestLocation);

        // Get the folder the manifest is in for later
        // TODO: Make this platform independent. Would only work for windows. Do we care?
        var manifestFolder = modManifestLocation.substring(0,modManifestLocation.lastIndexOf("\\")+1);

        $.getJSON(modManifestLocation).then(function (modData) {
            console.log("Loaded mod manifest: " + modManifestLocation);

            var statusInfo = {loaded: false, error: false, mod: null};
            $.extend(modData, statusInfo);

            if (!modData.id) {
                modData.error = "Mod does not have an ID: " + modManifestLocation;
                deferred.reject(modData.error);
                return;
            }

            _mods.push(modData);

            if (!modData.include) {
                modData.error = "Mod " + modData.id + " does not have an 'include' parameter in mod manifest";
                deferred.reject(modData.error);
            } else if (!modData.functionName) {
                modData.error = "Mod " + modData.id + " does not have an 'functionName' parameter in mod manifest";
                deferred.reject(modData.error);
            } else {
                // TODO: Make this platform independent.
                var fullIncludePath = manifestFolder + "\\" + modData.include;
                _this.AddInclude(fullIncludePath).then(function() {
                    //TODO: There has to be a better way to get the mod object. Will research more later
                    eval("modData.mod = new " + modData.functionName + "()");

                    // Helper function to make sure we have all the methods we need in the mod
                    var CheckFunction = function(functionName) {
                        if (typeof modData.mod[functionName] === 'undefined' || typeof modData.mod[functionName] !== "function") {
                            modData.error = "Mod " + modData.id + " does not have '" + functionName + "' method";
                            console.log(modData.error);
                            deferred.reject(modData.error);
                            return false;
                        }
                        return true;
                    };

                    //Ensure we have all the methods
                    if (!CheckFunction("Init")) return;
                    if (!CheckFunction("Enable")) return;
                    if (!CheckFunction("Disable")) return;

                    //Init the mod
                    modData.mod.Init(modData).then(function() {
                        if (modData.enabledOnStart) {
                            modData.mod.Enable().then(function() {
                                deferred.resolve();
                            }).fail(function(err) {
                                console.log("Failed to Enable Mod: " + modData.id);
                                console.log(err);
                                modData.error = err;
                                deferred.reject(err);
                            });
                        } else {
                            deferred.resolve();
                        }
                    }).fail(function(err) {
                        console.log("Failed to Init Mod: " + modData.id);
                        console.log(err);
                        modData.error = err;
                        deferred.reject(err);
                    });

                }).fail(function (err) {
                    deferred.reject(err);
                })
            }
        }).fail(function (err) {
            console.log("Failed to load mod manifest: " + modManifestLocation);
            deferred.reject(err);
        });
        return deferred.promise();
    };


    /**
     * This gets data about the Environment the mod is currently running in
     */
    this.GetEnvironment = function() {
        var id = $("head").attr('id');
        if (typeof id === 'undefined') {
            return 'Unknown';
        } else {
            return id;
        }
    };


    /**
     *
     * @param {string} modId Id of mod
     * @returns {*}
     */
    this.EnableMod = function(modId) {
        var deferred = $.Deferred();
        var found = false;
        for(var modIndex = 0; modIndex < _mods.length; modIndex++) {
            var modData = _mods[modIndex];
            if (modData.id == modId) {
                found = true;
                console.log("Enabling mod: " + modId);
                modData.mod.Enable().then(function() {
                    deferred.resolve();
                }).fail(function(err) {
                    console.log("Failed to Enable Mod: " + modData.id);
                    console.log(err);
                    modData.error = err;
                    deferred.reject(err);
                });
                break;
            }
        }
        if (!found) {
            deferred.reject("Mod not found with id: " + modId);
        }
        return deferred.promise();
    };


    /**
     *
     * @param {string} modId Id of Mod
     * @returns {*}
     * @constructor
     */
    this.DisableMod = function(modId) {
        var deferred = $.Deferred();
        var found = false;
        for(var modIndex = 0; modIndex < _mods.length; modIndex++) {
            var modData = _mods[modIndex];
            if (modData.id == modId) {
                found = true;
                console.log("Disabling mod: " + modId);
                modData.mod.DisableMod().then(function() {
                    deferred.resolve();
                }).fail(function(err) {
                    console.log("Failed to Disable Mod: " + modData.id);
                    console.log(err);
                    modData.error = err;
                    deferred.reject(err);
                });
                break;
            }
        }
        if (!found) {
            deferred.reject("Mod not found with id: " + modId);
        }
        return deferred.promise();
    };


    /**
     * Adds a script file to the dom to be used
     * @param {string} filepath Path to the script
     * @returns {promise}
     */
    this.AddInclude = function(filepath){
        var deferred = $.Deferred();
        console.log("Adding script to includes: " + filepath);
        if (filepath) {
            var fileReference = document.createElement('script');

            fileReference.onload = function() {
                console.log("Script loaded");
                deferred.resolve();
            };

            fileReference.onerror = function() {
                console.log("Script failed to load");
                deferred.reject("File not found");
            };

            fileReference.setAttribute("type","text/javascript");
            fileReference.setAttribute("src", filepath);

            if (typeof fileReference != "undefined")
                document.getElementsByTagName("head")[0].appendChild(fileReference);
        }
        return deferred.promise();
    };

    /**
     *
     * @param filepaths of all includes
     * @returns {*}
     * @constructor
     */
    this.AddIncludes = function(filepaths) {
        var deferred = $.Deferred();
        var modPromises = [];
        for (var modIndex = 0; modIndex < filepaths.length; modIndex++) {
            modPromises.push(_this.AddInclude(filepaths[modIndex]));
        }
        $.when.apply($, modPromises).always(function() {
            deferred.resolve();
        });
        return deferred.promise();
    }

}