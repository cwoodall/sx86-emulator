/** sx86.js
 *
 * New version of the sx86 (simplified x86) web emulator used in 
 * EC327 at Boston University. This version is meant to be Node.js 
 * compatible
 *
 * Author: Christopher Woodall
 * Date Created: September 14, 2013
 * Last Update: September 14, 2013
 * Version: 1.2
 */

 /**
  * Everything within this file happens within exports. This is to allow us to
  * expose functionality to node.js and also helps us maintain a good namespace.
  *
  * Functions which should be exposed should be made as member functions or
  * variables of exports. For example:
  *
  *     exports.test = function(){
  *         return 'hello world'
  *     };  
  */
(function(exports) {
  exports.VERSION = "1.2";

  /**
   * Define memory structures. There are 3 types of memory presented here.
   *    - flags: Not really memory are used to keep track of jumps and compares.
   *    - ram: 4096 memory cells used as the "ram"
   *    - regs: 7 General Purpose Registers. 6 is used as the PC.
   */
  exports.mem = {
    flags: {'cmp': 0, 'jmp': 0},
    ram: new Array(4096),
    regs: new Array(7)
  };

  /**
   * clear = function()
   *
   * Clears flags, ram and registers.
   */
  exports.clear = function() {
    for (var i = 0; i < 7; i++) exports.mem.regs[i] = 0;
    for (var i = 0; i < 4096; i++) exports.mem.ram[i] = 0;
    exports.mem.flags.jmp = 0;
    exports.mem.flags.cmp = 0;
  };

  /**
   * initialize = function()
   *
   * Clears flags, ram and registers. and initializes other states
   */
  exports.initialize = function() {
    exports.clear();
  };
  
  /**
   * __fetch = function () {}
   */
  exports.__fetch = function () {
    return exports.mem.ram[exports.mem.regs[6]];
  };

  exports.__decode = function () {
    instruction = exports.__fetch();
    op_code = (instruction & 0xF000) >> 12;
    switch (op_code) {
      case 0x0: break;// HALT
      case 0x1: // INC Rn
        parameter = instruction & 0x0FFF;            
        if (parameter <= 6) {
          //  console.log(exports.mem.regs[parameter]);
          exports.mem.regs[parameter] += 1;
        }
        break;
      case 0x2: // JMP target            
        parameter = instruction & 0x0FFF;            
        exports.mem.regs[6] = parameter;
        exports.mem.flags.jmp = 1;
        break;
      case 0x3: // JNE target
        if (exports.mem.flags.cmp === 0) {
          parameter = instruction & 0x0FFF;            
          exports.mem.regs[6] = parameter;
          exports.mem.flags.jmp = 1;
        }
        break;
      case 0x4: // JE target
        if (exports.mem.flags.cmp === 1) {
          parameter = instruction & 0x0FFF;            
          exports.mem.regs[6] = parameter;
          exports.mem.flags.jmp = 1;
        }
        break;
      case 0x5: // ADD Rn, Rm
        Rn = (0x0FC0 & instruction) >> 6;
        Rm = (0x003F & instruction);
        if ((Rn <= 6) && (Rm <= 6)) {
          exports.mem.regs[Rn] += exports.mem.regs[Rm];
        }
        break;
      case 0x6: // SUB Rn, Rm
        Rn = (0x0FC0 & instruction) >> 6;
        Rm = (0x003F & instruction);
        if ((Rn <= 6) && (Rm <= 6)) {
          exports.mem.regs[Rn] -= exports.mem.regs[Rm];
        }
        break;
      case 0x7: // XOR Rn, Rm
        Rn = (0x0FC0 & instruction) >> 6;
        Rm = (0x003F & instruction);
        if ((Rn <= 6) && (Rm <= 6)) {
          exports.mem.regs[Rn] ^= exports.mem.regs[Rm];
        }
        break;
      case 0x8: // CMP Rn, Rm
        Rn = (0x0FC0 & instruction) >> 6;
        Rm = (0x003F & instruction);
        if ((Rn <= 6) && (Rm <= 6)) {
          exports.mem.flags.cmp = (exports.mem.regs[Rn] === exports.mem.regs[Rm])?1:0;
        }
        break;
      case 0x9: // MOV Rn, num
        Rn = (0x0FC0 & instruction) >> 6;
        num = (0x003F & instruction);
        if (Rn <= 6) {
          exports.mem.regs[Rn] = num;
        }
        break;
      case 0xA: // MOV Rn, Rm
        Rn = (0x0FC0 & instruction) >> 6;
        Rm = (0x003F & instruction);
        if ((Rn <= 6) && (Rm <= 6)) {
          exports.mem.regs[Rn] = exports.mem.regs[Rm];
        }
        break;
      case 0xB: // MOV [Rn], Rm
        Rn = (0x0FC0 & instruction) >> 6;
        Rm = (0x003F & instruction);
        if ((Rn <= 6) && (Rm <= 6)) {
          exports.mem.ram[exports.mem.regs[Rn]] = exports.mem.regs[Rm];
        }
        break;
      case 0xC: // MOV Rn, [Rm]
        Rn = (0x0FC0 & instruction) >> 6;
        Rm = (0x003F & instruction);
        if ((Rn <= 6) && (Rm <= 6)) {
          exports.mem.regs[Rn] = exports.mem.ram[exports.mem.regs[Rm]];
        }
        break;
      }
  };

  /** 
   * step = function(loc)
   *
   * Set the program counter (if needed), decode the instruction and then
   * increment the program counter or take care of jumps. We also set the mem.jmp
   * flag to 0  when done, if a jump was made).
   *
   * @var  loc  Location to load into the PC. If undefined execute what is 
   *            currently in the PC.
   */
  exports.step = function (loc) {
    if (loc) {
      exports.mem.regs[6] = loc;
    }

    exports.__decode();

    if (exports.mem.flags.jmp === 0) {
      exports.mem.regs[6] += 1;
    } else {
      exports.mem.flags.jmp = 0;
    }
  };
})(typeof exports === 'undefined'? this['sx86']={}: exports);