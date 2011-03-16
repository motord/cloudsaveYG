//vdisk.me
Hosts.vdisk = function uploadvdisk(file, callback) {
    var $appkey = 10550530;
    var $app_secret = '92d1b4870c03f44e7cbc3421dfa339d5';	
    
    function create_folder() {
        if (typeof localStorage.vdisk_token == 'undefined') {
            if (typeof localStorage.vdisk_account == 'undefined') {
                login(function () {
                    //function inside a function (passed to another function inside a function inside a function) inside a function inside a function
                    create_folder();
                });
            } else {
                get_token(function () {
                    create_folder();
                });
            }
        } else {
            xhr = new XMLHttpRequest();
            var fname = 'cloudsave';
            xhr.open('POST', URL_CREATE_DIR);
            xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
            xhr.send(params({token : localStorage.vdisk_token,
            	create_name : fname,
            	parent_name : '',
            	parent_id : 0
            }));
            xhr.onload = function () {
                console.log(xhr.responseText);
                var json = JSON.parse(xhr.responseText);
                console.log(json);
                if(json.err_code==0){
	                var fid = json.data.dir_id;
	                localStorage.vdisk_dir_id=fid;
	                console.log('folder ID', fid);
	                upload(fid);
                }else if(json.err_code==702){//invalid token
	                 get_token(function () {
	                    create_folder();
	                });
                }else if(json.err_code==6){//create_name is not unique
                	var fid = localStorage.vdisk_dir_id;
                	if(typeof fid == 'undefined'){
                	  	get_dir_id(function () {
		                    create_folder();
		                }); 
                	}else{
	                	console.log('folder ID', fid);
		                upload(fid);
	                }
                }
            }
        }
    }

    function params(obj){
      var str = [];
      for(var i in obj) str.push(i+'='+encodeURIComponent(obj[i]));
      return str.join('&');
    }
    
    function signature(account, password, time){
    	return Crypto.HMAC(Crypto.SHA256, "account="+account+"&appkey="+$appkey+"&password="+password+"&time="+time,$app_secret);
    }
    
    function get_token(stopforward) {
        xhr = new XMLHttpRequest();
        xhr.open('POST', URL_GET_TOKEN);
	 	var $timeNow = new Date().getTime();
		var $time = $timeNow.toString().substring(0,10);
		var $account = localStorage.vdisk_account;
		var $password = localStorage.vdisk_password;
        xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
        xhr.send(params({account : $account,
        	password : $password,
        	appkey : $appkey,
        	time : $time,
        	signature : signature($account, $password, $time),
        }));
        xhr.onload = function () {
	        console.log(xhr.responseText);
	        var json = JSON.parse(xhr.responseText);
	        console.log(json);
	        if(json.err_code==0){
	        	localStorage.vdisk_token=json.data.token;
	        	stopforward();
	        }
        }
    }

    function get_dir_id(stopforward) {
        xhr = new XMLHttpRequest();
        var fpath='/cloudsave/';
        xhr.open('POST', URL_GET_DIRID_WITH_PATH);
        xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
        xhr.send(params({token : localStorage.vdisk_token,
            	path : fpath
        }));
        xhr.onload = function () {
	        console.log(xhr.responseText);
	        var json = JSON.parse(xhr.responseText);
	        console.log(json);
	        if(json.err_code==0){
	        	localStorage.vdisk_dir_id=json.data.id;
	        	stopforward();
	        }
        }
    }

    function upload(folder) {
        var xhr = new XMLHttpRequest();
        xhr.open('POST', URL_UPLOAD_FILE);
        xhr.onload = function () {
            callback();
        }
        xhr.sendMultipart({
            token: localStorage.vdisk_token,
            dir_id: folder,
            cover: 'yes',
            file: file
        })
    }

    function login(stopforward) { //sort of opposite vaguely of callback

        function auth_token(url) {
            var token = url.match(/auth_token=([^\&]+)/)[1];
            localStorage.vdisk_token = token;
            console.log(localStorage.vdisk_token);
            stopforward();
        }

        var redirect = "hosts/sina/login.html";

        if (typeof chrome != 'undefined') {
            chrome.tabs.create({
                url: redirect
            }, function (tab) {
                var poll = function () {
                    chrome.tabs.get(tab.id, function (info) {
                        if (info.url.indexOf('auth_token') != -1) {
                            auth_token(info.url);
                            chrome.tabs.remove(tab.id);
                        } else {
                            setTimeout(poll, 100)
                        }
                    })
                };
                poll();
            })
        } else if (typeof tabs != 'undefined') {
            tabs.open({
                url: redirect,
                onOpen: function (tab) {
                    var poll = function () {
                        if (tab.url.indexOf('auth_token') != -1) {
                            auth_token(tab.url);
                            tab.close()
                        } else {
                            setTimeout(poll, 100)
                        }
                    };
                    poll();
                }
            })
        }
    }

    create_folder()
}