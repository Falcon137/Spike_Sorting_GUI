import os
import yaml
import spikeinterface.extractors as se
import spikeinterface.sorters as ss
import spikeinterface.comparison as sc
import spikeinterface.toolkit as st
import spikeinterface.widgets as sw
import matplotlib.pylab as plt
import numpy as np
import seaborn as sns
import pandas as pd
import h5py
import numpy as np
import json
import pickle

def extract_matchings(confusion_matrix):
	print(confusion_matrix)
	matchings = {}
	true_to_predicted_matchings = {}
	discovered_neurons = confusion_matrix.axes[1]
	discovered_neurons = list(discovered_neurons[:len(discovered_neurons)-1])
	true_neurons = confusion_matrix.axes[0]
	true_neurons = list(true_neurons[:len(true_neurons)-1])
	#true_neurons.sort()
	overshoot = len(discovered_neurons)-len(true_neurons)
	fabricated_neurons = []
	fabricated_matchings = {}
	if overshoot > 0:
		fabricated_neurons = discovered_neurons[len(discovered_neurons)-overshoot:len(discovered_neurons)]
		discovered_neurons = discovered_neurons[:len(discovered_neurons)-overshoot] 
		for k in range(len(fabricated_neurons)):
			fabricated_matchings[str(fabricated_neurons[k])] = str(-2 - k)
	for k in range(len(discovered_neurons)):
		matchings[str(discovered_neurons[k])] = str(true_neurons[k])
		true_to_predicted_matchings[str(true_neurons[k])] = str(discovered_neurons[k])

	return true_to_predicted_matchings,matchings,fabricated_matchings

def assess_true_spikes(true_spikes,predicted_spikes,matchings):
	all_predicted_spikes = predicted_spikes
	temp_predicted_spikes = {}
	for k in matchings.keys():
		temp_predicted_spikes[k] = predicted_spikes[k]
	predicted_spikes = temp_predicted_spikes
	assessed_true_spikes = []
	for k in true_spikes.keys():
		assessed_true_spikes += [[int(spike_time), k,'-1'] for spike_time in true_spikes[k]]
	assessed_true_spikes.sort(key=lambda el: el[0])
	frame_window = 8 #16 frame range implies .5ms detection window
	#print(assessed_true_spikes[:100])

	pred_spikes_remaining = {}
	for k in matchings.keys():
		pred_spikes_remaining[k] = []

	hit_count = [0]*len(true_spikes.keys())  #I think it will be more straight forward to store the true neuron number
	ps_keys = predicted_spikes.keys()
	array_indices = [0]*len(ps_keys)
	for true_spike_index,el in enumerate(assessed_true_spikes):
		cur_spike_time = el[0]
		for (index,my_key) in enumerate(ps_keys):
			if matchings[my_key] == el[1]:
				pred_neuron_spikes = predicted_spikes[my_key]
				while (array_indices[index] < len(pred_neuron_spikes)) and (pred_neuron_spikes[array_indices[index]] <= cur_spike_time+frame_window):
					if pred_neuron_spikes[array_indices[index]] >= cur_spike_time-frame_window:
						assessed_true_spikes[true_spike_index][2] = (matchings[my_key])
						array_indices[index] += 1
						hit_count[int(matchings[my_key])] += 1
						break
					else:
						pred_spikes_remaining[my_key].append(pred_neuron_spikes[array_indices[index]])
						array_indices[index] += 1



	ps_keys = predicted_spikes.keys()
	array_indices = [0]*len(ps_keys)
	for true_spike_index,el in enumerate(assessed_true_spikes):
		cur_spike_time = el[0]
		for (index,my_key) in enumerate(ps_keys):
			pred_neuron_spikes = pred_spikes_remaining[my_key]
			if (el[2] == "-1") and (matchings[my_key] != el[1]):
				while (array_indices[index] < len(pred_neuron_spikes)) and (pred_neuron_spikes[array_indices[index]] <= cur_spike_time+frame_window):
					if pred_neuron_spikes[array_indices[index]] >= cur_spike_time-frame_window:
						assessed_true_spikes[true_spike_index][2] = (matchings[my_key])
						array_indices[index] += 1
						break
					else:
						array_indices[index] += 1

	total_true_positive_rate = sum(hit_count)/len(assessed_true_spikes)
	total_false_positive_rate = (len(assessed_true_spikes)-sum(hit_count))/len(assessed_true_spikes)
	#num_predictions = sum([len(all_predicted_spikes[key]) for key in matchings.keys()])
	num_predictions = sum([len(all_predicted_spikes[k]) for k in all_predicted_spikes.keys()])
	#need to pass fabricated matchings to this method
	num_bad_predictions = num_predictions-sum(hit_count)
	total_false_predicition_rate = num_bad_predictions/num_predictions
	total_statistics = [total_true_positive_rate,total_false_positive_rate,total_false_predicition_rate]


	true_positive_rates = [hit_count[k]/len(true_spikes[str(k)]) if hit_count[k] > 0 else -1 for k in range(len(hit_count))]
	false_negative_rates = [1 - tp for tp in true_positive_rates]
	false_prediction_rates = []
	for index in range(len(hit_count)):
		predicted_neuron = -1
		for k in matchings.keys():
			if matchings[k] == str(index):
				predicted_neuron = int(k)
				break
		if (predicted_neuron == -1):
			false_prediction_rates.append(-1)
		else:
			rate = (len(predicted_spikes[str(predicted_neuron)]) - hit_count[index])/len(predicted_spikes[str(predicted_neuron)])
			false_prediction_rates.append(rate)

	return total_statistics,true_positive_rates,false_negative_rates,false_prediction_rates,assessed_true_spikes

