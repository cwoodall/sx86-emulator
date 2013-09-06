processor = {
    registers : new Array(7),

    ram: new Array(4096),

    flags: {"cmp": 0, "jmp": 0},

    process: function () {
        instruction = processor.ram[processor.registers[6]];
        op_code = (instruction & 0xF000) >> 12;
        switch (op_code) {
            case 0x0: break;// HALT
            case 0x1: // INC Rn
                parameter = instruction & 0x0FFF;            
                if (parameter <= 6)
                {
                  //  console.log(processor.registers[parameter]);
                    processor.registers[parameter] += 1;
                }
                break;
            case 0x2: // JMP target            
                parameter = instruction & 0x0FFF;            
                processor.registers[6] = parameter;
                processor.flags.jmp = 1;
                break;
            case 0x3: // JNE target
                if (processor.flags.cmp === 0) {
                    parameter = instruction & 0x0FFF;            
                    processor.registers[6] = parameter;
                    processor.flags.jmp = 1;
                }
                break;
            case 0x4: // JE target
                if (processor.flags.cmp === 1) {
                    parameter = instruction & 0x0FFF;            
                    processor.registers[6] = parameter;
                    processor.flags.jmp = 1;
                }
                break;
            case 0x5: // ADD Rn, Rm
                Rn = (0x0FC0 & instruction) >> 6;
                Rm = (0x003F & instruction);
                if ((Rn <= 6) && (Rm <= 6)) {
                    processor.registers[Rn] += processor.registers[Rm];
                }
                break;
            case 0x6: // SUB Rn, Rm
                Rn = (0x0FC0 & instruction) >> 6;
                Rm = (0x003F & instruction);
                if ((Rn <= 6) && (Rm <= 6)) {
                    processor.registers[Rn] -= processor.registers[Rm];
                }
                break;
            case 0x7: // XOR Rn, Rm
                Rn = (0x0FC0 & instruction) >> 6;
                Rm = (0x003F & instruction);
                if ((Rn <= 6) && (Rm <= 6)) {
                    processor.registers[Rn] ^= processor.registers[Rm];
                }
                break;
            case 0x8: // CMP Rn, Rm
                Rn = (0x0FC0 & instruction) >> 6;
                Rm = (0x003F & instruction);
                if ((Rn <= 6) && (Rm <= 6)) {
                    processor.flags.cmp = (processor.registers[Rn] === processor.registers[Rm])?1:0;
                }
                break;
            case 0x9: // MOV Rn, num
                Rn = (0x0FC0 & instruction) >> 6;
                num = (0x003F & instruction);
                if (Rn <= 6) {
                    processor.registers[Rn] = num;
                }
                break;
            case 0xA: // MOV Rn, Rm
                Rn = (0x0FC0 & instruction) >> 6;
                Rm = (0x003F & instruction);
                if ((Rn <= 6) && (Rm <= 6)) {
                    processor.registers[Rn] = processor.registers[Rm];
                }
                break;
            case 0xB: // MOV [Rn], Rm
                Rn = (0x0FC0 & instruction) >> 6;
                Rm = (0x003F & instruction);
                if ((Rn <= 6) && (Rm <= 6)) {
                    processor.ram[processor.registers[Rn]] = processor.registers[Rm];
                }
                break;
            case 0xC: // MOV Rn, [Rm]
                Rn = (0x0FC0 & instruction) >> 6;
                Rm = (0x003F & instruction);
                if ((Rn <= 6) && (Rm <= 6)) {
                    processor.registers[Rn] = processor.ram[processor.registers[Rm]];
                }
                break;
        }
    },

    next: function (loc) {
        if (loc) {
            processor.registers[6] = loc;
        }
        processor.process();
        if (processor.flags.jmp === 0) {
            processor.registers[6] += 1;
        } else {
            processor.flags.jmp = 0;
        }
    },

    clear: function() {
    for (var i = 0; i < 7; i++) processor.registers[i] = 0;
    for (var i = 0; i < 4096; i++) processor.ram[i] = 0;
    processor.flags.jmp = 0;
    processor.flags.cmp = 0;
    }
}

