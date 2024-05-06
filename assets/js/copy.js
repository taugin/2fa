//兼容手机端复制，复制class标签的内容，class唯一
function copyClassVal(copyValClass) {
	window.getSelection().removeAllRanges(); 
	var copyvalue = document.querySelector(copyValClass);
	var range = document.createRange();
	range.selectNode(copyvalue);
	window.getSelection().addRange(range);
	document.execCommand('copy');
	window.getSelection().removeAllRanges();
}

//兼容手机端复制，复制当前消息的内容
function copyMess(mess) {
    var input = document.createElement("input");
    input.value = mess;
    document.body.appendChild(input);
    input.select();
    input.setSelectionRange(0, input.value.length), document.execCommand('Copy');
    document.body.removeChild(input);
}

//简单的复制，支持电脑，部分手机浏览器无法使用
function copyOnlypc(mess){
    navigator.clipboard.writeText(mess);
}