var display_graph = false;
var spikes_per_graph = 75;

var canvas_dimensions = [500,500];
var voltage_display_dimension = [150,500];
var voltage_display_offset = 500;
var graph_offset = 650;
var graph_buffer = 50;
var graph_dimensions = [1000,500];
var mid = canvas_dimensions[0]/2;



var probe_locations = [[mid,mid-240/2],[mid,mid-80/2],[mid,mid+80/2],[mid,mid+240/2]]
var neuron_locations = [];
var neuron_parameters = [];

var colors = [[255,0,0],[255,255,0],[0,255,0],[0,255,255],[0,0,255],[255,0,255]];
var neuron_icon_size = 50;
var probe_icon_size = 25;

var place_neurons_mode = false;
var place_neurons_intermediate = false;
var clear_neurons_flag;
var enter_parameters_mode = false;

var default_rate = '30';
var default_model = 'L5_STPC_cADpyr232_1';
var default_x_offset = '5';

var parameters_header; 
var rate_input;
var rate_input_header;
var x_offset_input;
var x_offset_input_header;
var neuron_type_select;
var neuron_type_select_header;
var neuron_parameters_submit;
var neuron_parameters_cancel;
var enter_parameters_intermediate = false;
var neuron_tic_size = 10;

var selected_neuron_num;

var noise_input;

var simulate_button;

var default_probe_type = 'tetrode-mea-l';
var default_duration = '10';
var default_noise_type = 'uncorrelated';
var default_sorting_algorithm = 'tridesclous';

var final_selection_begin;

var icon_positions = []; 
var icons_built = false;

var voltage_trace_id = -1;
var performance_icon_size = 10;

var discovered_neurons = -1;

var voltage_traces = [];
var performance_trace = [];

var top_section_boundary = 500;

var mid_section_boundary = 600;

var bottom_section_boundary = 800;

var summary_statistics;
var total_statistics;
var total_statistics_banner_position = [graph_offset+graph_dimensions[0]/2,610];

var selected_spike;
var group_selection = 0;

var num_fabricated = 0;

var fabricated_spikes;

var synth_output;

var tridesclous_button;
var ironclust_button;
var klusta_button;

var algorithm_selection;

var y_position_input;
var y_position_input_header;
var z_position_input;
var z_position_input_header;

var delete_neuron_button;

var cellmodel_labels = {'Bipolar cell (I)':'L5_BP_bAC217_1', 'Bitufted Cell (I)': 'L5_BTC_bAC217_1', 
					   'Chandlier Cell (I)':'L5_ChC_cACint209_1', 'Double Bouquet Cell (I)': 'L5_DBC_bAC217_1', 
					   'Large Basket Cell (I)':'L5_LBC_bAC217_1', 'Nest Basket Cell (I)':'L5_NBC_bAC217_1',
					    'Neurogliaform Cell (I)': 'L5_NGC_bNAC219_1', 'Small Basket Cell (I)':'L5_SBC_bNAC219_1',
					    'Slender-tufted Pyramidal Cell (E)':'L5_STPC_cADpyr232_1', 'Thick-tufted Pyramidal Cell 1 (E)':'L5_TTPC1_cADpyr232_1',
					    'Thick-tufted Pyramidal Cell 2 (E)':'L5_TTPC2_cADpyr232_1','Untufted Pyramidal Cell 2 (E)':'L5_UTPC_cADpyr232_1'};

var cellmodel_names = {'L5_BP_bAC217_1':'Bipolar cell (I)','L5_BTC_bAC217_1':'Bitufted Cell (I)', 
					   'L5_ChC_cACint209_1':'Chandlier Cell (I)','L5_DBC_bAC217_1':'Double Bouquet Cell (I)', 
					   'L5_LBC_bAC217_1':'Large Basket Cell (I)', 'L5_NBC_bAC217_1':'Nest Basket Cell (I)',
					   'L5_NGC_bNAC219_1':'Neurogliaform Cell (I)', 'L5_SBC_bNAC219_1':'Small Basket Cell (I)',
					   'L5_STPC_cADpyr232_1':'Slender-tufted Pyramidal Cell (E)','L5_TTPC1_cADpyr232_1':'Thick-tufted Pyramidal Cell 1 (E)',
					   'L5_TTPC2_cADpyr232_1':'Thick-tufted Pyramidal Cell 2 (E)','L5_UTPC_cADpyr232_1':'Untufted Pyramidal Cell 2 (E)'};




