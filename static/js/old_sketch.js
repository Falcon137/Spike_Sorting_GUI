var canvas_dimensions = [500,500];
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

var default_rate = '15';
var default_model = 'L5_BP_bAC217_1';;
var default_x_offset = '5';

var parameters_header; 
var rate_input;
var x_offset_input
var neuron_type_select;
var neuron_parameters_submit;
var neuron_parameters_cancel;
var enter_parameters_intermediate = false;

var selected_neuron_num;

var noise_input;

var simulate_button;

var default_probe_type = 'tetrode-mea-l';
var default_duration = '10';
var default_noise_type = 'uncorrelated';
var default_sorting_algorithm = 'tridesclous';


function setup() 
{
	createCanvas(canvas_dimensions[0],canvas_dimensions[1]);
	button = createButton('Place Neurons');
	button.position(0,10);
	button.mousePressed(change_mode);
	button = createButton('Clear Neurons');
	button.position(350,10);
	button.mousePressed(clear_neurons);

	parameters_header = createDiv('Enter Parameters');
	parameters_header.hide();

	rate_input = createInput('15');
	rate_input.hide();

	x_offset_input = createInput('5');
	x_offset_input.hide();

	neuron_type_select = createSelect();
	neuron_type_select.option('L5_BP_bAC217_1');
	neuron_type_select.option('L5_BTC_bAC217_1');
	neuron_type_select.option('L5_ChC_cACint209_1');
	neuron_type_select.option('L5_DBC_bAC217_1');
	neuron_type_select.option('L5_LBC_bAC217_1');
	neuron_type_select.option('L5_NBC_bAC217_1');
	neuron_type_select.option('L5_NGC_bNAC219_1');
	neuron_type_select.option('L5_SBC_bNAC219_1');
	neuron_type_select.option('L5_STPC_cADpyr232_1');
	neuron_type_select.option('L5_TTPC1_cADpyr232_1');
	neuron_type_select.option('L5_TTPC2_cADpyr232_1');
	neuron_type_select.option('L5_UTPC_cADpyr232_1');
	neuron_type_select.hide();

	neuron_parameters_go = createButton('Submit');
	neuron_parameters_go.mousePressed(submit_parameters);
	neuron_parameters_go.hide();

	neuron_parameters_cancel = createButton('Cancel');
	neuron_parameters_cancel.mousePressed(cancel_parameters);
	neuron_parameters_cancel.hide();

	noise_input = createInput('50');
	noise_input.size(100,AUTO);
	noise_input.position(375,460);

	simulate_button = createButton('Simulate');
	simulate_button.mousePressed(run_simulation);
	simulate_button.position(200,0);
}

function draw() 
{
	
	background(200);
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
}

function mouseClicked()
{
	if(!enter_parameters_mode)
	{
		/*
		if(enter_parameters_intermediate)
		{
			enter_parameters_intermediate = false;
			return;
		}*/

		if(clear_neurons_flag)
		{
			clear_neurons_flag = false;
			return;
		}
		if(place_neurons_mode)
		{
			if(neuron_locations.length < 6)
			{
				neuron_locations.push([mouseX,mouseY]);

				adjustedYpos = Math.floor((mouseX - mid)/5);
				adjustedZpos = Math.floor((mouseY - mid)/5);

				new_parameters = {'xpos':default_x_offset,'ypos':adjustedYpos,'zpos':adjustedZpos,
			                     'rate':default_rate,'model':default_model,'rate':'-1'};
			    neuron_parameters.push(new_parameters);
			}
		}
		else
		{
			for(let i = 0; i < neuron_locations.length; i++)
			{
				p = neuron_locations[i];
				if(dist(p[0],p[1],mouseX,mouseY) < neuron_icon_size)
				{
					enter_parameters_mode = true;
					show_parameters(i);
					selected_neuron_num = i;
					return;
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
	x_offset_input.show();
	neuron_type_select.show();
	neuron_parameters_go.show();
	neuron_parameters_cancel.show();
	if(target_parameters['rate'] === '-1')
	{
		rate_input.value(default_rate);
		x_offset_input.value(default_x_offset);
		neuron_type_select.value(default_model);
	}
	else
	{
		rate_input.value(target_parameters['rate']);
		x_offset_input.value(target_parameters['xpos']);
		neuron_type_select.value(target_parameters['model']);
	}
}

function hide_parameters()
{
	parameters_header.hide();
	rate_input.hide();
	x_offset_input.hide();
	neuron_type_select.hide();
	neuron_parameters_go.hide();
	neuron_parameters_cancel.hide();
}


function submit_parameters()
{
	neuron_parameters[selected_neuron_num]['rate'] = rate_input.value();
	neuron_parameters[selected_neuron_num]['model'] = neuron_type_select.value();
	neuron_parameters[selected_neuron_num]['xpos'] = x_offset_input.value();
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
	        console.log(JSON.parse(this.responseText));
	        /*results = parse_results_string(this.responseText);
	        console.log(results);
	        document.getElementById('neuron1_output').innerHTML = results[0];
	        document.getElementById('neuron2_output').innerHTML = results[1];*/
	    }
	}
	xhr.send(data_string);

}


function parse_results_string(my_string)
{
	/*
	lines = my_string.split("\n");
	//console.log(lines);
	//console.log(lines.length);
	lines_2 = lines[2] + '';
	lines_3 = lines[3] + '';
	neuron_1_line = lines_2.split(" ");
	neuron_1_line = neuron_1_line.filter(el => el !== '');
	neuron_2_line = lines_3.split(" ");
	neuron_2_line = neuron_2_line.filter(el => el !== '');
	return ["neuron 1 accuracy: "+neuron_1_line[1], "neuron 2 accuracy: "+neuron_2_line[2]];
	*/
	//TO DO
}