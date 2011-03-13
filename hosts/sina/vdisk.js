//vdisk.me

Hosts.vdisk = function uploadvdisk(file, callback){
  function create_folder(){
    xhr = new XMLHttpRequest();
    var fname = 'cloudsave';
    xhr.open('POST', URL_CREATE_DIR);
    xhr.send('token='+localStorage.vdisk_token+
		    '&create_name='+fname+
    		'&parent_name=&parent_id=0');
    xhr.onload = function(){
      var json=JSON.parse(xhr.responseText);
      console.log(json);
      
/*
      if(xhr.responseText.indexOf('not_logged_in') != -1){
        login(function(){
          //function inside a function (passed to another function inside a function inside a function) inside a function inside a function
          create_folder();
        });
      }else{
        var fid = xhr.responseXML.getElementsByTagName('folder_id')[0].firstChild.nodeValue;
        console.log('folder ID', fid);
        upload(fid);
      }
*/
    }
  }
  
  
  function upload(folder){
    var xhr = new XMLHttpRequest();
    xhr.open('POST', URL_UPLOAD_FILE);
    xhr.onload = function(){
      callback();
    }
    xhr.sendMultipart({
      share: 1,
      file: file
    })
  }
  
  function login(stopforward){ //sort of opposite vaguely of callback

    function auth_token(url){
      var auth = url.match(/auth_token=([^\&]+)/)[1];
      localStorage.vdisk_auth = auth;
      console.log(localStorage.vdisk_auth, localStorage.vdisk_ticket);
      stopforward();
    }
  
      var redirect = "hosts/sina/login.html";
      
      if(typeof chrome != 'undefined'){
        chrome.tabs.create({
          url: redirect
        }, function(tab){
          var poll = function(){
            chrome.tabs.get(tab.id, function(info){
              if(info.url.indexOf('auth_token') != -1){
                auth_token(info.url);
                chrome.tabs.remove(tab.id);
              }else{
                setTimeout(poll, 100)
              }
            })
          };
          poll();
        })
      }else if(typeof tabs != 'undefined'){
        tabs.open({
          url: redirect,
          onOpen: function(tab){
            var poll = function(){
              if(tab.url.indexOf('auth_token') != -1){
                auth_token(tab.url);
                tab.close()
              }else{
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
