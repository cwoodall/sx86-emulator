$(document).ready(function() {
	// Setup memory cell update text to 0 initially.
	dispID = 0;
	// Clear and load initial program into the sx86 processor.
	load_proc();
	$("#run_btn").on("click", function () {
		run_proc();
	});

	$("#run_fast_btn").on("click", function () {
		run_fast_proc();
	});
	
	$("#stop_btn").on("click", function () {
		stop_proc();
	});
	
	$("#clear_btn").on("click", function () {
		clear_proc();
	});
	
	$("#next_btn").on("click", function () {
		next_step();
	});
	$("#reload_btn").on("click", function () {
		load_proc();
	});
	
	$("#load_program_btn").on("click", function () {
		LoadProgram();
	});

	$("#assemble_btn").click(function () {
		req = {'assembly_string': $("#assembly_string").val()}
		$.post('/cgi-bin/sx86-assembler.py', req, function(resp) {
			$("#program_load").val(resp)
		})
	})

	$("#disassemble_btn").click(function () {
		req = {'machinecode': $("#program_load").val()}
		$.post('/cgi-bin/sx86-disassembler.py', req, function(resp) {
			$("#assembly_string").val(resp)
		})
	})
});
