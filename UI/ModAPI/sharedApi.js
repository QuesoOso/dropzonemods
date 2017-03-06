

function SharedApi() {

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
            return gModApi.EngineCall("GetEnvironmentDirectory", folderId);
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
            return gModApi.EngineCall("GatherFiles", folder, subfolder, searchPattern, recursive, includeRootFolder);
        };
    }

}