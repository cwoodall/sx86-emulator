/**
 * urbino.js: Coprocessor for the sx86 processor. Operates in pixel mode on 
 *            a 256x256 color display using an
 *            using an 8-bit per channel RGB color space and a control reg.
 *
 *            In total utilizes 6 bytes of ram and at minimum requires 6 writes
 *            per pixel and is thus rather slow.
 *           
 *
 * Origin of Name: Raffaello Sanzio da Urbino, better known as Raphael, was the 
 *                 painter after which the javascript library which creates SVG
 *                 images was named after.
 *
 * OPERATIONS:
 *
 */

var urbino = {
	x_size: 256,
	y_size: 256,

	x_coor: 0,
	y_coor: 0,
	colors: {r:0, g:0, b:0},
	control_reg: 0,

	display_buffer: [],
	action_buffer: [],

	init: function() {
		html_string = "<table  cellspacing=0 cellpadding=0>";
		for (var x = 0; x < this.x_size; x += 1){
			html_string += "<tr>";
			for (var y = 0; y < this.y_size; y += 1){
				html_string += "<td id='x"+x.toString() +"y"+ y.toString()+"' class='urbino_pixel'></td>";
			}
			html_string += "</tr>";
		}
		$("#urbino_disp").html(html_string);
	},

	clear: function() {
		for (var x = 0; x < this.x_size; x += 1){
			for (var y = 0; y < this.y_size; y += 1){
				this.action_buffer.push_back(x,y, "FFFFFF");
			}
		}
	},

	update: function() {
		for (var i = 0; i < this.action_buffer.length; i++) {
			console.log(this.action_buffer[i])
			$("#x"+this.action_buffer[i][0].toString() + "y" +this.action_buffer[i][1].toString()).css("background-color", "#"+this.action_buffer[i][2]);
		}
		this.action_buffer = [];
	},

	set_x : function(x) {this.x_coor = x;},
	set_y : function(y) {this.y_coor = y;},
	set_r : function(r) {this.colors.r = r;},
	set_g : function(g) {this.colors.g = g;},
	set_b : function(b) {this.colors.b = b;},

	set_ctrl : function(ctrl) { 
		this.control_reg = ctrl;
		if (ctrl === 1) {
			this.clear();
		} else if (ctrl === 2) {
			this.update();
		} else if (ctrl === 4) {
			this.push_back([this.x_coor, this.y_coor, ("00" + (this.colors.r & 0xFF).toString(16)).slice(-2) +
																						    ("00" + (this.colors.g & 0xFF).toString(16)).slice(-2) +
																						    ("00" + (this.colors.b & 0xFF).toString(16)).slice(-2)]);
		}
	},

	push_back : function(action) {
		this.action_buffer.push(action);
	}
};