function setup() 
{
	createCanvas(1650,900);
	button = createButton('Place Neurons');
	button.position(0,10);
	button.mousePressed(change_mode);
	button = createButton('Clear Neurons');
	button.position(350,10);
	button.mousePressed(clear_neurons);

	parameters_header = createDiv('Enter Parameters');
	parameters_header.position(0,top_section_boundary-20);
	parameters_header.hide();

	rate_input = createInput('15');
	rate_input.position(0,top_section_boundary+30);
	rate_input.size(100,AUTO);
	rate_input.hide();

	rate_input_header = createDiv('Firing Rate (Hz)');
	rate_input_header.position(0,top_section_boundary+10);
	rate_input_header.hide();




	y_position_input = createInput('');
	y_position_input.position(100 -5,top_section_boundary+75);
	y_position_input.size(75,AUTO);
	y_position_input.hide();

	y_position_input_header = createDiv('y');
	y_position_input_header.position(100,top_section_boundary+59);
	y_position_input_header.style('font-size', '12px');
	y_position_input_header.hide();

	z_position_input = createInput('');
	z_position_input.position(200 -5,top_section_boundary+75);
	z_position_input.size(75,AUTO);
	z_position_input.hide();

	z_position_input_header = createDiv('z');
	z_position_input_header.position(200,top_section_boundary+59);
	z_position_input_header.style('font-size', '12px');
	z_position_input_header.hide();

	x_offset_input = createInput('5');
	x_offset_input.position(300 -5,top_section_boundary+75);
	x_offset_input.size(75,AUTO);
	x_offset_input.hide();

	x_offset_input_header = createDiv('x offset ('+'\u03BC'+'m)');
	x_offset_input_header.position(300,top_section_boundary+59);
	x_offset_input_header.style('font-size', '12px');
	x_offset_input_header.hide();


	neuron_type_select = createSelect();
	neuron_type_select.option('Bipolar cell (I)');
	neuron_type_select.option('Bitufted Cell (I)');
	neuron_type_select.option('Chandlier Cell (I)');
	neuron_type_select.option('Double Bouquet Cell (I)');
	neuron_type_select.option('Large Basket Cell (I)');
	neuron_type_select.option('Nest Basket Cell (I)');
	neuron_type_select.option('Neurogliaform Cell (I)');
	neuron_type_select.option('Small Basket Cell (I)');
	neuron_type_select.option('Slender-tufted Pyramidal Cell (E)');
	neuron_type_select.option('Thick-tufted Pyramidal Cell 1 (E)');
	neuron_type_select.option('Thick-tufted Pyramidal Cell 2 (E)');
	neuron_type_select.option('Untufted Pyramidal Cell 2 (E)');
	neuron_type_select.position(140,top_section_boundary+20);
	neuron_type_select.hide();




	neuron_type_select_header = createDiv('Neuron Model');
	neuron_type_select_header.position(160,top_section_boundary+3);
	neuron_type_select_header.hide();

	neuron_parameters_go = createButton('Submit');
	neuron_parameters_go.mousePressed(submit_parameters);
	neuron_parameters_go.position(0,top_section_boundary+70);
	neuron_parameters_go.hide();

	neuron_parameters_cancel = createButton('Cancel');
	neuron_parameters_cancel.mousePressed(cancel_parameters);
	neuron_parameters_cancel.position(420,top_section_boundary+70);
	neuron_parameters_cancel.hide();

	noise_input = createInput('50');
	noise_input.size(100,AUTO);
	noise_input.position(375,460);

	simulate_button = createButton('Simulate');
	simulate_button.mousePressed(run_simulation);
	simulate_button.position(200,0);


	//performance_trace = json_data['performance_trace'];

	forward_button = createButton('\u27A1');
	forward_button.mousePressed(selection_forward);
	forward_button.position(graph_offset+graph_dimensions[0]/2 + 35,510);
	backward_button = createButton('\u2B05');
	backward_button.mousePressed(selection_backward);
	backward_button.position(graph_offset+graph_dimensions[0]/2 - 35,510);


	//algorithm select buttons
	tridesclous_button = createButton('Tridesclous');
	tridesclous_button.mousePressed(select_tridesclous);
	tridesclous_button.position(graph_offset+graph_dimensions[0]/2 -15 - 150,550);
	tridesclous_button.hide();

	ironclust_button = createButton('Ironclust');
	ironclust_button.mousePressed(select_ironclust);
	ironclust_button.position(graph_offset+graph_dimensions[0]/2 -25,550);
	ironclust_button.hide();

	klusta_button = createButton('KlustaKwik');
	klusta_button.mousePressed(select_klusta);
	klusta_button.position(graph_offset+graph_dimensions[0]/2 -15 + 112,550);
	klusta_button.hide();

	delete_neuron_button = createButton('Delete');
	delete_neuron_button.mousePressed(delete_neuron);
	delete_neuron_button.position(420,top_section_boundary+35);
	delete_neuron_button.hide();


}

