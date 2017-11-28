/*feature list
	-night mode (toggleable)
	-add picture of user's fourth following to match followers
	-excessively long posts are collapsed and can be seen with hover
	-accurate number of messages is displayed
	-senders of unread messages are displayed in popup when icon is hovered
	-accurate number of schoolworks is displayed
	-names of to-do schoolworks are displayed in popup when icon is hovered
	-display popup containing precise time posted when time is hovered
	-page title reflects number of notifications
	-notifications display on hover
	-avatars are shown as squares
	-information about notifications is displayed when they are hovered
	-fix sidebar in place
	-add option to disable HTML in messages
	-add ability to reorder navigation items and items on the right
	-play "ding" when you get a notification
	-menu of group actions on hover

*/
/*ToDo List
	-pinned posts
	-3D mode

*/
/*
	Credits:
		Derek Nobbe
		Kent Wilson
		Kevin Koury
		Henry Lipinski
		Nick Hammerstrom
		Dustin Laker
		Butch Laker
*/
var ting = chrome.extension.getURL('ting.wav');
var volumeOn = chrome.extension.getURL('images/on.svg');
var volumeOff = chrome.extension.getURL('images/off.svg');
var night;
var stop = false;
var stopCounter = 0;
var htmlDisabled;
var muted = false;
chrome.storage.sync.get('html',function(d){
	htmlDisabled = d['html'];
});
//check if night mode is selected on initial page load
chrome.storage.sync.get('night',function(d){
	isNight = d['night'];
	if(isNight){
		nightTime();
	}
});
chrome.runtime.sendMessage({greeting: "hello"}, function(response) {
  	console.log(response.farewell);
  	alert('swoop');
});
var toAppend;
var docTitle;

function eventFire(el, etype){
  if (el.fireEvent) {
    el.fireEvent('on' + etype);
  } else {
    var evObj = document.createEvent('Events');
    evObj.initEvent(etype, true, false);
    el.dispatchEvent(evObj);
  }
}

