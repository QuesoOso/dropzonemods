function VorlonMod() {

    var _this = this;
    this.id = null;

    this.Init = function(manfiestData) {
        var deferred = $.Deferred();
        _this._id = manfiestData.id;
        console.log("Initing Mod: " + _this._id);
        deferred.resolve();
        return deferred.promise();
    };

    this.Enable = function() {
        var deferred = $.Deferred();
        console.log("Enabling mod: " + _this._id);
        gModManager.AddInclude("http://localhost:1337/vorlon.js").then(function() {
            console.log("Enable finished for Vorlon Mod");
            deferred.resolve();
        }).fail(function() {
            var error = "Failed to add include";
            deferred.reject(error);
        });
        return deferred.promise();
    };

    this.Disable = function() {
        var deferred = $.Deferred();
        console.log("Disable: " + _this._id);
        deferred.resolve();
        return deferred.promise();
    };
}
