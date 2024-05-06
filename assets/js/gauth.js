(function(exports) {
    "use strict";

    var StorageService = function() {
        var setObject = function(key, value) {
            localStorage.setItem(key, JSON.stringify(value));
        };

        var getObject = function(key) {
            var value = localStorage.getItem(key);
            return value && JSON.parse(value);
        };

        var isSupported = function() {
            return typeof (Storage) !== "undefined";
        };

        return {
            isSupported: isSupported,
            getObject: getObject,
            setObject: setObject
        };
    };

    exports.StorageService = StorageService;

    var KeyUtilities = function(jsSHA) {

        var dec2hex = function(s) {
            return (s < 15.5 ? '0' : '') + Math.round(s).toString(16);
        };

        var hex2dec = function(s) {
            return parseInt(s, 16);
        };

        var base32tohex = function(base32) {
            var base32chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
            var bits = "";
            var hex = "";

            for (var i = 0; i < base32.length; i++) {
                var val = base32chars.indexOf(base32.charAt(i).toUpperCase());
                bits += leftpad(val.toString(2), 5, '0');
            }

            for (i = 0; i + 4 <= bits.length; i += 4) {
                var chunk = bits.substr(i, 4);
                hex = hex + parseInt(chunk, 2).toString(16);
            }

            return hex;
        };

        var leftpad = function(str, len, pad) {
            if (len + 1 >= str.length) {
                str = new Array(len + 1 - str.length).join(pad) + str;
            }
            return str;
        };

        var generate = function(secret, epoch) {
            var key = base32tohex(secret);

            if (key.length % 2 !== 0) {
                key += '0';
            }
            if(typeof epoch === 'undefined') {
                epoch = Math.round(new Date().getTime() / 1000.0);
            }
            var time = leftpad(dec2hex(Math.floor(epoch / 30)), 16, '0');
            var hmacObj = new jsSHA(time, "HEX");
            var hmac = hmacObj.getHMAC(key, "HEX", "SHA-1", "HEX");

            var offset = 0;
            if (hmac !== 'KEY MUST BE IN BYTE INCREMENTS') {
                offset = hex2dec(hmac.substring(hmac.length - 1));
            }

            var otp = (hex2dec(hmac.substr(offset * 2, 8)) & hex2dec('7fffffff')) + '';
            return (otp).substr(otp.length - 6, 6).toString();
        };
        return {
            generate: generate
        };
    };

    exports.KeyUtilities = KeyUtilities;

    // ----------------------------------------------------------------------------
    var KeysController = function() {
        var storageService = null,
            keyUtilities = null,
            editingEnabled = false;

        var init = function() {
            storageService = new StorageService();
            keyUtilities = new KeyUtilities(jsSHA);
            if (storageService.isSupported()) {
                if (!storageService.getObject('accounts')) {
                    addAccount(' ', '知晓天下');
                }
                // setInterval(timerTick, 1000);
            } else {
                $('#updatingIn').text("x");
                $('#accountsHeader').text("No Storage support");
            }
        };
        
        var deleteAccount = function(index) {
            var accounts = storageService.getObject('accounts');
            accounts.splice(index, 1);
            storageService.setObject('accounts', accounts);
        };

        var addAccount = function(name, secret) {
            if(secret === '') {
                return false;
            }
            var account = {
                'name': name,
                'secret': secret
            };
            var accounts = storageService.getObject('accounts');
            if (!accounts) {
                accounts = [];
            }
            accounts.push(account);
            storageService.setObject('accounts', accounts);
            var codetxt = $("#codetxt").text();
            var newkey = $("#inputcode").val();
            newkey = newkey.replace(/\s*/g,"").replace(/[^a-zA-Z0-9]/g,"");
            if(codetxt==""&&newkey==""){
                $("#codenum").text(" ");
            }else if(codetxt!=""&&newkey==""){
                var key2 = keyUtilities.generate(codetxt);
                $("#codenum").text(key2);
                $("#inputcode").val(codetxt);
                // setInterval(timerTick, 1000);
            }else{
                var key1 = keyUtilities.generate(newkey);
                $("#codenum").text(key1);
                $("#codetxt").text(newkey);
            }
            return true;
        };
        
        $("#updatekey").click(function(){
            var newkey = $("#inputcode").val();
            var newname = " ";
            addAccount(newname,newkey);
        });
        
        var timerTick = function() {
            var epoch = Math.round(new Date().getTime() / 1000.0);
            var countDown = 30 - (epoch % 30);
            if (epoch % 30 === 0) {
                var newkey = $("#inputcode").val();
                newkey = newkey.replace(/\s*/g,"").replace(/[^a-zA-Z0-9]/g,"");
                if(newkey!=""){
                    var key = keyUtilities.generate(newkey);
                    $("#codenum").text(key);
                    $("#codetxt").text(newkey);
                    $("#copytip").text("验证码已更新，请点击按钮复制！");
                    $("#copytip").css("color","#ffb714");
                }
            }
            $('#codetime').text(countDown);
        };
		
		var getCode = function(){
			var newkey = $("#listToken").val();
			newkey = newkey.replace(/\s*/g,"").replace(/[^a-zA-Z0-9]/g,"");
			if(newkey!=""){
				var key = keyUtilities.generate(newkey);
				$("#codenum").text(key);
				$("#codetxt").text(newkey);
				$("#copytip").text("验证码已更新，请点击按钮复制！");
				$("#copytip").css("color","#ffb714");
				$("#output").text(newkey+"|" + key);
			}
		}

        return {
            init: init,
            // addAccount: addAccount,
            deleteAccount: deleteAccount,
			getCode: getCode
        };
    };
    
    exports.KeysController = KeysController;

})(typeof exports === 'undefined' ? this['gauth']={} : exports);