//var blinkIcon = chrome.extension.getURL('images/blink.png');
switch(window.location.href.split('.com')[1].substr(0,6)){
	case '/users':
		//add fourth following for symmetry's sake
		$.get(window.location.href+'/following', function(data){
			var following = $(data).find('.user-avatar');
			var links = $(data).find('h4 a');
			var fourthLink = $(links[4]).attr('href');
			var fourthFollowingUrl = $(following[3]).css('background-image').replace('url(','').replace(')','');
			$('.l-profile__following ul').append('<a href="'+fourthLink+'"<li src="'+fourthFollowingUrl+'"><img height="50" class="avatar" src="'+fourthFollowingUrl+'" width="50"></li>');
		});
	break;

	case '/conve':
		//Nick's feature
		$('.section').first().click();


		var elemCounter = 0;
		var elemCount;
		var bodyCount = 0;
		var insertedHandler = function(){
			elemCount = $('.body p:nth-child(1)').length;
			$('.body p:nth-child(1)').each(function(){
				if(elemCounter > elemCount){
					return false;
				}
				elemCounter++;
			});
			if(htmlDisabled){
				bodyCount = 0;
				$('.message').children('.body').each(function(){
					$(this).find('*').not('.message-attachments').each(function(){
						if(bodyCount > elemCount+10){
							return false;
						}
						bodyCount++;
						$(this).html($(this)[0].outerHTML.replace(/<br>|<\/p>|<p>|[<>]/g, function(x) {
							return {
								'<br>':'&#10',
								'<p>':"",
								'</p>':"",
								'<': '&lt;',
								'>': '&gt;'
							}[x];
						}));
					});
				});
			}

		}
		//replace image urls with the image itself
		$('#content-container').bind('DOMNodeInserted',insertedHandler);
		//cycle through html tags
		var cycler = 0;
		var htmlTag;
		var cursorPos;
		jwerty.key('cmd+I',function(){

			switch(cycler){
				case 1:
					htmlTag = '<img src="">';
					cursorPos = htmlTag.indexOf('"')+1;
					break;
				case 2:
					htmlTag = '<p style=""></p>';
					cursorPos = htmlTag.indexOf('>')+1;
					break;
				case 3:
					htmlTag = '<marquee></marquee>';
					cursorPos = htmlTag.indexOf('>')+1;
					cycler = 0
					break;
			}
			cycler++;
			$('#content').focus().html(htmlTag);
			document.getElementById('content').setSelectionRange(cursorPos,cursorPos);
		});
		jwerty.key('cmd+.',function(){
			$('.button.right').click();
		});
		break;
	case '/activ':
		var collapsePost = function(){
			var postContent;
			$('.post-content').each(function(){
				if($(this).height()>400){
					postContent = $(this).find('.post, .attachment-container');
					if($(this).find('.toShow').length == 0){
						$(this).find('.post-info').append('<p class="toShow">[Hover to show]</p>');
					}
					postContent.hide();
					$(this).hover(function(){
						$(this).find('.toShow').hide();
						postContent.slideDown('fast');
					}).mouseleave(function(){
						postContent.slideUp('fast',function(){
							$(this).clearQueue();
						});
						$(this).find('.toShow').show();

					});
				}
			});
		}
		//hide contents of posts added later when they exceed 400px in height
		$('.posts').bind('DOMNodeInserted',collapsePost);
		//hide contents of posts greater than 400px in height
		$('li.post').each(collapsePost);

		//show quick menu on hover of group name in activity
		hoverMenu();
	break;
}
function hoverMenu(){
			$('#list-of-groups li').hover(function(){
				var link = $(this).find('a.group-links:first').attr('href');
				var groupID = link.split('---')[1];
				$(this).prepend('<div class="class_wrap"><ul class="horizontal-nav class_pop"><a href="'+link+'"><li class="nav-button">Home</li></a><a href="'+link+'/group_wallposts"><li class="nav-button">Announcements</li></a><a href="'+link+'/group_discussions"><li class="nav-button">Discussions</li></a><a href="/chat/new?chat_type=group&amp;group='+groupID+'"><li class="nav-button">Chat</li></a><a href="'+link+'/group_pages"><li class="nav-button">Pages</li></a><a href="'+link+'/resources"><li class="nav-button">Resources</li></a><a href="'+link+'/events"><li class="nav-button">Calendar</li></a><a href="'+link+'/users"><li class="nav-button"><span id="last_one">Members</span></li></a></ul></div>');
				$('.class_pop li').mouseleave(function(){
					$(this).addClass('shrink').delay(500).queue(function(){
						$(this).removeClass('shrink');
						$(this).dequeue();
					});
				});
			}, function(){
				$('.class_wrap').remove();
			});
		}
console.log($('#list-of-groups'));
//display accurate number of schoolworks
var assigs = '';
var assigCount = 0;
$.get('http://mybigcampus.com/schoolwork/to_do',function(d){
	var schoolworks = $(d).find('.schoolwork-name');
	$(schoolworks).each(function(){
		assigs += '<a href="'+$(this).closest('a').attr('href')+'"><li>'+$(this).html()+'</li></a>';
		assigCount++;
	});
	assigCount == 0 ? $('#schoolwork-number').hide() : $('.schoolwork').append('<span id="schoolwork-number"><span>'+assigCount+'</span></span>');
});
//show accurate number of messages
var numUnread;
function checkMessages(){
	numUnread = 0;
	$.get('http://mybigcampus.com/conversations',function(d){
		var sections = $(d).find('.section');
		var unread = $(sections).find('.unseen-messages-display');

		$(unread).each(function(){
			numUnread += parseInt($(this).html());
		});
		console.log(numUnread);
		if(numUnread == 0){
			$('#messages-number span').hide();
			console.log('seeya');
		}else{
			if($('#messages-number').length == 0){
				$('.messages a').first().after('<span id="messages-number"><span></span></span>');
			}
			$('#messages-number span').html(numUnread);
		}
	});
}
checkMessages();
//show sender(s) of messages when message icon is hovered
if(window.location.href.split('.com')[1].substr(0,6) !== '/conve'){
	$('.messages').hover(function(){
		var unreadArr = [];
		var messages;
		$.get('http://mybigcampus.com/conversations',function(d){
			messages = '';
			var sections = $(d).find('.section');
			$(sections).each(function(){
				if($(this).find('.unseen-messages-display').html() != '0'){
					unreadArr.push($(this).find('h4'));
				}
			});
			$(unreadArr).each(function(){
				messages +='<li>'+$(this).html().split(/\n/g)[1]+'</li>';
			});
			messages.replace(', me','');
			numUnread > 0 && $('.icon-nav-messages').after('<div class="popout_container"><ul class = "popout" id="messages_list">'+messages+'</ul></div>');
		}).done(function(){
			$('.popout_container').show()
		});
	},function(){
		$('.popout_container').remove();
	});
}
//show schoolworks when icon is hovered
$('.icon-nav-schoolwork').hover(function(){
	assigs.length > 0 && $('.icon-nav-schoolwork').after('<div class="popout_container" id="schoolwork_popout"><ul class = "popout">'+assigs+'</ul></div>');
	$('.popout_container').fadeIn(300);
},function(){
	$('.popout_container').add('.schoolwork').mouseleave(function(){
		$('.popout_container').fadeOut(300, function(){
			$('#schoolwork_popout').remove();
		});
	});
});



