/*
# Mantis - a php based bugtracking system

# Copyright (C) 2000 - 2002  Kenzaburo Ito - kenito@300baud.org
# Copyright (C) 2002 - 2011  MantisBT Team   - mantisbt-dev@lists.sourceforge.net

# Mantis is free software: you can redistribute it and/or modify
# it under the terms of the GNU General Public License as published by
# the Free Software Foundation, either version 2 of the License, or
# (at your option) any later version.
#
# Mantis is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# GNU General Public License for more details.
#
# You should have received a copy of the GNU General Public License
# along with Mantis.  If not, see <http://www.gnu.org/licenses/>.
 */

/*
 * Collapsible element functions
 */
var g_collapse_clear = 1;

// global code to determine how to set visibility
var a = navigator.userAgent.indexOf("MSIE");
var style_display;

if (a!= -1) {
	style_display = 'block';
} else {
	style_display = 'table-row';
}
style_display = 'block';

$(document).ready( function() {
	$('.collapse-open').show();
	$('.collapse-closed').hide();
	$('.collapse-link').click( function(event) {
		event.preventDefault();
		var id = $(this).attr('id');
		var t_pos = id.indexOf('_closed_link' );
		if( t_pos == -1 ) {
			t_pos = id.indexOf('_open_link' );
		}
		var t_div = id.substring(0, t_pos );
		ToggleDiv( t_div );
	});

	$('input[type=text].autocomplete').autocomplete({
		source: function(request, callback) {
			var fieldName = $(this).attr('element').attr('id');
			var postData = {};
			postData['entrypoint']= fieldName + '_get_with_prefix';
			postData[fieldName] = request.term;
			$.getJSON('xmlhttprequest.php', postData, function(data) {
				var results = [];
				$.each(data, function(i, value) {
					var item = {};
					item.label = $('<div/>').text(value).html();
					item.value = value;
					results.push(item);
				});
				callback(results);
			});
		}
	});

	$('a.dynamic-filter-expander').click(function(event) {
		event.preventDefault();
		var fieldID = $(this).attr('id');
		var targetID = fieldID + '_target';
		var viewType = $('#filters_form_open input[name=view_type]').val();
		$('#' + targetID).html('<span class="dynamic-filter-loading">' + translations['loading'] + "</span>");
		$.ajax({
			url: 'return_dynamic_filters.php',
			data: 'view_type=' + viewType + '&filter_target=' + fieldID,
			cache: false,
			context: $('#' + targetID),
			success: function(html) {
				$(this).html(html);
			}
		});
	});

	$('input.autofocus:first, select.autofocus:first, textarea.autofocus:first').focus();

	/*
	 * jQuery bug http://bugs.jquery.com/ticket/4283 prevents the check_all
	 * functionality from working when the Content-Type is set to
	 * application/xhtml+xml.
	 */
	var checkAllSelectors = '';
	$(':checkbox.check_all').each(function() {
		var baseFieldName = $(this).attr('name').replace(/_all$/, '');
		if (checkAllSelectors.length > 0) {
			checkAllSelectors += ', ';
		}
		checkAllSelectors += ':checkbox[name="' + baseFieldName + '[]"]';
	});
	if (checkAllSelectors.length > 0) {
		$(checkAllSelectors).click(function() {
			var fieldName = $(this).attr('name').replace(/\[\]/g, '');
			var checkedCount = $(this).closest('form').find(':checkbox[name="' + fieldName + '[]"]:checked').length;
			var totalCount = $(this).closest('form').find(':checkbox[name="' + fieldName + '[]"]').length;
			var allSelected = checkedCount == totalCount;
			$(this).closest('form').find(':checkbox[name=' + fieldName + '_all]').attr('checked', allSelected);
		});
		$(':checkbox.check_all').click(function() {
			var baseFieldName = $(this).attr('name').replace(/_all$/, '');
			$(this).closest('form').find(':checkbox[name="' + baseFieldName + '[]"]').attr('checked', $(this).is(':checked'));
		});
	}

	var stopwatch = {
		timerID: null,
		elapsedTime: 0,
		tick: function() {
			this.elapsedTime += 1000;
			var seconds = Math.floor(this.elapsedTime / 1000) % 60;
			var minutes = Math.floor(this.elapsedTime / 60000) % 60;
			var hours = Math.floor(this.elapsedTime / 3600000) % 60;
			if (seconds < 10) {
				seconds = '0' + seconds;
			}
			if (minutes < 10) {
				minutes = '0' + minutes;
			}
			if (hours < 10) {
				hours = '0' + hours;
			}
			$('input[type=text].stopwatch_time').attr('value', hours + ':' + minutes + ':' + seconds);
			this.start();
		},
		reset: function() {
			this.stop();
			this.elapsedTime = 0;
			$('input[type=text].stopwatch_time').attr('value', '00:00:00');
		},
		start: function() {
			this.stop();
			var self = this;
			this.timerID = window.setTimeout(function() {
				self.tick();
			}, 1000);
		},
		stop: function() {
			if (typeof this.timerID == 'number') {
				window.clearTimeout(this.timerID);
				delete this.timerID;
			}
		}
	}
	$('input[type=button].stopwatch_toggle').click(function() {
		if (stopwatch.elapsedTime == 0) {
			stopwatch.stop();
			stopwatch.start();
			$('input[type=button].stopwatch_toggle').attr('value', translations['time_tracking_stopwatch_stop']);
		} else if (typeof stopwatch.timerID == 'number') {
			stopwatch.stop();
			$('input[type=button].stopwatch_toggle').attr('value', translations['time_tracking_stopwatch_start']);
		} else {
			stopwatch.start();
			$('input[type=button].stopwatch_toggle').attr('value', translations['time_tracking_stopwatch_stop']);
		}
	});
	$('input[type=button].stopwatch_reset').click(function() {
		stopwatch.reset();
		$('input[type=button].stopwatch_toggle').attr('value', translations['time_tracking_stopwatch_start']);
	});

	$('input[type=text].datetime').each(function(index, element) {
		$(this).after('<input type="image" class="button datetime" id="' + element.id + '_datetime_button' + '" src="' + config['icon_path'] + 'calendar-img.gif" />');
		Calendar.setup({
			inputField: element.id,
			timeFormat: 24,
			showsTime: true,
			ifFormat: config['calendar_js_date_format'],
			button: element.id + '_datetime_button'
		});
	});


	$('.bug-jump').find('[name=bug_id]').focus( function() {
		var bug_label = $('.bug-jump-form').find('[name=bug_label]').val();
		if( $(this).val() == bug_label ) {
			$(this).val('');
			$(this).removeClass('field-default');
		}
	});
	$('.bug-jump').find('[name=bug_id]').blur( function() {
		var bug_label = $('.bug-jump-form').find('[name=bug_label]').val();
		if( $(this).val() == '' ) {
			$(this).val(bug_label);
			$(this).addClass('field-default');
		}
	});
	$('[name=source_query_id]').change( function() {
		$(this).parent().submit();
	});
	$('#project-selector').children('[name=project_id]').change( function() {
		$('#form-set-project').submit();
	});
	$('#project-selector').children('.button').hide();
	setBugLabel();

	$('input[type=checkbox]#use_date_filters').live('click', function() {
		if (!$(this).is(':checked')) {
			$('div.filter-box select[name=start_year]').attr('disabled', 'disabled');
			$('div.filter-box select[name=start_month]').attr('disabled', 'disabled');
			$('div.filter-box select[name=start_day]').attr('disabled', 'disabled');
			$('div.filter-box select[name=end_year]').attr('disabled', 'disabled');
			$('div.filter-box select[name=end_month]').attr('disabled', 'disabled');
			$('div.filter-box select[name=end_day]').attr('disabled', 'disabled');
		} else {
			$('div.filter-box select[name=start_year]').removeAttr('disabled');
			$('div.filter-box select[name=start_month]').removeAttr('disabled');
			$('div.filter-box select[name=start_day]').removeAttr('disabled');
			$('div.filter-box select[name=end_year]').removeAttr('disabled');
			$('div.filter-box select[name=end_month]').removeAttr('disabled');
			$('div.filter-box select[name=end_day]').removeAttr('disabled');
		}
	});

	/* For Period.php bundled with the core MantisGraph plugin */
	$('#dates > input[type=image].datetime').hide();
	$('#period_menu > select#interval').change(function() {
		if ($(this).val() == 10) {
			$('#dates > input[type=text].datetime').removeAttr('disabled');
			$('#dates > input[type=image].datetime').show();
		} else {
			$('#dates > input[type=text].datetime').attr('disabled', 'disabled');
			$('#dates > input[type=image].datetime').hide();
		}
	});

	$('#tag_select').live('change', function() {
		var tagSeparator = $('#tag_separator').val();
		var currentTagString = $('#tag_string').val();
		var newTagOptionID = $(this).val();
		var newTag = $('#tag_select option[value=' + newTagOptionID + ']').text();
		if (currentTagString.indexOf(newTag) == -1) {
			if (currentTagString.length > 0) {
				$('#tag_string').val(currentTagString + tagSeparator + newTag);
			} else {
				$('#tag_string').val(newTag);
			}
		}
		$(this).val(0);
	});

    // Re-format table headers on views
    $('table.my-buglist').each(function () {
        var $this = $(this),
            txt = $this.find('thead').find('td.form-title').html();

        $this.before($('<div class="header"></div>'))
        .prev().html( txt )
        .next().find('thead').hide();
    });
    
    // Enable sliding on headers
	$('div.header')
        .css('cursor', 'pointer')
        .bind('click', function () {
            $(this).next().toggle();        
        });
        
	// Toggle all sections
	/*
	$('td.form-title')
        .css('cursor', 'pointer')
        .bind('click', function () {
            $(this).parents('thead').next().toggle();        
        });
    	*/


	//SlideToggle for MyReports View
	//Uncomment to execute
	//toggleReports();

	//Add row highlighting to View Issues Page
	addRowHighlighting();
       
});