function draw() 
{
	
	//background(200);
	fill(200);
	rect(0,0,1650,500);
	line(0,1650,500,1650);
	rect(0,top_section_boundary,1650,100);
	line(0,top_section_boundary,1650,top_section_boundary);
	if(display_graph)
	{
		rect(0,mid_section_boundary,1650,200);
		line(0,mid_section_boundary,1650,mid_section_boundary);
		line(0,bottom_section_boundary,1650,bottom_section_boundary);
	}
	for(let i = 0; i < neuron_locations.length; i++)
	{
		p = neuron_locations[i];
		neuron_color = colors[i];
		fill(neuron_color[0],neuron_color[1],neuron_color[2]);
		ellipse(p[0],p[1],neuron_icon_size,neuron_icon_size);
	}
	for(let i = 0; i < probe_locations.length; i++)
	{
		p = probe_locations[i];
		fill(0);
		ellipse(p[0],p[1],probe_icon_size,probe_icon_size);
	}

	//noise label
	fill(1);
	textSize(10);
	stroke(100);
	text("noise ("+"\u03BC"+"V)",375,450);

	//label world
	textSize(10);
	fill(10);
	textStyle(ITALIC);
	text("Y-Z plane on -50 to 50 "+"\u03BC"+"m"+ " scale",10,475);
	textStyle(NORMAL);

	line(voltage_display_offset,0,voltage_display_offset,600);

	let graph_height_step_size = (graph_dimensions[1]-100)/(discovered_neurons+1);
	//console.log(graph_height_step_size);
	//console.log(graph_dimensions[1]);
	if(display_graph)
	{
		textSize(30);
		fill(10);
		text(algorithm_selection,graph_offset+graph_dimensions[0]/2-65,35);

		fill(204,204,255);
		rect(graph_buffer+graph_offset,graph_buffer,graph_dimensions[0]-100,graph_dimensions[1]-100);

		fill(5);
		stroke(100);
		textSize(15)
		text("Spikes",graph_offset+graph_dimensions[0]/2 - 5,470);
		textSize(10);
		textStyle(ITALIC);
		fill(2.5);
		text("Displayed by relative index not by time",graph_offset+graph_dimensions[0]/2 - 70,490);
		textStyle(NORMAL);



		stroke(50);
		for(let index = 0; index < spikes_per_graph; index++)
		{
			x_tics = (graph_dimensions[0]-2*graph_buffer)/spikes_per_graph;
			x_loc = graph_buffer + x_tics*index + x_tics/2 + graph_offset;
			y_loc = 450;
			line(x_loc,y_loc-5,x_loc,y_loc+5);
			if(index + group_selection < performance_trace.length)
			{
				let current_spike = performance_trace[index+group_selection];
				y_loc = 50 + (parseInt(current_spike[1])+1)*graph_height_step_size;
				let description_symbol = 'n';
				textSize(10);
				if(current_spike[2] === '-1')
				{
					fill(225,0,0);
					description_symbol = '\u2716';
				}
				else if(current_spike[1] === current_spike[2])
				{
					fill(0,225,0);
					description_symbol = '\u2714';
				}
				else
				{
					fill(51,153,255);
					description_symbol = '?';

				}
				if(!icons_built)
				{
					icon_positions.push([x_loc-2.25,y_loc]);
				}
				text(description_symbol,x_loc-2.25,y_loc);
			}
		}
		icons_built = true;

		
		for(let index = 0; index < discovered_neurons; index++)
		{
			x_loc = 50 + graph_offset;
			y_loc = 50 + graph_height_step_size*(index+1);
			line(x_loc-5,y_loc,x_loc+5,y_loc);
			let neuron_color = colors[index];
			fill(neuron_color[0],neuron_color[1],neuron_color[2]);
			ellipse(x_loc,y_loc,neuron_tic_size,neuron_tic_size);
		}


		textSize(25);
		fill(10);
		text("Probe Traces",voltage_display_offset+5,30);
		if(voltage_trace_id !== -1)
		{
			for(let i = 0; i < probe_locations.length; i++)
			{
				fill(204,204,255);
				p = probe_locations[i];
				rect(voltage_display_offset+25,p[1]-35,150,75);
				let my_trace = voltage_traces[i].slice(voltage_trace_id-31,voltage_trace_id+64);
				let delta_t = 150/96;
				stroke(10);
				let x_cur;
				let y_cur;
				let x_next;
				let y_next;
				for(let t = 0; t < 95; t++)
				{
					x_cur = t*delta_t + voltage_display_offset+25;
					x_next = (t+1)*delta_t + voltage_display_offset+25;
					y_cur = (my_trace[t])*50/2500 + (p[1]-35) + 37.5 + 20;
					y_next = (my_trace[t+1])*50/2500 + (p[1]-35) + 37.5 + 20;
					line(x_cur, y_cur, x_next,y_next);
				}
				spike_location = [voltage_display_offset+25+31*delta_t,p[1]+40];
				line(spike_location[0],spike_location[1]+5,spike_location[0],spike_location[1]-5);
				if(i == 3)
				{
					spike_location = [voltage_display_offset+25+31*delta_t,p[1]+40];
					line(spike_location[0],spike_location[1]+5,spike_location[0],spike_location[1]-5);
					textSize(10);
					fill(10);
					stroke(100);
					text("Spike",spike_location[0]-10,spike_location[1]+20);
					text("-1 ms",voltage_display_offset+5,spike_location[1]+20);
					text("+2 ms",voltage_display_offset+150,spike_location[1]+20);
				}			
			}
			spike_time = selected_spike[0]/32;
			textSize(15);
			fill(10);
			stroke(100);
			text("Neuron "+selected_spike[1]+" spiked at "+spike_time.toFixed(2)+"ms",voltage_display_offset+2.5,spike_location[1]+60);
			if(selected_spike[2]=== selected_spike[1])
			{	
				fill(0,225,0);
				textStyle(ITALIC);
				text("Hit",voltage_display_offset+5,spike_location[1]+80);
				textStyle(NORMAL);
				fill(10);
			}
			else if(selected_spike[2] === "-1")
			{
				fill(255,0,0);
				textStyle(ITALIC);
				text("Miss",voltage_display_offset+5,spike_location[1]+80);
				textStyle(NORMAL);
				fill(10);
			}
			else
			{
				let misassigned_neuron = (parseInt(selected_spike[2]) > -2) ? selected_spike[2] : "fabricated neuron "+((parseInt(selected_spike[2])*-1)-1) 
				fill(51,153,255);
				textStyle(ITALIC);
				text("Misassigned to neuron "+misassigned_neuron,voltage_display_offset+5,spike_location[1]+80);
				textStyle(NORMAL);
				fill(10);
			}

		}

		//draw summary statistics
		if(display_graph)
		{
			textSize(20);
			fill(10);
			text("Summary Statistics",10,mid_section_boundary+25);
			textSize(15);
			for(let i = 0; i < discovered_neurons; i++)
			{
				let my_summary_statistics = summary_statistics[i];
				x_loc = 25 + (i%3)*300;
				y_loc = mid_section_boundary+45 + Math.floor(i/3)*85;
				let neuron_color = colors[i];
				fill(neuron_color[0],neuron_color[1],neuron_color[2]);
				ellipse(x_loc,y_loc,20,20);
				fill(204,204,255);
				rect(x_loc+5,y_loc+10,200,58);
				fill(10);
				if((my_summary_statistics[1] == -1) || (my_summary_statistics[2] == -1))
				{
					text(my_summary_statistics[0],x_loc+5,y_loc+27.5);
					textStyle(ITALIC);
					text("neuron not discovered",x_loc+5,y_loc+52);
					textStyle(NORMAL);
				}
				else
				{
					//text("true spikes",x_loc+5,y_loc+17.5);
					text(my_summary_statistics[0],x_loc+5,y_loc+27.5);
					//text("predicted spikes",x_loc+68,y_loc+17.5);
					text(my_summary_statistics[1],x_loc+68,y_loc+27.5);
					//text("true positive rate",x_loc+5,y_loc+42);
					text(my_summary_statistics[2].toFixed(3),x_loc+5,y_loc+52);
					//text("false negative rate",x_loc+68,y_loc+42);
					text(my_summary_statistics[3].toFixed(3),x_loc+68,y_loc+52);
					//text("false prediction rate",x_loc+120,y_loc+42);
					text(my_summary_statistics[4].toFixed(3),x_loc+120,y_loc+52);
				}
			}

			let x_offset = -75;
			let y_offset = 30;

			let x_left = -70;
			let x_right = 140;
			let y_top = 40;
			let y_bottom = 90;

			let y_data = 25;

			textSize(30);
			fill(10);
			text("Overall Statistics",total_statistics_banner_position[0] + x_offset - 20,total_statistics_banner_position[1] + y_offset - 5);
			textSize(20);
			text("True Spikes",total_statistics_banner_position[0]+x_left + x_offset,total_statistics_banner_position[1]+y_top + y_offset);
			text(total_statistics[0],total_statistics_banner_position[0]+x_left + x_offset,total_statistics_banner_position[1]+y_top+y_data + y_offset);
			if(total_statistics[1] != "-1")
				{
				text("Predicted Spikes",total_statistics_banner_position[0]+x_right + x_offset,total_statistics_banner_position[1]+y_top + y_offset);
				text(total_statistics[1],total_statistics_banner_position[0]+x_right + x_offset,total_statistics_banner_position[1]+y_top+y_data + y_offset);
				text("True positive rate",total_statistics_banner_position[0]+x_left + x_offset,total_statistics_banner_position[1]+y_bottom + y_offset);
				text(total_statistics[2].toFixed(3),total_statistics_banner_position[0]+x_left + x_offset,total_statistics_banner_position[1]+y_bottom+y_data + y_offset);
				text("False negative rate",total_statistics_banner_position[0]+x_right + x_offset,total_statistics_banner_position[1]+y_bottom + y_offset);
				text(total_statistics[3].toFixed(3),total_statistics_banner_position[0]+x_right + x_offset,total_statistics_banner_position[1]+y_bottom+y_data + y_offset);
				text("False prediction rate",total_statistics_banner_position[0]+x_right+210 + x_offset,total_statistics_banner_position[1]+y_bottom + y_offset);
				text(total_statistics[4].toFixed(3),total_statistics_banner_position[0]+x_right+210 + x_offset,total_statistics_banner_position[1]+y_bottom+y_data + y_offset);
			}
			else
			{
				textStyle(ITALIC);
				text("No Neurons Discovered",total_statistics_banner_position[0]+x_left + x_offset,total_statistics_banner_position[1]+y_bottom + y_offset);
				textStyle(NORMAL);
			}

		}

		//display fabricated neurons stats
		if(display_graph && (num_fabricated > 0))
		{
			textSize(20);
			fill(255,0,0);
			let neuron_word =(num_fabricated>1) ? "neurons" : "neuron";
			text(num_fabricated+" fabricated "+neuron_word+" found!",voltage_display_offset+5,520);
			let x_loc;
			let y_loc;
			textSize(15);
			for(let i = 0; i < num_fabricated; i++)
			{
				x_loc = voltage_display_offset+5 + (i%2)*150;
				y_loc = 540 + int(i/2)*25;
				num_spikes = fabricated_spikes[str(-2-i)];
				text(str(i+1)+": "+str(num_spikes)+" spikes",x_loc,y_loc);
			}
		}


	}

}

