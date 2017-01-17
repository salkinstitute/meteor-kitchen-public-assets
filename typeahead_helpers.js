
typeaheadSelected = function(event, suggestion, datasetName){
  $('input[name='+event.target.name+']').typeahead('val', suggestion.id);   
}

typeaheadSelectedDeptHeadName = function(event, suggestion, datasetName){
  $('input[name='+event.target.name+']').typeahead('val', suggestion.id);  
  $('input[name="dept_head_name"]').val(suggestion.value);   
}