//display precise time when item was posted on hover of time
$(document).on('mouseenter','.date-time',function(){
		var offset = new Date().getTimezoneOffset()/60;
		var x = $(this).data('utc');
		var y = x[x.indexOf(':')-2]+x[x.indexOf(':')-1];
		var z = (parseInt(y)-offset);

		var a = ((z + 11) % 12 + 1);
		x = x.replace(' '+y+':',' '+a+':');
		if(z<0){
			z = 24 +z;
			var date = x[x.indexOf(',')-2]+x[x.indexOf(',')-1];
			var newDate = parseInt(date) - 1;
			newDate += ''
			if(newDate.length == 1){
				newDate  = '0'+newDate;
			}
			x = x.replace(date+',',newDate+',');
		}
		var ampm = (parseInt(z) >= 12) ? 'pm' : 'am';
		$(this).after('<div class="time_posted">'+x+ampm+'</div>');
		$('.time_posted').hide();
		$('.time_posted').fadeIn(300).css('display','inline-block');
	}).on('mouseleave','.date-time',function(){
		$('.time_posted').fadeOut(300).remove();
	});

$(document.getElementsByClassName('avatar-thumb-image')[1]).wrap('<a href='+$('#top-bar-user-menu ul li:nth-child(3) a').attr('href')+'></a>');
$(document).ready(function(){

	docTitle = document.title;
	//check notifications and title to number of notifications if # of notifications > 0 and not undefined
	var notifsNum = $('#notifications-link-number').html();
	document.title =  (notifsNum == '0' || notifsNum == undefined) ? docTitle : notifsNum+' - '+docTitle;
	//display notifications when notification number is hovered
	var notifs = $('#drop-notifications');
	$('#notifications-link').add(notifs).hover(function(){
		$('#notifications-link').removeAttr('href');
		eventFire(document.getElementById('notifications-link'),'click');
		$(notifs).css({
			'display':'block',
			'margin-top':'-7px',
			'position':'absolute',
			'box-shadow':'5px 5px 30px #837E7C'
		});
		//display relevant info when notification is hovered (in progress)
		$('.seen-true').hover(function(){
			$('.popout_container').remove();
			var relevant = $(this);
			var nameOfNotif = $(this).find('.name').html();
			var popContent = 'Could not be found';
			var linkTo = $('a',this).attr('href');
			$.get('http://mybigcampus.com'+linkTo,function(d){
				if(linkTo.indexOf('conversations')>-1){
					var messageId = linkTo.replace('/conversations?id=','conversation_li_');
					popContent = $(d).find('#'+messageId).find('.message').html().replace(/^\s*[\r\n]/gm, '');
				}else if(linkTo.indexOf('discussion')>-1 || linkTo.indexOf('group_wallposts')>-1){
					popContent = $(d).find('.name:contains('+nameOfNotif+')').parent().parent().find('.post').html();
				}else if(linkTo.indexOf('user_wallposts')>-1){
					popContent = $(d).find('.name a:contains('+nameOfNotif+')').parent().parent().parent().find('.comment').html();
				}else if(linkTo.indexOf('schoolwork')>-1){
					if(linkTo.indexOf('result') == -1){
						popContent = $(d).find('.assignment-overview__details li').html()+'<br/>'+$(d).find('.assignment-overview__details li:nth-child(2)').html();
					}else{
						if($(d).find('.schoolwork-grade-circle p').html() !== undefined){
							popContent = $(d).find('.schoolwork-grade-circle p').html()+' '+$(d).find('.schoolwork-grade-circle h4').html();
						}else{
							popContent = 'Your teacher has chosen not to show results for this schoolwork';
						}
					}
				}

			}).done(function(){
				if(popContent == undefined){
					popContent = 'Could not be found';
				}
				$('.popout_container').remove();
				$('.notifications').after('<p class="popout_container" id="notif_popout">'+popContent+'</p>');
				$('#notif_popout').show();
				$('#notif_popout').css('margin-top','-='+$('.notifications').css('height')+'px');

			});


		},function(){
			$('.popout_container').remove();
		});

	}).mouseleave(function(){
		eventFire(document.getElementById('notifications-link'),'click');
		$('.popout_container').remove();
	});
	//set title to number of notifications
	var oldNotifs = parseInt($('#notifications-link-number').html());
	$('#notifications-link-number').bind('DOMSubtreeModified',function(){
		if($(this).html() !== '0'){
			document.title = $(this).html()+' - '+ docTitle;
			if($(this).html() > oldNotifs){
				!muted && playSound(ting);
				oldNotifs++;
				checkMessages();
			}
		}else{
			document.title = docTitle;
		}
	});
});