function mouseClicked()
{
	if(!enter_parameters_mode)
	{

		if(clear_neurons_flag)
		{
			clear_neurons_flag = false;
			return;
		}
		if(place_neurons_mode)
		{
			if((neuron_locations.length < 6) && (mouseX < 500) && (mouseY < 500))
			{
				neuron_locations.push([mouseX,mouseY]);

				adjustedYpos = Math.floor((mouseX - mid)/5);
				adjustedZpos = Math.floor((mouseY - mid)/5);

				new_parameters = {'xpos':default_x_offset,'ypos':adjustedYpos,'zpos':adjustedZpos,
			                     'rate':default_rate,'model':default_model};
			    neuron_parameters.push(new_parameters);
			}
		}
		else
		{
			for(let i = 0; i < neuron_locations.length; i++)
			{
				p = neuron_locations[i];
				if(dist(p[0],p[1],mouseX,mouseY) < (neuron_icon_size/2))
				{
					enter_parameters_mode = true;
					show_parameters(i);
					selected_neuron_num = i;
					return;
				}
			}

			if(display_graph)
			{
				for(let i = 0; i < icon_positions.length; i++)
				{
					p = icon_positions[i];
					if(dist(p[0],p[1],mouseX,mouseY) < performance_icon_size)
					{
						voltage_trace_id = performance_trace[i+group_selection][0];
						selected_spike = performance_trace[i+group_selection];
						return;
					}
				}
			}
		}

		if(place_neurons_intermediate)
		{
			place_neurons_mode = true;
		}
	}
}

