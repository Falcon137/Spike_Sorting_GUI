addpath('/home/alex/anaconda3/lib/python3.7/site-packages/spikesorters/ironclust');
addpath('/home/alex/Desktop/Fall_2020/Spike_Sorting/external_sorters/ironclust', '/home/alex/Desktop/Fall_2020/Spike_Sorting/external_sorters/ironclust/matlab', '/home/alex/Desktop/Fall_2020/Spike_Sorting/external_sorters/ironclust/matlab/mdaio');
try
    p_ironclust('/home/alex/Desktop/Fall_2020/Spike_Sorting/Spike_Sorting_GUI/ironclust_output/tmp', '/home/alex/Desktop/Fall_2020/Spike_Sorting/Spike_Sorting_GUI/ironclust_output/ironclust_dataset/raw.mda', '/home/alex/Desktop/Fall_2020/Spike_Sorting/Spike_Sorting_GUI/ironclust_output/ironclust_dataset/geom.csv', '', '', '/home/alex/Desktop/Fall_2020/Spike_Sorting/Spike_Sorting_GUI/ironclust_output/tmp/firings.mda', '/home/alex/Desktop/Fall_2020/Spike_Sorting/Spike_Sorting_GUI/ironclust_output/ironclust_dataset/argfile.txt');
catch
    fprintf('----------------------------------------');
    fprintf(lasterr());
    quit(1);
end
quit(0);
        