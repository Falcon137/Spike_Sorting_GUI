import os
import yaml
from flask import render_template
from flask import Flask 
from flask import request
from flask import jsonify
import json
import time
import pickle
application = Flask(__name__)
application.config["CACHE_TYPE"] = "null"
@application.route("/")
def hello():
	return render_template('input_deck.html')

@application.route("/run",methods=['POST'])
def run_stuff():
	if request.method == 'POST':
		user_input = request.form
		print(user_input)
		parameters = yaml.full_load(open('user_parameters.yaml'))
		parameters['probe_type'] = user_input['probe_type']
		parameters['duration'] = user_input['duration']
		parameters['noise']['type'] = user_input['noise_type']
		parameters['noise']['standard_deviation'] = int(user_input['noise_standard_deviation'])
		parameters['sorting_algorithm'] = user_input['sorting_algorithm']
		number_of_cells = int(user_input['number_of_cells'])
		for n in range(number_of_cells):
			cell_id = str(n)
			parameters['cells']['c'+cell_id] = {}
			parameters['cells']['c'+cell_id]['model'] = user_input['model_'+cell_id]
			parameters['cells']['c'+cell_id]['position'] = {}
			parameters['cells']['c'+cell_id]['position']['xpos'] = user_input['xpos_'+cell_id]
			parameters['cells']['c'+cell_id]['position']['ypos'] = user_input['ypos_'+cell_id]
			parameters['cells']['c'+cell_id]['position']['zpos'] = user_input['zpos_'+cell_id]
			parameters['cells']['c'+cell_id]['rate'] = int(user_input['rate_'+cell_id])
		yaml.dump(parameters, open('client_parameters.yaml','w'))
		os.system('python3 synth.py')
		#os.system('python3 synth_backup.py')
		#exec(open('synth.py').read())
		while not os.path.exists('synth_output.pickle'):
			time.sleep(1)
		synth_output = pickle.load(open('synth_output.pickle','rb'))
		os.system('rm synth_output.pickle')
		#json.dump(synth_output['performance_trace'],open('performance_trace.txt','w'))
		#json.dump(synth_output['voltage_traces'],open('voltage_traces.txt','w'))
		return jsonify(synth_output)


if __name__ == '__main__':
	application.run(debug=True)