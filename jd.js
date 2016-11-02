//当前登录的用户名
var loginUserName = null;

/**1 页面加载完成后，异步请求页头和页尾**/
$(function(){
  $('#header').load('header.php');
  $('#footer').load('footer.php');
})

/**2 点击“登录”按钮，异步提交登录信息**/
$('#bt-login').click(function(){
  //表单序列化	
  var requestData = $('#login-form').serialize();
  //异步提交：$.post  $.ajax
  $.post('data/1_login.php',requestData,function(data,msg,xhr){
    console.log('开始处理登录结果..');
    if(data.msg!=='succ'){  //登录失败
	  $('.modal-content .msg').html(data.reason);
	}else{  //登录成功
	  loginUserName = $('[name="user_name"]').val();
	  $('#welcome-msg').html('欢迎回来：'+loginUserName);
	  $('.modal').fadeOut();
	  loadOrders(loginUserName,1);//加载用户的订单信息
	  $('#myLoginBtn123').remove();
	}
  })
         
});


/**3 实现附加导航切换**/
$('.affix ul').on('click','li>a', function(e){			
  e.preventDefault();
  //切换a的父元素上.active
  $(this).parent().addClass('active').siblings('.active').removeClass('active');
  //切换右侧容器中的div
  $($(this).attr('href')).addClass('active').siblings('.active').removeClass('active');
});


/**4 加载当前登录用户的订单信息**/
function loadOrders(user_name, pno){
  //异步请求指定用户的订单信息
  //$.get  $.getJSON  $.ajax
  $.getJSON('data/2_order_select.php',{'user_name':user_name,'pno':pno},function(pager){
	console.log('开始处理订单数据..');
	console.log(pager); //分页对象
	/**填充订单TABLE**/
	$('#order-table tbody').empty();
	for(var i=0; i<pager.data.length; i++){
	  var order = pager.data[i];  //每个订单对应两个tr元素
	  var html = `
	  <tr>
		<td colspan="6">
		订单编号：${order.order_num}
		<a href="${order.shop_url}">${order.shop_name}</a>
		</td>
	  </tr>
	  <tr>
		<td> `;	 
	  
	  for(var j=0; j<order.productList.length; j++){
	    var p = order.productList[j];
		html += `<a href="${p.product_url}"><img src="${p.product_img}" title="${p.product_name}"></a>`;
	  } 

	  html += `	
		</td>
		<td>${order.user_name}</td>
		<td>
		  ￥${order.price}<br>
		  ${order.payment_mode}
		</td>
		<td>
		  ${order.submit_time.replace('T','<br>')}
		</td>
		<td>
		  ${order.order_state=='1'?'等待付款':(order.order_state=='2'?'等待发货':(order.order_state=='3'?'派货中':(order.order_state=='4'?'订单完成':'其它状态')))}
		</td>
		<td>
		  <a href="#">查看</a><br>
		  <a href="#">详细信息</a><br>
		  <a href="#">删除</a>
		</td>
	  </tr>
	  `;
	  $('#order-table tbody').append(html)
	}
	/**生成分页条**/
	$('.pager').empty();
	pager.currentPage-2>0&&$('.pager').append(`<li><a href="javascript:loadOrders('${user_name}',${pager.currentPage-2})">${pager.currentPage-2}</a></li> `);
	pager.currentPage-1>0&&$('.pager').append(`<li><a href="javascript:loadOrders('${user_name}',${pager.currentPage-1})">${pager.currentPage-1}</a></li> `);
	$('.pager').append(`<li class="active"><a href="#">${pager.currentPage}</a></li> `);
	pager.currentPage+1<=pager.pageCount&&$('.pager').append(`<li><a href="javascript:loadOrders('${user_name}',${pager.currentPage+1})">${pager.currentPage+1}</a></li> `);
	pager.currentPage+2<=pager.pageCount&&$('.pager').append(`<li><a href="javascript:loadOrders('${user_name}',${pager.currentPage+2})">${pager.currentPage+2}</a></li> `);
  });
}






/*  为header.php中的“登录”按钮绑定监听函数必须使用事件代理*/
$('#header').on('click','#myLoginBtn123', function(){
	$('.modal').fadeIn();
});