function change_mode()
{
	if(!enter_parameters_mode)
	{
		if(!place_neurons_intermediate)
		{
			place_neurons_intermediate = true;
		}
		else
		{
			place_neurons_intermediate = false;
			place_neurons_mode = false;
		}
	}
}

function clear_neurons()
{
	if(!enter_parameters_mode)
	{
		neuron_locations = [];
		neuron_parameters = [];
		clear_neurons_flag = true;
	}
}

function show_parameters(neuron_num)
{
	target_parameters = neuron_parameters[neuron_num];
	parameters_header.show();
	rate_input.show();
	rate_input_header.show();
	x_offset_input.show();
	x_offset_input_header.show();
	neuron_type_select.show();
	neuron_type_select_header.show();
	neuron_parameters_go.show();
	neuron_parameters_cancel.show();
	y_position_input.show();
	y_position_input_header.show();
	z_position_input.show();
	z_position_input_header.show();
	delete_neuron_button.show();

	rate_input.value(target_parameters['rate']);
	x_offset_input.value(target_parameters['xpos']);
	neuron_type_select.value(cellmodel_names[target_parameters['model']]);
	y_position_input.value(target_parameters['ypos']);
	z_position_input.value(target_parameters['zpos']);
}

function hide_parameters()
{
	parameters_header.hide();
	rate_input.hide();
	rate_input_header.hide();
	x_offset_input.hide();
	x_offset_input_header.hide()
	y_position_input.hide();
	y_position_input_header.hide();
	z_position_input.hide();
	z_position_input_header.hide();
	neuron_type_select.hide();
	neuron_type_select_header.hide();
	neuron_parameters_go.hide();
	neuron_parameters_cancel.hide();
	delete_neuron_button.hide();
}


