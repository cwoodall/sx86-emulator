/** sx86-display.js
 *
 * This is the interactive portion which allows you to display and interact 
 * with the sx86 processor (from sx86.js).
 *
 *
 * Author: Christopher Woodall
 * Date Created: September 14, 2013
 * Last Update: September 14, 2013
 * Version: 1.2
 * 
 * Requires: jquery (1.10.2) and sx86.js (1.2)
 */

(function(exports) {
  exports.clicked_index = 0;
  exports.hover_index = 0;
  exports.update_interval;
  exports.running = 0;
  exports.current_program;
//  var reg_id = $("#sx86_reg");
//  var ram_id = $("#sx86_ram");

  exports.init_reg_display = function (reg_id) {
    reg_content = "<table><tr>";
    for (var i = 0; i < 7; i++) {
      reg_content += "<td class='reg_td' id='sx86_reg_" + i + "'> 0x" + sx86.mem.regs[i].toString(16) + "</td>";
    }
    reg_content += "</tr></table>";

    reg_id.html(reg_content);
  };

  exports.init_ram_display = function (ram_id) {
    ram_content = "<table style='border-collapse:separate; '>"
    for (var j = 0; j < 4096; j += 64) {
      ram_content += "<tr>";
      for (var i = 0; i < 64; i++) {
        id = i+j;
        if (typeof(sx86.mem.ram[id]) !== "undefined") {
          ram_content += "<td id='sx86_ram_" + id + "' class='ram_td'></td>";
        }
      }
      ram_content += "</tr>";
    }
    ram_content += "</table>";

    ram_id.html(ram_content);

    $("#ram_mouseover_cellID").html("0x" + sx86_display.hover_index.toString(16));
    $("#ram_clicked_cellID").html("0x" + sx86_display.clicked_index.toString(16));
  };

  exports.update_reg_display = function(reg_id) {
    $('.reg_td').each(function(i, reg) { // Interate through everything with the .reg_td class
      reg_index = parseInt(reg.id.split('_')[2]); // Get the index of the register of format sx86_reg_index
      reg.innerHTML = '0x' + sx86.mem.regs[reg_index].toString(16);
    });
  };

  exports.update_ram_display = function(reg_id) {
    $('.ram_td').each(function(i, elem) { // Interate through everything with the .reg_td class
      ram_index = parseInt(elem.id.split('_')[2]); // Get the index of the register of format sx86_reg_index
      if (sx86.mem.ram[ram_index] >= 0) {
        $(elem).addClass('dark');
        $(elem).removeClass('light');
      } else {
        $(elem).addClass('light');
        $(elem).removeClass('dark');
      }

      if (ram_index === sx86.mem.regs[6]) {
        $(elem).addClass('pc');
      } else {
        $(elem).removeClass('pc');
      }
    });
  };



  exports.next_step_update_display = function() {
    if (sx86.mem.ram[sx86.mem.regs[6]] <= 0x0000) { // Treat negative values as halt
      sx86.step();
      exports.update_display();
    } 
  };

  exports.run = function(time) {
    if (time !== 0) {
      if (exports.running === 0) {
      exports.update_interval = setInterval("sx86_display.next_step_update_display()",time);
      exports.running = 1;
      }
    } else {
      while (sx86.mem.ram[sx86.mem.regs[6]] !== 0x0000) {
        sx86.step();
      }
      exports.update_display();
    }  
  };

  exports.stop = function() {
    exports.running = 0;
    clearInterval(exports.update_interval);
  }
  /**
   * Takes instructions, an array of 16-bit instructions, and loads them into the ram.
   * starting at address 31 the beginning of the program memory.
   */
  exports.load_program = function(instructions) {
    // Take in the machine code instructions and place them in ram.
    for (var i = 0; i < instructions.length;i++) {
      sx86.mem.ram[i+31] = instructions[i];
    }
    exports.current_program = instructions
    sx86.step(30); // Set to the beginning of the program space.
  };

  exports.update_display = function() {
    exports.update_ram_display();
    exports.update_reg_display();
    if (sx86.mem.ram[sx86_display.clicked_index] >= 0) {
      $("#ram_clicked_cellDisp").html("0x" + sx86.mem.ram[sx86_display.clicked_index].toString(16));
    } else {
      $("#ram_clicked_cellDisp").html("0x****");
    }
    if (sx86.mem.ram[sx86_display.hover_index] >= 0) {
      $("#ram_mouseover_cellDisp").html("0x" + sx86.mem.ram[sx86_display.hover_index].toString(16));
    } else {
      $("#ram_mouseover_cellDisp").html("0x****");
    }

  };
})(typeof exports === 'undefined'? this['sx86_display']={}: exports);