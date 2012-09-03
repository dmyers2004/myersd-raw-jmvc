var controller_testing_method_cutter = new function() {
  mvc.self = this;

  this.__construct = function() {};
  
  this.hello_world = new function() {
    this.click = function() {
    	alert('Hello From controller_testing_method_cutter Click!');
    };
  };

}; /* end controller */