def check_for_fabricated(assessed_true_spikes,predicted_spikes,fabricated_matchings):
	ps_keys = fabricated_matchings.keys()
	print(predicted_spikes.keys())
	array_indices = [0]*len(ps_keys)
	frame_window = 8
	for true_spike_index,el in enumerate(assessed_true_spikes):
		cur_spike_time = el[0]
		for (index,my_key) in enumerate(ps_keys):
			pred_neuron_spikes = predicted_spikes[my_key]
			if (el[2] == "-1"):
				while (array_indices[index] < len(pred_neuron_spikes)) and (pred_neuron_spikes[array_indices[index]] <= cur_spike_time+frame_window):
					if pred_neuron_spikes[array_indices[index]] >= cur_spike_time-frame_window:
						assessed_true_spikes[true_spike_index][2] = (fabricated_matchings[my_key])
						array_indices[index] += 1
						break
					else:
						array_indices[index] += 1
	return assessed_true_spikes

def assess_no_neurons(true_spikes):
	assessed_true_spikes = []
	for k in true_spikes.keys():
		assessed_true_spikes += [[int(spike_time), k,'-1'] for spike_time in true_spikes[k]]
	assessed_true_spikes.sort(key=lambda el: el[0])
	return assessed_true_spikes

##################################################
#Generate Consolidated Templates 
##################################################

base_directory = os.getcwd()+'/' #NEED TO CHANGE THIS FOR WEB DEPLOYMENT!
parameters = yaml.full_load(open('client_parameters.yaml'))
selected_probe = parameters['probe_type']
template_creation_folder = 'template_creation/'
os.system('mkdir '+template_creation_folder)


for cell_id in parameters['cells'].keys():
	cell = parameters['cells'][cell_id]
	individual_model_folder = cell_id+'_template'
	os.system('mkdir '+base_directory+individual_model_folder)
	os.system('cp -r '+base_directory+'all_models/'+cell['model']+' '+individual_model_folder)
	os.system('./mearec gen-templates -fn '+base_directory+template_creation_folder+'/'+cell_id+'.h5 '+' -cf '+base_directory+individual_model_folder+' -prb '+selected_probe+ ' -r norot -n 1'+
			  ' -prm '+base_directory+'templates_params.yaml'+
		      ' -xl '+cell['position']['xpos']+' '+cell['position']['xpos']+'.01'+
		      ' -yl '+cell['position']['ypos']+' '+cell['position']['ypos']+'.01'+
		      ' -zl '+cell['position']['zpos']+' '+cell['position']['zpos']+'.01'+' -v') #added verbose mode
	os.system('rm -rf '+individual_model_folder)

os.system('python3 build_h5.py')



##############################################
#Generate Recording
##############################################
parameters = yaml.full_load(open('client_parameters.yaml'))
recordings_parameters = yaml.full_load(open('default_recordings_parameters.yaml'))	

my_rates = []
my_types = []
for cell_id in parameters['cells'].keys():
	my_rates.append(parameters['cells'][cell_id]['rate'])

recordings_parameters['spiketrains']['rates'] = my_rates

for cell_id in parameters['cells'].keys():
	my_types.append(parameters['cell_categories'][parameters['cells'][cell_id]['model']])

recordings_parameters['spiketrains']['types'] = my_types


# Noise Parameters
recordings_parameters['recordings']['noise_mode'] = parameters['noise']['type']
recordings_parameters['recordings']['noise_level'] = parameters['noise']['standard_deviation']

yaml.dump(recordings_parameters, open('my_recordings_parameters.yaml','w')) #default_flow_style=False ???

os.system('./mearec gen-recordings -fn '+base_directory+'new_recording.h5 -t '+base_directory+'combined_templates.h5 '
	+' -prm '+base_directory+'my_recordings_parameters.yaml'+' -d '+parameters['duration']+' -v')