function playSound(soundFile){
	$('#toggle-create-drawer-link').after('<audio id="ding" autoplay><source src="'+soundFile+'"type=audio/wav></audio>');
	setTimeout(function(){
		$('#ding').remove();
	},2000);
}
//night mode

$('#top-bar-user-menu ul li:nth-child(3)').after('<a><li id="night_toggle">Toggle Night Mode</li></a>').after('<a><li id="html_toggle">Toggle HTML in Messages</li></a>').after('<a><li id="edit_toggle">Edit Layout</li></a>');
$('#html_toggle').click(function(){
	htmlDisabled = !htmlDisabled;
	chrome.storage.sync.set({'html':htmlDisabled},function(){
		location.reload();
	});
});

$('#night_toggle').click(function(){
	isNight = !isNight;
	chrome.storage.sync.set({'night':isNight},function(){
		chrome.storage.sync.get('night',function(d){
			if(d['night']){
				nightTime();
			}else{
				dayTime();
			}
		});
	});
});
var driveHeight = $('.drive').css('height');
var driveWidth = $('.drive').css('width');
var nightClasses = $('*').not('#content-container,.post, .posts, .l-activity__main, .l-activity, .wallpost-form, .shoutbox, .comments, .l-topbar__content, .l-topbar__title, .mbc-logo, .mbc-logo a, l-topbar__title li, .comment-post, .comment div, #notifications-link-number, .button--notifications, .comment, .user-info, .name, .date-time, .yesd, .abuse, .name a, .yesd a, .abuse a, .abuse a i, .yesd a i, .actions-delete, .actions-delete a, .actions, .flag, .group h3, .group h3 a');
var eveningClasses = $('#content-container, .comments, .comment-post, .comment div, .attachment-container, #notifications-link');
function nightTime(){
	$('<div class="patch night" id="activity_patch"></div>').insertAfter('.l-nav__sections');
	var navSec = $('.l-nav__sections');
	$('#activity_patch').css({'width': navSec.width()});
	if(window.location.href.split('.com')[1].substr(0,6) =='/schoo'){
		$('<div class="night patch" id="schoolwork_patch"></div>').insertBefore('#new-schoolwork-left-nav');
	}
	var inPro = $('.turned-in');
	$('#schoolwork_patch').css({'width':inPro.width()+20});

	$('*').addClass('white');
	eveningClasses.addClass('evening');
	nightClasses.addClass('night');
	night=true;
	$(document).bind('DOMNodeInserted',function(e){
		$('*').addClass('white');
		$(e.target).find('*').each(function(){
			if(!$(this).is('#content-container,.post, .posts, .l-activity__main, .l-activity, .wallpost-form, .shoutbox, .comments, .l-topbar__content, .l-topbar__title, .mbc-logo, .mbc-logo a, l-topbar__title li, .comment-post, .comment div, #notifications-link-number, .button--notifications, .comment, .user-info, .name, .date-time, .yesd, .abuse, .name a, .yesd a, .abuse a, .abuse a i, .yesd a i, .actions-delete, .actions-delete a, .actions, .flag, .group h3, .group h3 a')){
				$(this).addClass('night');
			}else if($(this).is('#content-container, .comments, .comment-post, .comment div, .attachment-container, #notifications-link')){
				$(this).addClass('evening');
			}
		});
	});
}
function dayTime(){
	$(document).unbind('DOMNodeInserted');
	$('.patch').remove();
	$('*').removeClass('white');
	$('.evening').removeClass('evening');
	$('.night').removeClass('night');
	night=false;
}