function submit_parameters()
{
	neuron_parameters[selected_neuron_num]['rate'] = rate_input.value();
	neuron_parameters[selected_neuron_num]['model'] = cellmodel_labels[neuron_type_select.value()];
	console.log(cellmodel_labels[neuron_type_select.value()]);
	neuron_parameters[selected_neuron_num]['xpos'] = x_offset_input.value();
	neuron_parameters[selected_neuron_num]['ypos'] = y_position_input.value();
	neuron_parameters[selected_neuron_num]['zpos'] = z_position_input.value();
	neuron_locations[selected_neuron_num][0] = y_position_input.value()*5 + mid;
	neuron_locations[selected_neuron_num][1] = z_position_input.value()*5 + mid;
	hide_parameters();
	enter_parameters_mode = false;
	
}

function cancel_parameters()
{
	for(let i = 0; i < neuron_parameters.length; i++)
	{
		console.log(neuron_parameters[i]);
	}
	hide_parameters();
	enter_parameters_mode = false;
	
}


function run_simulation()
{
	if(!enter_parameters_mode)
	{
		//parse neuron parameters into http string
		//send string over with xmlhttp crap

		var my_data_string = "probe_type="+default_probe_type+'&'+
				  "duration="+default_duration+'&'+
				  "noise_type="+default_noise_type+'&'+
				  "noise_standard_deviation="+noise_input.value()+'&'+
				  "number_of_cells="+str(neuron_parameters.length)+'&'+
				  "sorting_algorithm="+default_sorting_algorithm+'&';
		for(let i = 0; i < neuron_parameters.length; i++)
		{
			let cur_parameters = neuron_parameters[i];
			my_data_string += 'xpos_'+str(i)+'='+cur_parameters['xpos']+'&';
			my_data_string += 'ypos_'+str(i)+'='+cur_parameters['ypos']+'&';
			my_data_string += 'zpos_'+str(i)+'='+cur_parameters['zpos']+'&';
			my_data_string += 'model_'+str(i)+'='+cur_parameters['model']+'&';
			my_data_string += 'rate_'+str(i)+'='+cur_parameters['rate']+'&';
		}
		console.log(my_data_string);
		send_parameters(my_data_string);
	}
}



