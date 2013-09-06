#!/usr/bin/env python
############################################################################
# This is a simple assembler for the EC327 Simplified Intel Assembly code.
#
# At this point, the only minor improvement I think that the assembler
# still needs is to take the name of the assembly source file as a
# command line argument, rather than having all of the assembly code
# as a string in the script itself.
#
# Written by D.Cullen and C. Woodall
# Last updated 2013-09-05
############################################################################

import sys
import cgi
import cgitb
cgitb.enable()


def unsigneddec_to_bin(value, numbits=0, nibble_sep=''):
    """
    Converts an unsigned decimal value to a binary bit string.
    If 'numbits' is nonpositive, do not pad string. Otherwise,
    pad the bit string with leading zeros to reach the correct length.
    'nibble_separator' is the character you want to use to separate nibles
    (leave as an empty string if you don't want to group nibbles).
    """
    # First generate the bit string.
    bitstring = ""
    if value < 0:
        raise ValueError("Input must be positive.")
    if value == 0:
        bitstring = "0"
    while value > 0:
        bitstring = "".join([str(value & 0x01), bitstring])
        value = value >> 1

    # Now pad the bit string.
    if numbits > 0:
        if len(bitstring) > numbits:
            raise Exception("Bit string is too long to be stored with %d bits" % numbits)
        while len(bitstring) < numbits:
            bitstring = "".join(['0', bitstring])

    # Now group the nibbles, if enabled.
    tmp = ""
    for i in xrange(0,len(bitstring)):
        if i % 4 == 0 and i != 0:
            tmp = "".join([nibble_sep, tmp])
        tmp = "".join([bitstring[len(bitstring)-i-1], tmp])
    bitstring = tmp

    # return the result.
    return bitstring

def tb_unsigneddec_to_bin():
    """ Testbench for my unsigneddec_to_bin() function. """
    print unsigneddec_to_bin(3)
    print unsigneddec_to_bin(3,2)
    print unsigneddec_to_bin(3,4)
    try:
        print unsigneddec_to_bin(3,1)
    except:
        print "Got exception:", sys.exc_info()[0]
    print unsigneddec_to_bin(9,numbits=16,nibble_sep='_')
    print unsigneddec_to_bin(15,numbits=11,nibble_sep=' ')


def bin_to_hex():
    """
    This demonstration script takes an bit string and generates its hex representation.    
    Here are some good references:
    - http://wiki.python.org/moin/BitManipulation
    - http://docs.python.org/library/binascii.html
    """
    bitstring = "00_0001_0001"

    print "original:", bitstring

    # Input bit string may have underscores to group the bits.
    # Parse out the underscores.
    bitstring = bitstring.replace("_", "")
    print "cleaned up:", bitstring

    base10 = int(bitstring, 2)
    print "decimal:", base10

    base16 = "%02x" % base10
    print "hex:", base16


def get_reg_number(r):
    if r.find("r0") != -1:
        return 0
    elif r.find("r1") != -1:
        return 1
    elif r.find("r2") != -1:
        return 2
    elif r.find("r3") != -1:
        return 3
    elif r.find("r4") != -1:
        return 4
    elif r.find("r5") != -1:
        return 5
    elif r.find("r6") != -1:
        return 6
    else:
        return -1

def is_reg_bracketed(r):
    if r.startswith("[") and r.endswith("]"):
        return True
    elif not r.startswith("[") and not r.endswith("]"):
        return False
    else:
        print "Error: incorrect bracketing."
        sys.exit()
        return None

if __name__ == "__main__":

    form = cgi.FieldStorage()

    print "Content-Type: text/html\n"

    # Here's how you select which program to run:
    if "assembly_string" in form:
        src = form["assembly_string"].value
    else:
        print "Error"
        sys.exit()

    # We must perform two passes:
    # In the first pass, we store labels and their instruction addresses.
    # In the second pass, we compute the machine code for the instructions.
    # If we don't perform two passes, we can only jump to labels on previous
    # lines, not labels on future lines, because the future line labels will
    # not have been stored yet.
    # In the first pass, we also remove the comments and the labels so that
    # the second pass does not have to worry about parsing these.

    BASE_ADDR = 31              # starting address of where to store instructions.
    curr_addr = BASE_ADDR       # keeps track of address of current line.

    labels = {}                 # dictionary stores all of the laebels and their addresses
    machinecode = []            # list stores all of the generated machine code instructions
    assemblycode = []           # list stores assembly lines that correspond to machine code lines

    lines = []                  # keeps track of the fields in each line for the second pass

    # First pass: Remove comments and labels. Store labels and addresses.
    for line in src.splitlines():

        # First, save a backup copy of the original line for later output.
        bkup_line = line

        # Adjust and split line into fields.
        commentstart = line.find(";")  # strip off comments (anything after the first semicolon)
        if commentstart != -1:
            line = line[:commentstart]
        line = line.strip()
        line = line.lower()
        line = line.replace(',', ' ')  # replace commas with spaces for further splitting
        fields = line.split()
        if len(fields) == 0:
            continue

        # Check if line has a label.
        label = ""
        if fields[0].endswith(":"):
            label = fields[0].replace(':','')
            fields.pop(0)
            if len(fields) == 0:
                print "Error: cannot have a line with just a label; you need an instruction too."
                sys.exit()
            labels[label] = curr_addr

        # Increment address for next instruction:
        curr_addr += 1

        # Store fields for second pass
        lines.append(fields)

        # Store assembly code
        assemblycode.append(bkup_line)

    # Second pass: Compute machine code.
    for fields in lines:

