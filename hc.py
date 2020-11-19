import os
os.system('ls static/js > deck_name.txt')
version_number = int(open('deck_name.txt','r').read().split('_')[1])
print(version_number)
old_name = 'deckhandler_'+str(version_number)+'_.js '
print(old_name)
new_name = 'deckhandler_'+str(version_number+1)+'_.js'
print(new_name)
os.system('mv static/js/deckhandler_'+str(version_number)+'_.js '+' static/js/deckhandler_'+str(version_number+1)+'_.js')
print('mv static/js/deckhandler_'+str(version_number)+'_.js '+' static/js/deckhandler_'+str(version_number+1)+'_.js')
new_src_tag = '<script src=\"{{ url_for(\'static\', filename=\'js/'+new_name+'\') }}\"></script>'
html_file = open('templates/input_deck.html',"r").read()
#html_file = html_file.replace('<script','HERE')
#html_file = html_file.replace('</script>','HERE')
replace_substring = html_file.split('<!--here><-->')[1]
html_file = html_file.replace(replace_substring,new_src_tag)
#html_file = html_file.replace('HERE','')
open('templates/input_deck.html','w').write(html_file)

os.system('s '+' static/js/deckhandler_'+str(version_number+1)+'_.js')
os.system('python3 application.py')