function setBugLabel() {
	var bug_label = $('.bug-jump-form').find('[name=bug_label]').val();
	var field = $('.bug-jump').find('[name=bug_id]');
	if( field.val() == '' ) {
		field.val(bug_label);
		field.addClass('field-default');
	}
}

/*
 * String manipulation
 */
function Trim( p_string ) {
	if (typeof p_string != "string") {
		return p_string;
	}

	var t_string = p_string;
	var t_ch = '';

	// Trim beginning spaces

	t_ch = t_string.substring( 0, 1 );
	while ( t_ch == " " ) {
		t_string = t_string.substring( 1, t_string.length );
		t_ch = t_string.substring( 0, 1 );
	}

	// Trim trailing spaces

	t_ch = t_string.substring( t_string.length-1, t_string.length );
	while ( t_ch == " " ) {
		t_string = t_string.substring( 0, t_string.length-1 );
		t_ch = t_string.substring( t_string.length-1, t_string.length );
	}

	return t_string;
}

/*
 * Cookie functions
 */
function GetCookie( p_cookie ) {
	var t_cookie_name = "MANTIS_" + p_cookie;
	var t_cookies = document.cookie;

	t_cookies = t_cookies.split( ";" );

	var i = 0;
	while( i < t_cookies.length ) {
		var t_cookie = t_cookies[ i ];

		t_cookie = t_cookie.split( "=" );

		if ( Trim( t_cookie[ 0 ] ) == t_cookie_name ) {
			return( t_cookie[ 1 ] );
		}
		i++;
	}

	return -1;
}

