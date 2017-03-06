function TestMod() {

    var _this = this;
    var _id = null;
    var _giphyApiKey = "dc6zaTOxFJmzC" //TODO: Get out own key. This is the public one

    this.Init = function(manfiestData) {
        var deferred = $.Deferred();
        _id = manfiestData.id;
        console.log("Initing Mod: " + _this._id);
        deferred.resolve();
        return deferred.promise();
    };

    this.Enable = function() {
        var deferred = $.Deferred();
        console.log("Enabling mod: " + _id);
        _this.MonitorChat();
        deferred.resolve();
        return deferred.promise();
    };

    this.Disable = function() {
        var deferred = $.Deferred();
        console.log("Disable: " + _id);
        deferred.resolve();
        return deferred.promise();
    };

    this.MonitorChat = function() {
        gModApi.Chat.OnIncommingChatMessage(function(messageString) {
            var messageData = JSON.parse(messageString);
            if (messageData.room == "#all") {
                var giphyCommand = "a ";
                console.log(messageData.message.toLowerCase());
                if (messageData.message.toLowerCase().indexOf(giphyCommand) == 0) {
                    var searchTerm = messageData.message.replace(giphyCommand, "");
                    _this.PostGiphySearchToGlobalChat(searchTerm);
                }
            }
        });
    }

    this.PostGiphySearchToGlobalChat = function(searchTerm) {
        if (searchTerm.length == 0) {
            console.info("Tried to search for a giphy image with no search term")
        } else {
            _this.GetGiphyImage(searchTerm).then(function (imageSrc) {
                _this.AddImageToGlobalChat(imageSrc);
            });
        }
    }

    this.GetGiphyImage = function(searchTerm) {
        var deferred = $.Deferred();
        var escapedSearchTerm = searchTerm.replaceAll(" ", "+")
        var requestUrl = "http://api.giphy.com/v1/gifs/search?q=" + escapedSearchTerm + "&api_key=" + _giphyApiKey;
        $.getJSON(requestUrl, function( data ) {
            if (data.data.length > 0) {
                var image = data.data[0].images.fixed_width.url;
                deferred.resolve(image);
            } else {
                deferred.reject("Could not find an image")
            }
        });
        return deferred.promise();
    }

    this.AddImageToGlobalChat = function (imageSrc) {
        var deferred = $.Deferred();
        var image = new Image();
        image.onload = function () {
            console.info("Image loaded !");
            // This adds the image
            $("#globalChat .chat-lines").append("\<li class='chat-entry'><img src='" + imageSrc + "\'\></li>");
            // We have to set a timeout because after we append the image it does not have the correct size.
            // We really should not have to do this. .append should not be a-sync but something is going on
            setTimeout(function() {
                // This scrolls us to the bottom
                $("#globalChat .chat-room").scrollTop($("#globalChat .chat-room")[0].scrollHeight);
            }, 200);
            deferred.resolve();
        }
        image.onerror = function () {
            console.error("Could not load image");
            deferred.reject("Could not load image")
        }
        image.src = imageSrc;
        return deferred.promise();
    }

}
