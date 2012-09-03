/**
 * jQuery MVC Framework for Client Side Interaction
 *
 * @package jQueryMVC
 * @license Creative Commons Attribution License http://creativecommons.org/licenses/by/3.0/legalcode
 * @link
 * @version 0.0.4
 * @author Don Myers donmyers@projectorangebox.com
 * @copyright Copyright (c) 2010
 * requires jQuery 1.4.3+
*/

/*
console logging function if exists and debug is on
IE (no console) safe
Load it here this way it's available before the includes are loaded incase we want to log something
*/
mvc.log = function () {
  /* unlimited arguments */
  if (mvc.config.debug) {
    if (typeof window.console === 'object' && typeof window.console.log !== 'undefined') {
      for (var idx = 0; idx < arguments.length; idx++) {
        console.log(arguments[idx]);
      }
    }
  }
};

/*
mvc.attach(class_name);
parse class name attaching functions to elements
*/
mvc.attach = function(class_name) {

  if (window[class_name]) {
    var ctrlr = window[class_name];
    /* fire off construct */
    mvc.exec(ctrlr[mvc.config.constructor]);
    for (var elementid in ctrlr) {
      if (typeof(ctrlr[elementid]) === 'object') {
        for (var eventname in ctrlr[elementid]) {
          if (typeof(ctrlr[elementid][eventname]) === 'function') {
            /* data-mvc is now automagically attached via jquery 1.4.3+ */
            /* attach any events to matching classes and/or ids */
            jQuery('#' + elementid).mvcEvent(eventname,class_name + '.' + elementid + '.' + eventname + '();');
            jQuery('.' + elementid).mvcEvent(eventname,class_name + '.' + elementid + '.' + eventname + '();');
          }
        }
      }
    }
  }
}

/*
attach a even and data to a item
$("#id").mvcAction('click',function() { alert('welcome'); }, {});
event = click,mouseover,change,keyup
func = indexController.action1.click() or func = function() { alert('welcome'); };
optional
data = json object
*/
jQuery.fn.mvcAction = function (event, func, data) {
  if (data) {
    jQuery(this).mvcData(data);
  }
  jQuery(this).mvcEvent(event,func);
};

/*
var output = mvc.view('template',movies);

Get view template, compile it, and phrase it.
name = name of the template file to load - also used as the name of the compiled template
data = phrase into the template
*/
mvc.view = function (name,data) {
  // jQuery template stores them in .template[name] so let's see if there have one named?
  if (!jQuery.template[name]) {
    // get the template
    var template = mvc.request({url: mvc.folders.view + name + mvc.views.extension + '.js', dataType: 'html'});
    template = (typeof(template) === 'string') ? template : ' ';
    jQuery.template(name,template);
  }

  // phrase and render the template
  return jQuery.tmpl(name,data);
};

/*
replace
jQuery('#movieList2').mvcView('logic',movies);
*/
jQuery.fn.mvcView = function (name,data) {
  // phrase and render the template
  jQuery(this).html(mvc.view(name,data));
};

/*
load json properties into html based on matching selectors
matches on id,class,form element name
will also run scripts mvc_pre_merge and mvc_post_merge
*/
mvc.merge = function (json) {
  if (json) {
    mvc.exec(json.mvc_pre_merge);
    for (var property in json) { /* we are only using strings or numbers */
      if (typeof(json[property]) === 'string' || typeof(json[property]) === 'number' || typeof(json[property]) === 'boolean') {
        var value = json[property];

        /* match classes & ids */
        jQuery('.' + property + ',#' + property).html(value);

        /* match any form element names */
        /* hidden field */
        if (jQuery('[name=' + property + ']').is('input:hidden')) {
          jQuery('input[name=' + property + ']').val(value);
        } /* input text */
        if (jQuery('[name=' + property + ']').is('input:text')) {
          jQuery('input[name=' + property + ']').val(value);
        } /* input textarea */
        if (jQuery('[name=' + property + ']').is('textarea')) {
          jQuery('textarea[name=' + property + ']').val(value);
        } /* input radio button */
        if (jQuery('[name=' + property + ']').is('input:radio')) {
          jQuery('input[name=' + property + '][value="' + value + '"]').attr('checked', true);
        } /* input checkbox */
        if (jQuery('[name=' + property + ']').is('input:checkbox')) {
          jQuery('input:checkbox[name=' + property + ']').attr('checked', (value === 1 || value === true));
        } /* input select */
        if (jQuery('[name=' + property + ']').is('select')) {
          jQuery('select[name=' + property + ']').val(value);
        }
      }

    }
    mvc.exec(json.mvc_post_merge);
  }
};

