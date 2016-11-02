<?php
/****
根据客户端提交的user_name和pno，分页查询出对应用户的订单
以JSON格式，形如：
{
	recordCount: 22,
	pageSize: 5,
	pageCount: 5,
	currentPage: 3,
	data: [{},{},{},{},{}]
}
****/
header('Content-Type: application/json');

$user_name = $_REQUEST['user_name'];
$pno = $_REQUEST['pno'];//要显示哪一页的记录

$pager = [
  'recordCount'=>0,			//总记录数
  'pageSize'=>5,			//页面大小
  'pageCount'=>0,			//总页数
  'currentPage'=>intval($pno), //当前页号
  'data'=>null				//当前页数据
];
$conn = mysqli_connect('127.0.0.1','root','','jd',3306);
$sql = "SET NAMES UTF8";  
mysqli_query($conn,$sql);

/***查询满足条件的总记录数***/
$sql = "SELECT COUNT(*) FROM jd_orders WHERE user_name='$user_name'";	  
$result = mysqli_query($conn,$sql);
$row = mysqli_fetch_assoc($result);
$pager['recordCount'] = intval($row['COUNT(*)']);//count函数返回的是一个字符串，需要解析为整数
$pager['pageCount'] = ceil($pager['recordCount']/$pager['pageSize']); //上取整计算总页面数量

/***查询当前页对应的数据,使用LIMIT***/
$start = ($pager['currentPage']-1)*$pager['pageSize']; //从哪条记录开始读取
$count = $pager['pageSize'];//一次最多读取多少行记录
$sql = "SELECT * FROM jd_orders WHERE user_name='$user_name' LIMIT $start,$count";
$orderResult = mysqli_query($conn,$sql);
$orderList = [];  //订单数组
while(($order=mysqli_fetch_assoc($orderResult))!==null){		
	/**为每个订单添加productList属性**/
	$order['productList'] = [];
	/**查询出当前订单对应的商品有哪些**/
	$oid = $order['order_id'];//订单编号
	$sql = "SELECT * FROM jd_products WHERE product_id IN (SELECT product_id FROM jd_order_product_detail WHERE order_id=$oid)";
	$productResult = mysqli_query($conn,$sql);
	while(($p=mysqli_fetch_assoc($productResult))!==null){
		$order['productList'][] = $p;
	}

	$orderList[] = $order;
}
$pager['data'] = $orderList;//当前页中的数据

//把待输出的数据编码为JSON格式，执行输出
echo json_encode($pager);