function send_parameters(data_string)
{

	var xhr = new XMLHttpRequest();
	xhr.open("POST", '/run', true);

	//Send the proper header information along with the request
	xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");

	xhr.onreadystatechange = function() { // Call a function when the state changes.
	    if (this.readyState === XMLHttpRequest.DONE && this.status === 200) {
	        console.log('success');
	        synth_output = JSON.parse(this.responseText);
	        let synth_output_selection = synth_output['tridesclous'];
	        performance_trace = synth_output_selection['performance_trace'];
	        voltage_traces = synth_output_selection['voltage_traces'];
	        discovered_neurons = synth_output_selection['discovered_neurons'];
	        summary_statistics = synth_output_selection['summary_statistics'];
	        total_statistics = synth_output_selection['total_statistics'];
	        num_fabricated = synth_output_selection['num_fabricated'];
	        fabricated_spikes = synth_output_selection['fabricated_spikes'];
	        algorithm_selection = "Tridesclous";
	        //console.log(summary_statistics);
	        //console.log(total_statistics);
	        display_graph = true;
			//console.log(discovered_neurons);
			final_selection_begin = performance_trace.length - (((performance_trace.length % spikes_per_graph) === 0) 
														? spikes_per_graph : (performance_trace.length % spikes_per_graph));
			icon_positions = [];
			icons_built = false;

			tridesclous_button.show();
			ironclust_button.show();
			klusta_button.show();

	    }
	}
	xhr.send(data_string);

}