/*
Getters
return complete mvc data object
var value = $("#selector").mvcData(); (returns object)

return specific value
var value = $("#selector").mvcData("age"); (return value or undefined)

Setters
$("#selector").mvcData({}); (clears it out)

$("#selector").mvcData("name","value");
*/
jQuery.fn.mvcData = function (name, value) {
    var temp;

    /* GET return Object if both empty */
    if (!name && !value) {
      return jQuery(this).data('mvc');
    }
    /* SET if name is a object */
    if (typeof(name) === 'object') {
      jQuery(this).data('mvc',name);
      return true;
    }
    /* GET if value is empty then they are asking for a property by name */
    if (!value) {
      var rtn;
      temp = jQuery(this).data('mvc');
      if (temp) {
        rtn = temp[name];
      }
      return rtn;
    }
    if (name && value) {
      /* SET if name & value set */
      temp = jQuery(this).data('mvc');
      if (temp) {
        temp[name] = value;
        jQuery(this).data('mvc',temp);
        return true;
      }
      return false;
    }
};

/*
Generic Event Set/Get


var events = $("#mvcClick").mvcEvent(); - get all the events

var bol = $("#mvcClick").mvcEvent('click'); - does it have this event?

$("#mvcClick").mvcEvent('click',{}); - clear click even

$("#mvcClick").mvcEvent({}); - clear all events

var func = function() { alert("Attached a new event"); };
$("#mvcClick").mvcEvent('mouseover',func); - attach a function

$('#mvcClick").mvcEvent('click',function() { alert('event') });

*/
jQuery.fn.mvcEvent = function (event, func) {
  var id;
  var events;

  if (typeof(event) === 'object' && !func) {
    /* SET clear all */
    jQuery(this).die().css('cursor', '');
    return true;
  }

  if (!event && !func) {
    /* GET return all events */
    id = this.selector;
    events = [];

    jQuery.each(jQuery(document).data('events').live, function (name,value) {
      if (value.selector === id) {
        if (event !== '' && value.origType === event) {
          events.push(value.origType);
        } else if (!event)  {
          events.push(value.origType);
        }
      }
    });

    return events;
  }

  if (event && !func) {
    /* GET does event exist */
    id = this.selector;
    events = [];
    jQuery.each(jQuery(document).data('events').live, function (name,value) {
      if (value.selector === id) {
        if (event !== '' && value.origType === event) {
          events.push(value.origType);
        } else if (!event)  {
          events.push(value.origType);
        }
      }
    });
    return (events.length !== 0);
  }

  if (event && typeof(func) === 'object') {
    /* SET clear function */
    jQuery(this).die(event);
    return true;
  }

  if (event && func) {
    /* SET event and function */
    jQuery(this).live(event,function (e) {
      if (mvc.config.preventDefault) {
        e.preventDefault();
      }
      mvc.event = jQuery(this);
      mvc.eventObject = e;
      var dd = jQuery(this).data('mvcdata');
      mvc.data = (!dd) ? {} : dd;
      mvc.exec(func);
    }).css('cursor', mvc.config.cursor);
    return true;
  }

};

/*
execute code
function or string
*/
mvc.exec = function (code) {
  if (code !== '' || code !== undefined) {
    var func = (typeof(code) === 'function') ? code : new Function(code);
    try {
      func();
    } catch (err) {
      mvc.log('MVC mvc.exec ERROR',err,code);
    }
  }
};

/*
client based redirect
*/
mvc.redirect = function (url) {
  window.location.replace(url);
};

