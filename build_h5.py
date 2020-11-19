import h5py
import numpy as np
import yaml
import os

## extract filename from params
parameters = yaml.full_load(open('user_parameters.yaml'))

data_default = h5py.File('test_default.h5','r')

os.system('ls template_creation > h5_filenames.txt')
h5_filenames = open('h5_filenames.txt','r').read().split('\n')
h5_files = []
for name in h5_filenames:
	if name != '':
		h5_files.append(h5py.File('template_creation/'+name,'r'))


new_file = h5py.File('combined_templates.h5','w')
h5_files[0].copy('info',new_file)

del new_file['info']['params']['xlim']
new_file['info']['params']['xlim'] = np.array(data_default['info']['params']['xlim'])

del new_file['info']['params']['ylim']
new_file['info']['params']['ylim'] = np.array(data_default['info']['params']['ylim'])

del new_file['info']['params']['zlim']
new_file['info']['params']['zlim'] = np.array(data_default['info']['params']['zlim'])

#print(h5_files[0].keys())

combined_dict = {}
for key in h5_files[0].keys():
	if key != 'info':
		combined_dict[key] = []
		for cur_h5 in h5_files:
			combined_dict[key].append(cur_h5[key][0])

for key in combined_dict.keys():
	new_file.create_dataset(key,data=np.array(combined_dict[key]))

new_file.close()
os.system('rm h5_filenames.txt')