function SetCookie( p_cookie, p_value ) {
	var t_cookie_name = "MANTIS_" + p_cookie;
	var t_expires = new Date();

	t_expires.setTime( t_expires.getTime() + (365 * 24 * 60 * 60 * 1000));

	document.cookie = t_cookie_name + "=" + p_value + "; expires=" + t_expires.toUTCString() + ";";
}

function ToggleDiv( p_div ) {
	t_open_div = '#' + p_div + "_open";
	t_closed_div = '#' + p_div + "_closed";

	t_cookie = GetCookie( "collapse_settings" );
	if ( 1 == g_collapse_clear ) {
		t_cookie = "";
		g_collapse_clear = 0;
	}
	var t_open_display = $(t_open_div).css('display');
	$(t_open_div).slideToggle();

	if( $(t_closed_div).length ) {
		$(t_closed_div).toggle();
	}

	if ( t_open_display == "none" ) {
		t_cookie = t_cookie + "|" + p_div + ",1";
	} else {
		t_cookie = t_cookie + "|" + p_div + ",0";
	}

	SetCookie( "collapse_settings", t_cookie );
}

function setDisplay(idTag, state)
{
	if(!document.getElementById(idTag)) alert('SetDisplay(): id '+idTag+' is empty');
	// change display visibility
	if ( state != 0 ) {
		document.getElementById(idTag).style.display = style_display;
	} else {
		document.getElementById(idTag).style.display = 'none';
	}
}

