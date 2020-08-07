/*Version du 07_08_2020
 Alexandre Cormier*/

 /*Mets les valeurs de transformgate à 1 ou 0*/

function AL_Toggle_TG(){

	MessageLog.trace( "---AL_Toggle_TG--");


	
	/**************************** V A R I A B L E S **************************/



	var selectedNodes = selection.numberOfNodesSelected(); 
	var cf = frame.current(); 
	var root_node = "";
	var relevent_types = ["TransformGate","PEG"];
	
	/*VARIABLES : NODES LIST */
	var drawings_to_treat=[];
	var pegs_to_treat=[];
	var TG_to_treat=[];


	/* VARIABLES :REGEX */
	var peg_regex = /\bUp_|\bDown_|g/;
	var handles_regex = /REVERSE_HIERARCHY/g

	var START_ORDER  = ""

	/**************************** E X E C U T I O N ***********************/



	MessageLog.trace( "-------AL_Toggle_TG-------");
	
	scene.beginUndoRedoAccum("AL_Toggle_TG"); 

	fetch_nodes();
	treat_nodes();

	scene.endUndoRedoAccum();  
	
	MessageLog.trace( "--------ENDLOG-");



	/************************** F U N C T I O N S **************************/



	function fetch_nodes(){ 
	
		MessageLog.trace("fetch_nodes");
		
		//Rassemble les nodes à traiter 
		var groups_to_analyse = [];
		
		var selected_nodes = selection.selectedNodes(0);
		
		//MessageLog.trace(selected_nodes)
		
		root_node = selected_nodes[0];
		
		var parent_group = 	node.parentNode(root_node) ;
		
		groups_to_analyse.push(parent_group);
		
		if( selection.numberOfNodesSelected()>0){ 

				//MessageLog.trace( "NODES_SELECTED  "+selection.numberOfNodesSelected());
				
				var selected_nodes = selection.selectedNodes(0);

				//Première boucle parmis les nodes selectionnés
				for(var n = 0; n < selection.numberOfNodesSelected(); n++){ 

					var currentNode = selected_nodes[n];

					if(node.type(currentNode)=="GROUP"){
						
						
						//groups_to_analyse.push(currentNode);//commente __ on s'arrete au groupe actuel pas de recursif

					} 

				}  

				var number_of_groups = groups_to_analyse.length;

				
				//deuxième boucle recursive à travers les groupes 
				for (var g = 0 ; g < number_of_groups ; g ++){
					
					currentGroup = groups_to_analyse[g];
					var subNodesInGroup= node.numberOfSubNodes(currentGroup);
					
					for (var sn = 0 ; sn < subNodesInGroup; sn++){

						var sub_node_name = node.subNode(currentGroup,sn);
						var sub_node = node.subNodeByName(currentGroup,sub_node_name);
						var sub_node_type = node.type(sub_node_name);

						var shortname = getShortName(sub_node_name)

						switch(sub_node_type ){

							case "GROUP" :

							break;
							case "READ" :

							case "PEG" :

							break;
							case "TransformGate" :
								TG_to_treat.push(sub_node_name)
							break;
						}

							
					}			
					
				}

			}else{  

			} 	
				
	}
	


	function treat_nodes(){
		
		MessageLog.trace(" treat_nodes");
		
		var START_STATE = 1;

		//BOUCLE PARMIS LES TRANSFORM GATE
		if(TG_to_treat.length>0){
			for (var t = 0 ; t < TG_to_treat.length ; t ++){

				if(node.type(TG_to_treat[t]) ==relevent_types[0]){

					var currentTG = TG_to_treat[t];

					if(t == 0){
						
							START_STATE = node.getTextAttr(currentTG ,cf,"targetGate");

							//Switch on off
							if(START_STATE == 0){
								START_STATE = 1
								START_ORDER = "UP"
							}else{
								START_ORDER = "DOWN"
								START_STATE = 0
							}
							
					}

					change_targetGate(currentTG,START_STATE);
					selection.addNodeToSelection(currentTG); 

				}
						
			} 			
			
			
		}
		
		if(START_STATE == 0)
		{
			START_STATE = 1
			START_ORDER = "UP"
		}else{
			START_ORDER = "DOWN"
			START_STATE = 0
		}
		

		MessageLog.trace("START_STATE "+START_STATE)

	}


	/*FUNCTIONS TREATING TRANSFORM GATE*/

	function change_targetGate(n,g){

		/*Creer une colmun si elle n'exoste pas 
		change la valuer et creer une clef dans cette column*/

		var TGcolumn = node.linkedColumn(n,"targetGate");

		if(TGcolumn != ""){

			column.setEntry(TGcolumn,0,cf,g);
			column.setKeyFrame(TGcolumn,cf);

		}else{


			//MessageLog.trace("adding new column")
			var columnName = n+"_Toggle_TG";

			TGcolumn = column.add(columnName , "BEZIER", "BOTTOM");
			column.setEntry(TGcolumn,0,cf,g);
			column.setKeyFrame(TGcolumn,cf);
			node.linkAttr(n,"targetGate",columnName );
		}

	}

	/* FUNCTION DRAWING*/

	function Change_Drawing_Sub_To(n,sub_name){

		var numLayers = Timeline.numLayers; 
		currentColumn =""; 

		for(var i = 0 ; i<numLayers;i++){

			if(Timeline.layerToNode(i)==n){

				currentColumn = Timeline.layerToColumn(i);
				if(column.type(currentColumn) == "DRAWING"){
					break;
				}
			}
		}


 		if(currentColumn != ""){

			column.setEntry(currentColumn,1,cf,sub_name);

 		}

	}


	/* FUNCTION TREATING PEGS */


	function add_Key_to_attribute(n,attribute,value,frame){
		
		MessageLog.trace("add_Key_to_attribute n = "+n+" attr "+attribute+" value "+value+"frame"+frame);
		
		if(n!=undefined){

			var currentColumn = node.linkedColumn(n,attribute);
			
			//if the column is already linked to this attribute we create a key. 
			if(currentColumn  != ""){

				column.setEntry(currentColumn,0,frame,value);
				column.setKeyFrame(currentColumn,frame);

			//otherwise we create a column and add a key to it
			}else{

				var columnName = get_unique_column_name(n+"_"+attribute)
				MessageLog.trace("adding new column"+columnName)

				currentColumn  = column.add(columnName , "BEZIER", "BOTTOM");
				column.setEntry(currentColumn,0,frame,value);
				column.setKeyFrame(currentColumn,frame);
				node.linkAttr(n,attribute,columnName );

			//MessageLog.trace(currentColumn);
			}
		}

	}
	
	function get_unique_column_name(cname){
			
		var uniqueName = cname
		
		for(var i = 0 ; i <column.numberOf();i++){
			
			var columnID = column.getName(i)
			
			var columnDisplayName = column.getDisplayName(columnID)
			
			if(columnDisplayName == uniqueName){
				
				MessageLog.trace(" MATCH ---- uniqueName : "+uniqueName+" columnDisplayName : "+columnDisplayName);
				
				if(column.removeUnlinkedFunctionColumn(columnID)){	
				
					MessageLog.trace("removeUnlinkedFunctionColumn ____ "+column.removeUnlinkedFunctionColumn(columnID))
					uniqueName = columnDisplayName;
					
				}else{
					
					uniqueName = columnDisplayName+i;
				}
				
				break;
					
			}
			
		}		
		
		return uniqueName;
	}

	function cleanValue (val){
			var clean = 0;
			if(val != NaN && val != "inf"){
				return val;
			}	
			return val;			
	}



	/* FUNCTION UTILS */
	
	function Hypothenus(x,y){
		return Math.sqrt((x*x)+(y*y)); 
	}

	function radian(degrees)
	{
	  var pi = Math.PI;
	  return degrees * (pi/180);
	}

	function check_name_pattern(n,regex){

		//Verifie sur le nom examiné contient le mots clef 
		if(n.match(regex))//MessageLog.trace(n+"--------->match!");
		return n.match(regex);
		
	}
	

	function getShortName(n){
			
		//Extrait le nom du node sans la hierarchie
		split_string = n.split("/")
		return split_string[split_string.length-1];
		
	}


	


}  


//V1

	
