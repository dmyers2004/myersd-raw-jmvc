var controller_index_method_index = new function() {
  mvc.self = this;

  this.__construct = function() {
  };
  
  this.hello_world = new function() {
    this.click = function() {
    	alert('Click!');
    };
  };
  
  this.test_page = new function() {
    this.mouseover = function() {
      $('#test_page').append('mouse over');
    }
  };

}; /* end controller */