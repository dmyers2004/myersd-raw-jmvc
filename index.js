/**
 * jQuery MVC Framework for Client Side Interaction
 *
 * @package jQueryMVC
 * @license Creative Commons Attribution License http://creativecommons.org/licenses/by/3.0/legalcode
 * @link
 * @version 0.0.4
 * @author Don Myers donmyers@projectorangebox.com
 * @copyright Copyright (c) 2010
*/
/* MUST load jquery 1.4.2+ first */

var mvc = (mvc) || {};

/* base site url */
mvc.host = 'http://localhost'; /* WITHOUT trailing slash */

mvc.folder = '/jmvc-example/';  /* WITH trailing slash (or just slash if no folder) */

/* setup folders */
mvc.folders = {};

/* name of the folder containing the mvc javascript files WITH trailing slash */
mvc.folders.application = 'jmvc/';

/* end of basic configuration */

/* setup base controller */
mvc.base_url = mvc.host + mvc.folder;

/* location of root */
mvc.folders.root = mvc.folder + mvc.folders.application;

/* location of the controllers WITH trailing slash */
mvc.folders.controller = mvc.folders.root + 'controllers/';

/* location of the models WITH trailing slash */
mvc.folders.model = mvc.folders.root + 'models/';

/* location of the includes WITH trailing slash */
mvc.folders.include = mvc.folders.root + 'includes/';

/* location of the views WITH trailing slash */
mvc.folders.view = mvc.folders.root + 'views/';

mvc.config = {};

/* auto load everything including starting the router */
mvc.config.route = true;

/* auto create a permeant uuid for every user */
mvc.config.uuid = true;

/* auto prevent Default on events */
mvc.config.preventDefault = true;

/* in the attached javascript object the constructor is called the */
mvc.config.constructor = '__construct';

/* example var controller_jstorage_method_index = new function() { */

/* appended to the controller name in the controller js file */
mvc.config.controller = 'controller_';

/* appened to the method name in the contoller js file */
mvc.config.method = '_method_';

/* allow console output (if present) */
mvc.config.debug = true;

/* if a element has a method add this css cursor by default */
mvc.config.cursor = 'pointer';

/* name of the libraries to auto include */
mvc.config.include = ['mvc.events','mvc.model','mvc.form','third_party/jquery.tmpl','third_party/jstorage','third_party/base64','third_party/jquery.json-2.3'];

/* unique application key (setup automagically below) */
mvc.appid = 'app';

/* setup rest server settings for models and such */
mvc.rest = {};

/* location of the rest server from base url WITH trailing slash */
mvc.rest.url = mvc.base_url + 'restserver/';

/* the ajax settings */
mvc.ajax = {};

/* defaults */
mvc.ajax.http_auth = false;
mvc.ajax.auth_user = '';
mvc.ajax.auth_pw = '';

/* mvc ajax defaults */
mvc.ajax.options = {
  type: 'post', /* ajax default request method */
  dataType: '', /* request return type */
  async: false, /* leave this on */
  cache: false, /* should ajax requests be cached - should be false */
  timeout: 3000, /* we uses a few blocking ajax calls how long should we wait? */
  data: {} /* default data sent */
};

/* ajax returned responds */
mvc.ajax.responds = null;
mvc.ajax.error = {};

/* setup form validation (in jquery.mvcform.js file) */
mvc.validation = {};

/* append to the form element's action attribute action="/post/here" = url="/post/here_validate" - form element url if no URL provied */
mvc.validation.append2url = '_validate';

/* auto merge json on form validation pass or fail - this could be used to show errors etc... supplied in the returned JSON */
mvc.validation.merge = true;

/* If the form validates as passed do we auto submit it? */
mvc.validation.autosubmit = true;

/* setup views */
mvc.views = {};

/* view extension */
mvc.views.extension = '.tmpl';

/* let's find the controller and method */
mvc.params = window.location.href.replace(/[#|?].*$/,'').substr(mvc.base_url.length);
mvc.params = mvc.params.substr(0, mvc.params.lastIndexOf('.')) || mvc.params;

/* split this into segements */
mvc.segs = mvc.params.split('/');

/* default controller and method */
mvc.controller = (mvc.segs[0] === '' || mvc.segs[0] === undefined) ? 'index' : mvc.segs[0];
mvc.method = (mvc.segs[1] === '' || mvc.segs[1] === undefined) ? 'index' : mvc.segs[1];

/* convert all the dashes to underscores */
mvc.controller = mvc.controller.replace(/-/g,'_');

/* trim file extension if any */
mvc.method = mvc.method.substr(0, mvc.method.lastIndexOf('.')) || mvc.method;

mvc.get = {};
var parts = window.location.search.substr(1).split("&");
for (var i = 0; i < parts.length; i++) {
  var temp = parts[i].split("=");
  mvc.get[decodeURIComponent(temp[0])] = decodeURIComponent(temp[1]);
}

mvc.anchor = window.location.href.split('#')[1];

/* holds jquery "this" that called the function for function calls object (actually contains data as well)*/
mvc.event = null;
mvc.eventObject = null;

/* holds the data for function calls json */
mvc.data = null;

/* internal storage */
mvc.objs = {};
mvc.loaded = [];

/* load everything else */
jQuery.getScript(mvc.folders.include + 'mvc.core.js');