function toggleDisplay(idTag)
{
	setDisplay( idTag, (document.getElementById(idTag).style.display == 'none')?1:0 );
}

/*
 * Add Toggle Functionality to MyReports View
 */

function toggleReports(){
	$('table.my-buglist').each(function(){

		//Get Current Header
		var currentHeader = $(this).children('thead').children('tr').children('td.form-title');

		//Hide Current Header
		currentHeader.hide();

		//Get Current Header's Contents
		var currentHeaderHtml = currentHeader.html();

		//Build New Header Contents
		var controlDiv = "<div class='MyViewControlLeft'></div>";
			controlDiv += "<div class='MyViewControl'>" + currentHeaderHtml + "</div>";
			controlDiv += "<div class='MyViewControlRight'></div>";

		//Add New Header On Top Of Report Table
		$(this).before($(controlDiv));

});

	//Wrap Report Table in Div, classed: Reports
	$('div.MyViewControl').next().next().wrap("<div style='cursor:pointer;display:block;' class='report' />");

	//Bind Click function to Each Report Tab
	$('div.MyViewControl').bind('click', function(){
	$(this).next().next('.report').slideToggle(300);

	});
}

/*
 * Highlights given table row
*/
var highlightSelectedRow = function(currentRow){
	$(currentRow).toggleClass('highlightedIssue');	//Toggle 'highlightedIssue' class
};

/*
 * Row Highlighting for Buglist Issues
*/
var addRowHighlighting = function(){
	var bugTable = $('table#buglist tbody');
	bugTable.delegate('tr'
			, 'hover'
			, function(){highlightSelectedRow(this)}
);
}

/*
 * Add Date pickers to Date Filter Menu
 */

var AddDatePickers = function(){

	//Get Filter Date Cells
	var dateFilterCell = $('td#do_filter_by_date_filter_target');
	var startDateCell = $('td#do_filter_by_date_filter_target table td').has('select[name="start_year"]');
	var endDateCell = $('td#do_filter_by_date_filter_target table td').has('select[name="end_year"]');

	//Input Label Element Strings
	var startDateInputFieldMarkup = "<input id='startDate' name='startDate' class='filterField' />";
	var endDateInputFieldMarkup = "<input id='endDate' name='endDate' class='filterField' />";

	//Replace Date Entry With Input Labels
	startDateCell.html(startDateInputFieldMarkup);
	endDateCell.html(endDateInputFieldMarkup);

	//Get Date Input Fields
	var startDateInput = $('input#startDate');
	var endDateInput = $('input#endDate');

	//Add date pickers
	startDateInput.datepicker();
	endDateInput.datepicker();

	//Retrieve Date Value's
	var startFilterDateVal = $('#startDate').val();
	var endFilterDateVal = $('#endDate').val();

	//Convert to legacy date format
	//var startFilterDate = new Date(startFilterDateVal);
	//var endFilterDate = new Date(startFilterDateVal);

}

var addControlButton = function(header){
	//Get Table Headers
	var headers = $('div.header :last-child');

	var ControlButtonMarkup = "<div class='ExpandCollapseButton' />";	

	//Add Control Button to Header
	headers.after(ControlButtonMarkup);
};
