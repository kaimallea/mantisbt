<?php
# MantisBT - A PHP based bugtracking system

/**
 * MantisBT Core API's
 */
require_once( 'core.php' );
require_api( 'authentication_api.php' );
require_api( 'compress_api.php' );
require_api( 'config_api.php' );
require_api( 'current_user_api.php' );
require_api( 'filter_api.php' );
require_api( 'gpc_api.php' );
require_api( 'html_api.php' );
require_api( 'lang_api.php' );
require_api( 'print_api.php' );
require_api( 'project_api.php' );
require_api( 'user_api.php' );

require_js( 'bugFilter.js' );
require_css( 'status_config.php' );

auth_ensure_user_authenticated();

$f_page_number		= gpc_get_int( 'page_number', 1 );

$t_per_page = null;
$t_bug_count = 1;
$t_page_count = 1;

//Result Container
$JsonResult = null;

//Get user request
$request = $_GET['req'];


//Call corresponding function
switch ($request) {
    case "bugs":
	 $amount = $_GET['amount'];
        $JsonResult = GetBugs($amount);
        break;
    case "bug":
	 $id = $_GET['id'];
        $JsonResult = GetBug($id);
        break;
    case "count":
       $JsonResult = GetBugCount();
        break;
}

#Get Rows
function GetBugs($n){
	$rows = filter_get_bug_rows( $f_page_number, $n, $t_page_count, $t_bug_count, null, null, null, true );
	return $rows;
}

#Get Bug Count
function GetBugCount(){
	return filter_get_bug_count();
}

#Get Bug
function GetBug($id){


	//Get all bugs
	$rows = filter_get_bug_rows( $f_page_number, $t_per_page, $t_page_count, $t_bug_count, null, null, null, true );
	
	$specific_bug = null;
	$i = 0;
	
	//Find bug that matches id
	foreach ($rows[0] as $bug) {
			$specific_bug = $bug['a'];
	    	$i++;	
	}
	return $specific_bug;
}

$t_bugslist = Array();
$t_users_handlers = Array();
$t_project_ids  = Array();
$t_row_count = count( $rows );
for($i=0; $i < $t_row_count; $i++) {
	array_push($t_bugslist, $rows[$i]->id );
	$t_users_handlers[] = $rows[$i]->handler_id;
	$t_project_ids[] = $rows[$i]->project_id;
}


//Output JSON Result
echo json_encode($JsonResult);

?>