function selection_forward()
{
	if(group_selection < final_selection_begin)
	{
		group_selection = group_selection + spikes_per_graph;
		//console.log(icon_positions);
		icon_positions = [];
		icons_built = false;
	}
}

function selection_backward()
{
	if(group_selection > 0)
	{
		group_selection = group_selection - spikes_per_graph;
		//console.log(icon_positions);
		icon_positions = [];
		icons_built = false;
	}
}

function select_tridesclous()
{
    let synth_output_selection = synth_output['tridesclous'];
    performance_trace = synth_output_selection['performance_trace'];
    voltage_traces = synth_output_selection['voltage_traces'];
    discovered_neurons = synth_output_selection['discovered_neurons'];
    summary_statistics = synth_output_selection['summary_statistics'];
    total_statistics = synth_output_selection['total_statistics'];
    num_fabricated = synth_output_selection['num_fabricated'];
    fabricated_spikes = synth_output_selection['fabricated_spikes'];
    //console.log(summary_statistics);
    //console.log(total_statistics);
    display_graph = true;
	//console.log(discovered_neurons);
	final_selection_begin = performance_trace.length - (((performance_trace.length % spikes_per_graph) === 0) 
												? spikes_per_graph : (performance_trace.length % spikes_per_graph));
	icon_positions = [];
	icons_built = false;

	algorithm_selection = "Tridesclous";
}


function select_ironclust()
{
    let synth_output_selection = synth_output['ironclust'];
    performance_trace = synth_output_selection['performance_trace'];
    voltage_traces = synth_output_selection['voltage_traces'];
    discovered_neurons = synth_output_selection['discovered_neurons'];
    summary_statistics = synth_output_selection['summary_statistics'];
    total_statistics = synth_output_selection['total_statistics'];
    num_fabricated = synth_output_selection['num_fabricated'];
    fabricated_spikes = synth_output_selection['fabricated_spikes'];
    //console.log(summary_statistics);
    //console.log(total_statistics);
    display_graph = true;
	//console.log(discovered_neurons);
	final_selection_begin = performance_trace.length - (((performance_trace.length % spikes_per_graph) === 0) 
												? spikes_per_graph : (performance_trace.length % spikes_per_graph));
	icon_positions = [];
	icons_built = false;

	algorithm_selection = "Ironclust";
}


function select_klusta()
{
    let synth_output_selection = synth_output['klusta'];
    performance_trace = synth_output_selection['performance_trace'];
    voltage_traces = synth_output_selection['voltage_traces'];
    discovered_neurons = synth_output_selection['discovered_neurons'];
    summary_statistics = synth_output_selection['summary_statistics'];
    total_statistics = synth_output_selection['total_statistics'];
    num_fabricated = synth_output_selection['num_fabricated'];
    fabricated_spikes = synth_output_selection['fabricated_spikes'];
    //console.log(summary_statistics);
    //console.log(total_statistics);
    display_graph = true;
	//console.log(discovered_neurons);
	final_selection_begin = performance_trace.length - (((performance_trace.length % spikes_per_graph) === 0) 
												? spikes_per_graph : (performance_trace.length % spikes_per_graph));
	icon_positions = [];
	icons_built = false;

	algorithm_selection = "KlustaKwik";
}

function delete_neuron()
{
	neuron_parameters.splice(selected_neuron_num,1);
	neuron_locations.splice(selected_neuron_num,1);
	hide_parameters();
	enter_parameters_mode = false;

}