function actOnEachLine(textarea, func) {
    var lines = textarea.value.replace(/\r\n/g, "\n").split("\n");
    var newLines, newValue, i;

    // Use the map() method of Array where available 
    if (typeof lines.map != "undefined") {
        newLines = lines.map(func);
    } else {
        newLines = [];
        i = lines.length;
        while (i--) {
            newLines[i] = func(lines[i]);
        }
    }
    textarea.value = newLines.join("\r\n");
}
var my_interval;
var run_set = 0;
function run_proc() {
  if (run_set === 0) {
    my_interval = setInterval("next_step()",200);
    run_set = 1;
  }
}
function stop_proc() {
  run_set = 0                        
  clearInterval(my_interval);
}

program = [0x900A,
           0x904B,
           0x9094,
           0xB001,
           0xA001,
           0x1001,
           0x8002,
           0x3022,
           0x9013,
           0xC0C0,
           0x1003,
           0xB003,
           0xC0C0,
           0x1003,
           0xB003,
           0x0000];

sx86_reg_id = document.getElementById("sx86_reg");
sx86_ram_id = document.getElementById("sx86_ram");

update_reg_disp = function (reg_id) {
  reg_content = "<table><tr>";
  for (var i = 0; i < 7; i++) {
      reg_content += "<td> 0x" + processor.registers[i].toString(16) + "</td>";
  }
  reg_content += "</tr></table>";

  reg_id.innerHTML = reg_content;
}
cellDisplayById = function(id, clicked) {
  if (clicked === 1) {
    document.getElementById("ram_clicked_cellDisp").innerHTML = "ram[" + id + "]: 0x" + processor.ram[id].toString(16);
      dispID = id;

  } else {
   document.getElementById("ram_mouseover_cellDisp").innerHTML = "ram[" + id + "]: 0x" + processor.ram[id].toString(16);
  }

}

// FIXME: takes too much time.
update_ram_disp = function (ram_id) {
  ram_content = "<table style='border-collapse:separate; '>"
  for (var j = 0; j < 4096; j += 64) {
    ram_content += "<tr>";
    for (var i = 0; i < 64; i++) {
      id = i+j;
      if (typeof(processor.ram[id]) !== "undefined")
        ram_content += "<td onclick='cellDisplayById("+ id + ",1)' onmouseover='cellDisplayById("+ id + ",0)' class='ram_td "+ ((processor.ram[id])?"dark":"light")+ " " + ((processor.registers[6] === id)?"pc":"") +"'> </td>";
    }
    ram_content += "</tr>";
  }
  ram_content += "</table>";

  ram_id.innerHTML = ram_content;
}

clear_proc = function () {
  processor.clear();
  update_ram_disp(sx86_ram_id);
  update_reg_disp(sx86_reg_id);
  cellDisplayById(dispID,1)

}
initialize = function() {
  processor.next(31);
  update_ram_disp(sx86_ram_id);
  update_reg_disp(sx86_reg_id);
  cellDisplayById(dispID,1)
}

next_step = function() {
  if (processor.ram[processor.registers[6]] !== 0x0000) {
    processor.next();
    update_ram_disp(sx86_ram_id);
    update_reg_disp(sx86_reg_id);
    cellDisplayById(dispID,1 )
  }
}

load_proc = function() {
  stop_proc();
  clear_proc();
  for (var i = 0; i < program.length;i++) {
    processor.ram[i+31] = program[i];
  }
  processor.next(30);
  update_ram_disp(sx86_ram_id);
  update_reg_disp(sx86_reg_id);
  cellDisplayById(dispID,1)
}

LoadProgram = function(){
  program = [];
  var textarea = document.getElementById("program_load");
  program = textarea.value.match(/.{1,4}/g);
  for (var i = 0; i < program.length; i++) {
    if ((program[i] !== '') || (program[i] !== ' ') || (program[i] !== '\n')) {
      program[i] = parseInt(program[i],16);
    }
  }
  load_proc();
}