//customized pages
function editMode(){
	$('#toggle-create-drawer-link').parent().after('<li class="divider" id="save_divider"></li><li class="save_li"><button id="save_changes">Save Changes</button></li>');
	var draggedElem;
	$('#nav-sections .list--unstyled').sortable({
		start:function(e,ui){
			elem = ui.helper;
			ui.helper.addClass('material white_back');
		},
		stop:function(e,ui){
			elem.removeClass('material white_back');
		}
	}).addClass('editable');
	$('.l-activity__aside').sortable({
		start:function(e,ui){
			elem = ui.helper;
			ui.helper.addClass('material white_back');
		},
		stop:function(e,ui){
			elem.removeClass('material white_back');
		}
	}).addClass('editable');
	$('#save_changes').click(function(){
		saveChanges();
	});

}
function saveChanges(){
	var navOrder = [];
	var asideOrder = [];
	$('#nav-sections li').each(function(){
		navOrder.push($(this).find('i').attr('class').replace('white night',''));
	});
	$('.l-activity__aside > div').each(function(){
		if($(this).hasClass('school-announcements')){
			asideOrder.push('school-announcements');
		}else if($(this).hasClass('activity-filter-container')){
			asideOrder.push('activity-filter-container');
		}else{
			asideOrder.push('activity-bob');
		}
	});
	chrome.storage.sync.set({
		'navOrder':navOrder,
		'asideOrder':asideOrder
	},function(){
		return false;
	});
	$('#save_divider, #save_changes').remove();
	$('#edit_toggle').parent().show();
	$('.editable').removeClass('editable');
	$('#nav-sections .list--unstyled').sortable({
		cancel:"#nav-sections .list--unstyled"
	});
}
//alert mute
var volumeSource;
var volumeCallback = function(){
	muted = !muted;
	chrome.storage.sync.set({
		'muted':muted
	},function(){
		if(muted){
			$('#volumeToggle').attr('src',volumeOff);
		}else{
			$('#volumeToggle').attr('src',volumeOn);
		}
	});
}
//interpret customizations and change page to reflect them
chrome.storage.sync.get(['navOrder','asideOrder','muted'],function(data){
	$(data['navOrder']).each(function(i){
		$('.'+data['navOrder'][i]).each(function(){
			if($(this).siblings('span').length > 0){
				$(this).closest('li').appendTo('#nav-sections ul');
			}
		});
	});
	$('.l-activity__aside > div').each(function(i){
		$('.'+data['asideOrder'][i]).appendTo('.l-activity__aside');
	});
	muted = data['muted'];
	volumeSource = muted ? volumeOff : volumeOn;
	$('.button-quicklinksmbc').before('<img id="volumeToggle" src="'+volumeSource+'"/>');
	$('#volumeToggle').click(volumeCallback);
});


$('#edit_toggle').click(function(){
	editMode();
	$(this).parent().hide();
});
