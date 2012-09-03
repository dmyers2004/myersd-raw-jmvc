/**
 * jQuery MVC Framework for Client Side Interaction
 *
 * @package jQueryMVC
 * @license Creative Commons Attribution License http://creativecommons.org/licenses/by/3.0/legalcode
 * @link
 * @version 0.0.4
 * @author Don Myers donmyers@projectorangebox.com
 * @copyright Copyright (c) 2010
 * 
 * REQUIRES base64.js - if REST basic auth used
*/

mvcModel = function() {
  this._internal_id = mvc.uuid();
  this.f__clear();
};

mvcModel.prototype.f__clear = function() {
  this._data = {};
  this._record = {};
  this._records = [];
  this._index = 0;
  this._error = '';
  this._error_no = 0;
  this._self = undefined;
  if (this._fields) {
    for (var i = 0; i < this._fields.length; i++) {
      this[this._fields[i]] = undefined;
    }
  }
};

mvcModel.prototype.f__data = function() {
  var data = {};
  for (var i = 0; i < this._fields.length; i++) {
    data[this._fields[i]] = this[this._fields[i]];
  }
  return data;
}

/* select / get */
mvcModel.prototype.r_get = function(url) {
  url = (url === undefined && this[this._primary] !== undefined) ? '/' + this[this._primary] : url;
  url = (url === undefined) ? '' : url;
  this.f__clear();
  this.f__ajax(url);
};

/* insert unless there is a id then update */
mvcModel.prototype.r_post = function() {
  this.f__ajax('','post',this.f__data());
};

/* update */
mvcModel.prototype.r_put = function() {
  var id = (this[this._primary] === undefined) ? '' : '/' + this[this._primary];
  this.f__ajax(id,'put',this.f__data());
};

/* delete */
mvcModel.prototype.r_delete = function() {
  var id = (this[this._primary] !== undefined) ? '/' + this[this._primary] : '';
  this.f__ajax(id,'delete');
  this.f__clear();
};

/* used by all the REST functions url required */
mvcModel.prototype.f__ajax = function(url,method,data,user_settings) {
  var self = this;
  method = (method) || 'get';
  data = (data) || {};
  user_settings = (user_settings) || {};
  var settings = {};

  settings.cache = true;
  settings.async = false;
  settings.url = mvc.rest.url + this._tablename + url;
  settings.data = data;
  settings.type = method;
  settings.dataType = 'json';
  settings.statusCode = {
    200: function(data, textStatus, jqXHR) {
      /* ok */
      jQuery.log('200: ok');
      self._data = data;
      if (data.records) {
        self._records = data.records;
        jQuery.extend(self,data.records[0]);
      }
    },
    201: function(data, textStatus, jqXHR) {
      /* created header url to resource */
      jQuery.log('201: created');
      var location = jqXHR.getResponseHeader('Location');
      var parts = location.split('/');
      var id = parts[parts.length-1];
      if (id > 0) {
        self[self._primary] = id;
      }
    },
    204: function(data, textStatus, jqXHR) {
      /* no content */
      jQuery.log('204');
    },
    400: function(jqXHR, textStatus, errorThrown) {
      /* bad request json errno: errtxt: */
      jQuery.log('400: bad request'); },
    401: function(jqXHR, textStatus, errorThrown) {
      /* Unauthorized */
      jQuery.log('401: Unauthorized');
    },
    404: function(jqXHR, textStatus, errorThrown) {
      /* not found */
      jQuery.log('404: Not Found');
    },
    405: function(jqXHR, textStatus, errorThrown) {
      /* method not allowed */
      jQuery.log('405: Method Not Allowed');
    },
    406: function(jqXHR, textStatus, errorThrown) {
      /* not acceptable json error: */
      jQuery.log('406: Not Acceptable');
    },
    500: function() {
      /* internal server error */
      jQuery.log('500: Internal Server Error');
    }
  };

  if (mvc.ajax.http_auth) {
    settings.beforeSend = function(xhr) {
      xhr.setRequestHeader('Authorization', 'Basic ' + php.base64_encode(mvc.ajax.auth_user + ':' + mvc.ajax.auth_pw));
    };
  }

  var ready = jQuery.extend(settings,user_settings);

  /* send it out via blocking ajax */
  jQuery.mvcAjax(ready);
};

/* return the numbers of records */
mvcModel.prototype.f_count = function() {
  return this._records.length;
};

/* fetch the current db record and move the cursor forward 1 - returns false if at last record */
mvcModel.prototype.f_fetch = function() {
  if ((this._index - 1) > this._records.length) {
    return false;
  }
  return this[this._index++];
};

/* move the database cursor to a specific record */
mvcModel.prototype.f_seek = function(index) {
  if (index > (this._records.length - 1) || index < 0) {
    return false;
  }
  this._index = index;
  return true;
};
