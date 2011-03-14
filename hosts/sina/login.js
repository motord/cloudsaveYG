 /**
 * @vDisk API Basic
 *
 * @version 1.0
 *
 * @author putaoshu@126.com
 *
 * @update 2011-2-26 --> 2011-3-2
 */
 
var TOKEN;

/**
 * 获得token
 *
 * @param string $account
 * @param string $password 
 * @param string $app_type 可选参数, 如:$app_type=sinat (注意: 目前支持微博帐号)
 *
 * @return array 
 *
 * @author putaoshu
 *
*/
function get_token($account,$password,$appType){
	var $account = $account;
	var $password = $password;
	var $app_type=null;
	
	if ($appType) $app_type='sinat';

	var $appkey = 10550530;
	var $app_secret = '92d1b4870c03f44e7cbc3421dfa339d5';	

	var $timeNow = new Date().getTime();
	var $time = $timeNow.toString().substring(0,10);//10位

	var signatureTemp = "account="+$account+"&appkey="+$appkey+"&password="+$password+"&time="+$time;

	signatureTemp = Crypto.HMAC(Crypto.SHA256,signatureTemp,$app_secret);//SHA256

	var $param  = {
		account: $account,
		password: $password,
		appkey: $appkey,
		time: $time,
		signature:signatureTemp,
		app_type:$appType
	};
	$.ajax({
		url : URL_GET_TOKEN,
		type: 'post',
		dataType : "json",
		data : $param,   
		success : function(data){
			var dataContent  = [];
			$.each(data,function(i,value){
				 dataContent[i]=value;
			//	$.cookie('vdiskToken',data[i].token,{expires:7,path: '/'});//cookie保留7天
			})
			if ($('#loginTips')) loginCallback(dataContent);
//			if ($('#uploadTips')) uploadCallback(dataContent);
		},
	});

}

function loginCallback(dataContent){
	//error提示
	if (dataContent.err_code != 0){
		$('.tips').show().html('您的帐号或密码有错,请重试');
//	     $('#loginTips').show().html(dataContent.err_code+','+dataContent.err_msg);
	}else{
		saveId();
		$('#loginTips').show().html('<span style="color:green">登录中...</span>');
		window.location.href = 'login.html?auth_token='+dataContent.data.token;
	}
}
//保存账号和密码
function saveId(){
	localStorage.vdisk_account = $('#account').val();
	localStorage.vdisk_password = $('#password').val();
}

