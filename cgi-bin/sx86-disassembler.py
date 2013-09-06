#!/usr/bin/env python
############################################################################
# This is a simple disassembler for EC327 Simplified Intel Assembly code.
#
# Written by D.Cullen and C. Woodall (CGI modifications)
# Last updated 2013-09-03
############################################################################

import sys
import cgi

if __name__ == "__main__":
  
    print "Content-Type: text/html\n"
    form = cgi.FieldStorage()


    # Here's how you select which program to run:
    if "machinecode" in form:
        machinecode = form["machinecode"].value
    else:
        print "Error"
        sys.exit() 

    BASE_ADDR = 31              # starting address of where to store instructions.
    curr_addr = BASE_ADDR       # keeps track of address of current line.

    # First remove any whitespace in the hex machine code string.
    machinecode = machinecode.strip()
    machinecode = machinecode.replace(' ', '')
    machinecode = machinecode.replace('\t', '')
    machinecode = machinecode.replace('\r', '')
    machinecode = machinecode.replace('\n', '')

    # Make sure machine code is correct length:
    if len(machinecode) % 4 != 0:
        print "Error: invalid number of hex digits"
        sys.exit()

    for index in xrange(0,len(machinecode),4):
        
        instruction = 0
        try:
            instruction = int(machinecode[index:index+4], 16)
        except ValueError:
            print "Error: encountered invalid character while parsing instruction", instruction
            sys.exit()

        opcode = (instruction >> 12) & 0xFF

        assembly = ""
        if opcode == 0x00:
            assembly = "halt"
        elif opcode == 0x01:
            r = (instruction) & 0x0FFF
            assembly = "inc R%d" % r
        elif opcode == 0x02:
            addr = (instruction) & 0x0FFF
            assembly = "jmp %d" % addr
        elif opcode == 0x03:
            addr = (instruction) & 0x0FFF
            assembly = "jne %d" % addr
        elif opcode == 0x04:
            addr = (instruction) & 0x0FFF
            assembly = "je %d" % addr
        elif opcode == 0x05:
            ra = (instruction >> 6) & 0x3F
            rb = (instruction) & 0x3F
            assembly = "add R%d, R%d" % (ra,rb)
        elif opcode == 0x06:
            ra = (instruction >> 6) & 0x3F
            rb = (instruction) & 0x3F
            assembly = "sub R%d, R%d" % (ra,rb)
        elif opcode == 0x07:
            ra = (instruction >> 6) & 0x3F
            rb = (instruction) & 0x3F
            assembly = "xor R%d, R%d" % (ra,rb)
        elif opcode == 0x08:
            ra = (instruction >> 6) & 0x3F
            rb = (instruction) & 0x3F
            assembly = "cmp R%d, R%d" % (ra,rb)
        elif opcode == 0x09:
            r = (instruction >> 6) & 0x3F
            c = (instruction) & 0x3F
            assembly = "mov R%d, %d" % (r,c)
        elif opcode == 0x0A:
            ra = (instruction >> 6) & 0x3F
            rb = (instruction) & 0x3F
            assembly = "mov R%d, R%d" % (ra,rb)
        elif opcode == 0x0B:
            ra = (instruction >> 6) & 0x3F
            rb = (instruction) & 0x3F
            assembly = "mov [R%d], R%d" % (ra,rb)
        elif opcode == 0x0C:
            ra = (instruction >> 6) & 0x3F
            rb = (instruction) & 0x3F
            assembly = "mov R%d, [R%d]" % (ra,rb)
        else:
            print "Error: unidentified opcode."
            sys.exit()

        print "%s" % assembly

        curr_addr += 1
