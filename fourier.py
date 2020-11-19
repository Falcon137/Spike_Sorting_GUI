import numpy as np
from scipy import signal
import matplotlib.pyplot as plt
import sys
import h5py

data = h5py.File('new_recording.h5','r')
voltage_traces = np.array(data['recordings'])
fig, ax = plt.subplots(2,4)
frames_per_second = 32000
WELCH_WINDOW_LENGTH = 64000
Trial_Length = 10 #seconds
#times = np.arange(frames_per_second*Trial_Length)/frames_per_second
#voltage_traces[0] += 100*np.cos(2*np.pi*30*times)

for k in range(4):
	my_signal = voltage_traces[k]
	f, Pxx_den = signal.periodogram(my_signal,frames_per_second)
	ps_std = np.std(Pxx_den)
	index_hits = [x for x in range(len(Pxx_den)) if Pxx_den[x] > np.std(Pxx_den)*10] #np.std(Pxx_den)*10]
	prominant_frequencies = [f[x] for x in index_hits]
	print(prominant_frequencies)
	ax[k//2,k%2].plot(f[0:10000],Pxx_den[0:10000])
	ax[k//2,k%2].set_title('standard periodogram')
	#print(f[0:100])

	f, Pxx_den = signal.welch(my_signal,frames_per_second,nperseg=WELCH_WINDOW_LENGTH)
	index_hits = [x for x in range(len(Pxx_den)) if Pxx_den[x] > np.std(Pxx_den)*10]
	prominant_frequencies = [f[x] for x in index_hits]
	print(prominant_frequencies)
	ax[k//2,2+(k%2)].plot(f[0:int(1000*WELCH_WINDOW_LENGTH/frames_per_second)],Pxx_den[0:int(1000*WELCH_WINDOW_LENGTH/frames_per_second)])
	ax[k//2,2+(k%2)].set_title('welch method')
	#print(f[0:100])
plt.show()

plt.plot(range(32000),voltage_traces[0][0:32000])
plt.show()