#        print "Assembling:", " ".join(fields)

        # Get the instruction for the line.
        cmd = fields[0]
        fields.pop(0)

        # Parse rest of line, depending on type of instruction, to generate the machine code.
        mc = 0;
        if cmd == "halt":
            if len(fields) != 0:
                print "Error: halt takes no arguments."
                sys.exit
            opcode = "0000"
            mc = (int(opcode,2)<<12) + int("0000_0000_0000".replace('_',''),2)

        elif cmd == "add" or cmd == "sub" or cmd == "xor" or cmd == "cmp":
            if len(fields) != 2:
                print "Error: mov needs exactly two parameters."
                sys.exit()
            a = fields[0]
            b = fields[1]
            # parse register numbers.
            ra = get_reg_number(a)
            rb = get_reg_number(b)
            if ra == -1 or rb == -1:
                print "Error: unidentified register parameter."
                sys.exit()
            # make sure user hasn't tried to use any brackets.
            if a.find("[") != -1 or a.find("]") != -1 or b.find("[") != -1 or b.find("]") != -1:
                print "Error: You cannot use bracket notation for this instruction."
                sys.exit()
            opcode = ""
            if cmd == "add":
                opcode = "0101"
            elif cmd == "sub":
                opcode = "0110"
            elif cmd == "xor":
                opcode = "0111"
            elif cmd == "cmp":
                opcode = "1000"
            else:
                assert False
            mc = (int(opcode,2)<<12) + (ra<<6) + rb

        elif cmd == "inc":
            if len(fields) != 1:
                print "Error: instruction requires exactly one argument."
                sys.exit()
            a = fields[0]
            # parse register number.
            ra = get_reg_number(a)
            if ra == -1:
                print "Error: unidentified register parameter."
                sys.exit()
            # make sure user hasn't tried to use any brackets.
            if a.find("[") != -1 or a.find("]") != -1:
                print "Error: You cannot use bracket notation for this instruction."
                sys.exit()
            opcode = "0001"
            mc = (int(opcode,2)<<12) + ra
        
        elif cmd == "jmp" or cmd == "je" or cmd == "jne":
            if len(fields) != 1:
                print "Error: instruction requires exactly one argument."
                sys.exit()
            dest = fields[0]
            fields.pop(0)
            # Determine if a numeric address or a label is given:
            jump_addr = 0
            if dest.isdigit():
                jump_addr = int(dest)
            else:
                # Make sure label exists
                if not labels.has_key(dest):
                    print "Error: unidentified label:", dest
                    sys.exit()
                jump_addr = labels[dest]
            opcode = ""
            if cmd == "jmp":
                opcode = "0010"
            elif cmd == "je":
                opcode = "0100"
            elif cmd == "jne":
                opcode = "0011"
            else:
                assert False
            mc = (int(opcode,2)<<12) + jump_addr

        elif cmd == "mov":
            if len(fields) != 2:
                print "Error: mov needs exactly two parameters."
                sys.exit()
            a = fields[0]
            b = fields[1]
            # parse register numbers. if rb is negative, it might be a constant.
            ra = get_reg_number(a)
            rb = get_reg_number(b)
            if ra == -1:
                print "Error: unidentified register parameter", a
                sys.exit()
            mov_constant = False
            if rb == -1:
                if b.isdigit():
                    mov_constant = True
                else:
                    print "Error: unidentified register parameter", b
                    sys.exit()
            # determine whether or not brackets are included.
            a_bracketed = is_reg_bracketed(a)
            b_bracketed = is_reg_bracketed(b)
            # determine the addressing mode.
            opcode = ""
            if not a_bracketed and not b_bracketed:
                if mov_constant:
                    opcode = "1001"
                else:
                    opcode= "1010"
            elif a_bracketed and not b_bracketed and not mov_constant:
                opcode = "1011"
            elif not a_bracketed and b_bracketed and not mov_constant:
                opcode = "1100"
            else:
                print "Error: unidentified addressing mode."
                sys.exit()
            # store result
            if mov_constant:
                mc = (int(opcode,2)<<12) + (ra<<6) + int(b)
            else:
                mc = (int(opcode,2)<<12) + (ra<<6) + rb
        else:
            print "Error: unidentified instruction."
            sys.exit()

        # Store output machine code
        machinecode.append(mc)

    print( "".join([("%04x"%item) for item in machinecode]) )