###############################################
# Run Analysis
##############################################
synth_output = {}
sorting_algorithm_choices = ['tridesclous','ironclust','klusta']
recording = se.MEArecRecordingExtractor('new_recording.h5')
sorting_GT = se.MEArecSortingExtractor('new_recording.h5')
for el in sorting_algorithm_choices:
	sorting_algorithm = el

	if sorting_algorithm == 'tridesclous':
		sorting_result = ss.run_tridesclous(recording)
	elif sorting_algorithm == 'klusta':
		avg_accuracy = -1
		for k in range(7):
			temp_sorting_result = ss.run_klusta(recording)
			comp = sc.compare_sorter_to_ground_truth(sorting_GT, temp_sorting_result)
			perf = str(comp.get_performance())
			perf = perf.split('\n')
			perf = perf[2:len(perf)]
			accuracies = []
			for line in perf:
				accuracies.append( float((line.split())[1]) )
			temp_avg_accuracy = sum(accuracies)/len(accuracies)
			if(temp_avg_accuracy > avg_accuracy):
				avg_accuracy = temp_avg_accuracy
				sorting_result = temp_sorting_result
	elif sorting_algorithm == 'herdingspikes':
		sorting_result = ss.run_herdingspikes(recording)
	elif sorting_algorithm == 'ironclust':
		sorting_result = ss.run_ironclust(recording)
	elif sorting_algorithm == 'kilosort':
		sorting_result = ss.run_kilosort(recording)
	elif sorting_algorithm == 'waveclus':
		sorting_result = ss.run_waveclus(recording)

	comp = sc.compare_sorter_to_ground_truth(sorting_GT, sorting_result)
	data = h5py.File('new_recording.h5','r')

	true_spikes = {}

	for neuron_id in sorting_GT.get_unit_ids():
		true_spikes[str(neuron_id)] = (sorting_GT.get_unit_spike_train(unit_id=neuron_id))


	true_to_predicted_matchings,matchings,fabricated_matchings = extract_matchings(comp.get_confusion_matrix())
	print("matchings:")
	print(matchings)
	print("fabricated_matchings:")
	print(fabricated_matchings)

	predicted_spikes = {}

	for my_key in fabricated_matchings.keys():
		predicted_spikes[my_key] = sorting_result.get_unit_spike_train(unit_id=int(my_key))

	for my_key in matchings.keys():
		predicted_spikes[my_key] = sorting_result.get_unit_spike_train(unit_id=int(my_key))



	numpy_traces = recording.get_traces()
	voltage_traces = []
	for k in range(4):
		voltage_traces.append([int(el) for el in numpy_traces[k]])



	if (predicted_spikes == {}):
		summary_statistics = []
		total_statistics = [0]*5
		for k in range(len(sorting_GT.get_unit_ids())):
			new_entry = [len(true_spikes[str(k)]),-1,-1,-1,-1]
			summary_statistics.append(new_entry)
			total_statistics[0] += new_entry[0]


		num_predicted = [len(predicted_spikes[k]) for k in predicted_spikes.keys()]
		total_statistics[1] = -1
		total_statistics[2] = -1
		total_statistics[3] = -1
		total_statistics[4] = -1

		assessed_true_spikes = assess_no_neurons(true_spikes)


		synth_output[sorting_algorithm] = {'voltage_traces':voltage_traces,'performance_trace':assessed_true_spikes, 'results':'no spikes', 'discovered_neurons':len(sorting_GT.get_unit_ids())
													,'num_fabricated':0,'fabricated_spikes':{},'summary_statistics':summary_statistics,'total_statistics':total_statistics}
		continue

	(my_total_statistics,true_positive_rates,false_negative_rates,false_prediction_rates,assessed_true_spikes) = assess_true_spikes(true_spikes,predicted_spikes,matchings)

	assessed_true_spikes = check_for_fabricated(assessed_true_spikes,predicted_spikes,fabricated_matchings)
	 
	summary_statistics = []
	total_statistics = [0]*5
	true_neurons_discovered = [matchings[k] for k in matchings.keys()]
	for k in range(len(sorting_GT.get_unit_ids())):
		pred_spikes = -1
		if str(k) in true_to_predicted_matchings.keys():
			pred_spikes = len(predicted_spikes[true_to_predicted_matchings[str(k)]])
		new_entry = [len(true_spikes[str(k)]),pred_spikes,true_positive_rates[k],false_negative_rates[k],false_prediction_rates[k]]
		summary_statistics.append(new_entry)
		total_statistics[0] += new_entry[0]


	num_predicted = [len(predicted_spikes[k]) for k in predicted_spikes.keys()]
	total_statistics[1] = sum(num_predicted)
	total_statistics[2] = my_total_statistics[0]
	total_statistics[3] = my_total_statistics[1]
	total_statistics[4] = my_total_statistics[2]

	fabricated_spikes = {}
	for k in fabricated_matchings.keys():
		fabricated_spikes[fabricated_matchings[k]] = len(predicted_spikes[k])

	num_fabricated = len(fabricated_matchings.keys())

	synth_output[sorting_algorithm] = {'voltage_traces':voltage_traces,'performance_trace':assessed_true_spikes, 'results':str(comp.get_performance()), 'discovered_neurons':len(sorting_GT.get_unit_ids())
													,'num_fabricated':num_fabricated,'fabricated_spikes':fabricated_spikes,'summary_statistics':summary_statistics,'total_statistics':total_statistics}


pickle.dump(synth_output, open('synth_output.pickle','wb'))
###############################################
# CLEAN UP
##############################################
os.system('rm client_parameters.yaml')
os.system('rm new_recording.h5')
os.system('rm -rf template_creation/')
os.system('rm combined_templates.h5')
os.system('rm my_recordings_parameters.yaml')








	