/*
Does this object exist in the DOM?
if ($("#selector).exists) {
  do something
}
*/
jQuery.fn.exists = function() {
  return jQuery(this).length > 0;
};

/*
create a wrapper for $.postJSON(); - uses post instead of get as in $.getJSON();
*/
jQuery.extend({
  postJSON: function (url, data, callback) {
    return jQuery.post(url, data, callback, 'json');
  }
});

/*
More complete Ajax
$.mvcAjax({});
*/
mvc.request = function(settings) {
  settings = settings || {};
 
  /* clear errors an responds */
  mvc.ajax.responds = undefined;
  mvc.ajax.jqxhr = undefined;
  mvc.ajax.textstatus = undefined;
  mvc.ajax.errorthrown = undefined;
 
  /* setup a few defaults in here not in the config this can be overridden via settings */
  mvc.ajax.options.success = function(responds) {
    mvc.ajax.responds = responds;
  };
 
  mvc.ajax.options.error = function(jqXHR, textStatus, errorThrown) {
    mvc.ajax.jqxhr = jqXHR;
    mvc.ajax.textstatus = textStatus;
    mvc.ajax.errorthrown = errorThrown;
  };
 
  /* merge it all together */
  var ready = jQuery.extend({},mvc.ajax.options,settings);
 
  /* make request */
  jQuery.ajax(ready);
 
  /* return responds */
  return mvc.ajax.responds;
};

/*
load a external file
*/
mvc.load = function(file,async) {
  /* did we already load this js file? */
  if (mvc.loaded[file]) {
    return;
  }
  mvc.request({url: file + '.js', dataType: 'script', cache: true});
  mvc.loaded[file] = true;
};

/* external load a mvc model */
mvc.model = function(file) {
  mvc.load(mvc.folders.model + file);
  var x = mvc[file];
  return jQuery.extend(true,new x(), new mvcModel());
};

/*
this will make a copy of a object without the methods
which jack up some ajax calls and other stuff
*/
mvc.clone = function(obj) {
  var clone = {};
  for (var prop in obj) {
    if (obj.hasOwnProperty(prop)) {
      if (typeof(obj[prop]) === 'object') {
        clone[prop] = mvc.clone(obj[prop]);
      } else {
        clone[prop] = obj[prop];
      }
    }
  }
  return clone;
};

/* create unique id */
mvc.id = function (length,prefix,suffix) {
  prefix = (prefix) ? prefix : '';
  suffix = (suffix) ? suffix : '';
  var id = r = '';
  length = (length) ? length : 32;
  for (var i = 0; i<=(length  / 2) + 1;i++) {
    r = Math.floor((Math.random()*9999)+1)
    id = id + r.toString(16);
  }
  return prefix + id.substr(0,length).toLowerCase() + suffix;
};

/* When the page is fully loaded load the libraries and auto start the router if necessary */
jQuery(function() {
  /* let's start by loading the includes */
  for (var i=0, len = mvc.config.include.length; i<len; ++i) {
    mvc.request({url: mvc.folders.include + mvc.config.include[i] + '.js', dataType: 'script', cache: true, async: false });
  }

  /* 
   * create a unique application key
   * i realize this isn't super secret but it's javascript it's all client slide
  **/
  for (var i = 16; i >= 0; i--) {
    mvc.appid += (mvc.base_url + mvc.base_url).charCodeAt(i).toString(16);
  }

  /* set a uuid (user id) this is permanent once it's set */  
  if (mvc.config.uuid && typeof(jQuery.jStorage) == 'object') {
    mvc.uuid = jQuery.jStorage.get('uuid');
    if (!mvc.uuid) {
      mvc.uuid = mvc.id('32','uuid');
      jQuery.jStorage.set('uuid', mvc.uuid);
    }
  }
  
  jQuery(document).trigger('ready');

  if (mvc.config.route) {
    mvc.load(mvc.folders.controller + mvc.controller + '/' + mvc.method);
    mvc.attach(mvc.config.controller + mvc.controller + mvc.config.method + mvc.method);
    mvc.log(mvc);
  }
});
