/*Version du 28/072020
 Alexandre Cormier*/

 /*Mets les valeurs de transformgate à 1 ou 0*/

function AL_Toggle_TG(){

	MessageLog.trace( "---AL_Reverse_hierarchy---");


	
	/**************************** V A R I A B L E S **************************/



	var selectedNodes = selection.numberOfNodesSelected(); 
	var cf = frame.current(); 
	var root_node = "";
	var relevent_types = ["TransformGate","READ","PEG"];
	
	/*VARIABLES : NODES LIST */
	var drawings_to_treat=[];
	var pegs_to_treat=[];
	var TG_to_treat=[];


	/* VARIABLES :REGEX */
	var peg_regex = /\bUp_|\bDown_|g/;
	var handles_regex = /REVERSE_HIERARCHY/g

	var START_ORDER  = ""

	/**************************** E X E C U T I O N ***********************/



	MessageLog.trace( "-------AL_Reverse_hierarchy-------");
	
	scene.beginUndoRedoAccum("AL_Reverse_Hierarchy"); 

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
						
						groups_to_analyse.push(currentNode);

					} 

				}  

				var number_of_groups = groups_to_analyse.length;

				//MessageLog.trace( "GROUPS SELECTED "+number_of_groups);
				
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
			var columnName = n+"_Reverse_Hierarchy";

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

			//MessageLog.trace(currentColumn);

			//MessageLog.trace(column.getDrawingTimings(currentColumn));
			column.setEntry(currentColumn,1,cf,sub_name);

 		}

	}


	/* FUNCTION TREATING PEGS */




	function Build_Bones(){

		//MessageLog.trace("BUILD BONES")

		//down

		DOWN_BONES["FEMUR"] = new Bone(DOWN_PEG["FEMUR"],DOWN_PEG["TIBIA"],false);
		LENGTHS["FEMUR"] = DOWN_BONES["FEMUR"].calculate_Length()
		DOWN_BONES["FEMUR"].calculate_Orientation()
		DOWN_BONES["FEMUR"].calculate_rest_vector()

		DOWN_BONES["TIBIA"] = new Bone(DOWN_PEG["TIBIA"],DOWN_PEG["CARPE"],false);
		LENGTHS["TIBIA"] = DOWN_BONES["TIBIA"].calculate_Length()
		DOWN_BONES["TIBIA"].calculate_Orientation()
		DOWN_BONES["TIBIA"].calculate_rest_vector()
		
		DOWN_BONES["CARPE"] = new Bone(DOWN_PEG["CARPE"],DOWN_PEG["PHALANGES"],false);
		LENGTHS["CARPE"] = DOWN_BONES["CARPE"].calculate_Length()
		DOWN_BONES["CARPE"].calculate_Orientation()
		DOWN_BONES["CARPE"].calculate_rest_vector()
		
		DOWN_BONES["PHALANGES"] = new Bone(DOWN_PEG["PHALANGES"],"",true);
		
		
		//MessageLog.trace("L FEMUR    "+LENGTHS["FEMUR"])
		//MessageLog.trace("L TIBIA    "+LENGTHS["TIBIA"])
		//MessageLog.trace("L CARPE    "+LENGTHS["CARPE"])


		
		//Up

		UP_BONES["FEMUR"] = new Bone(UP_PEG["FEMUR"],UP_PEG["TIBIA"],false);
		UP_BONES["FEMUR"].setLength(LENGTHS["FEMUR"])
		UP_BONES["FEMUR"].calculate_Orientation()

		UP_BONES["TIBIA"] = new Bone(UP_PEG["TIBIA"],UP_PEG["CARPE"],false);
		UP_BONES["TIBIA"].setLength(LENGTHS["TIBIA"])
		UP_BONES["TIBIA"].calculate_Orientation()

		UP_BONES["CARPE"] = new Bone(UP_PEG["CARPE"],UP_PEG["PHALANGES"],false);
		UP_BONES["CARPE"].setLength(LENGTHS["CARPE"])
		UP_BONES["CARPE"].calculate_Orientation()

		UP_BONES["PHALANGES"] = new Bone(UP_PEG["PHALANGES"],"",true);
		
		
		//var DOWN = new Hierarchy("DOWN");
		DOWN.addBone(DOWN_BONES["FEMUR"],"FEMUR")
		DOWN.addBone(DOWN_BONES["TIBIA"],"TIBIA")
		DOWN.addBone(DOWN_BONES["CARPE"],"CARPE")
		DOWN.addBone(DOWN_BONES["PHALANGES"],"PHALANGES")
		
		

	}

	/* CLASS BONE */

	function Bone(rp,ep,isRoot){

		this.rootpeg = rp;
		this.rootpoint = node.getPivot(rp,cf);
		this.length = 0;
		this.orientation = 0;
		this.rest_vector= new Vector2d(0,0)
		this.rotated_Vector = new Vector2d(0,0)

		if(isRoot==false){

			this.endpeg = ep;
			this.endpoint = node.getPivot(ep,cf);

		}

		this.calculate_rest_vector = function(){
			
			this.rest_vector = new Vector2d(this.getDistanceX(),this.getDistanceY())
			
			//MessageLog.trace("Rest VECTOR of "+this.rootpeg+" ( "+this.rest_vector.x+" "+this.rest_vector.y+" ) ")
			//MessageLog.trace("Rest VECTOR _ ANGLE : "+this.rest_vector.degreeAngle())
			//MessageLog.trace("Rest VECTOR _ LENGTH : "+this.rest_vector.length())
			
			return this.rest_vector; 
				
			
		}

		this.init_rotated_vector = function(){
			

			this.rotated_vector = new Vector2d(this.getDistanceX(),this.getDistanceY())
			//this.rotated_vector.rotate(radian(this.getRotation()))
			
			//MessageLog.trace("Rotated VECTOR *****   ROT "+new_angle)
			//MessageLog.trace("Rotated VECTOR *****   REST "+rest_angle)
			//MessageLog.trace("Rotated VECTOR *****   absolute rotation "+rotation)
			//MessageLog.trace("Rotated VECTOR *****   RADIAN "+radianRotation )
			//MessageLog.trace("Rotated VECTOR *****  _ ANGLE : "+this.rotated_vector.degreeAngle())
			//MessageLog.trace("Rotated VECTOR _ LENGTH : "+this.rotated_vector.length())
			
			return this.rotated_vector; 
				
			
		}		

		this.calculate_Length = function(){

			if(isRoot==false){


			/*MessageLog.trace("RX "+ this.rootpoint.x);
			MessageLog.trace("RY "+ this.rootpoint.y);
			MessageLog.trace("Ex "+ this.endpoint.x);
			MessageLog.trace("EY "+ this.endpoint.y);*/

			var Dx = this.endpoint.x -this.rootpoint.x;
			var Dy = this.endpoint.y-this.rootpoint.y;
			
			var L = Hypothenus(Dy,Dx); 
			
			this.length = L;

			//MessageLog.trace("length of "+this.rootpeg+" : "+this.length );
			
			return L;

			}

		}

		this.getRotation= function(){

			var angle = parseFloat(node.getTextAttr(this.rootpeg,cf,"rotation.anglez"));

			//MessageLog.trace("------->>>>>-"+this.rootpeg+" GET_Rotation :"+angle)

			return (angle) 


		}


		this.setRotation= function(angle){

			var cleanAngle = parseFloat(angle);
			node.setTextAttr(this.rootpeg,"rotation.anglez", cf,cleanAngle);
			//MessageLog.trace("--------<<<<"+this.rootpeg+" SET_Rotation result :"+angle)
			
			
			
			

		}

		this.setPosition = function(x,y){

			//MessageLog.trace(this.rootpeg+"----setPosition x: "+x+" y: "+y)

			node.setTextAttr(this.rootpeg,"position.x", cf,x);
			node.setTextAttr(this.rootpeg,"position.y", cf,y);


			add_Key_to_attribute(this.rootpeg,"position.x",x,cf);
			add_Key_to_attribute(this.rootpeg,"position.y",y,cf);

		}
		

		this.getPosition = function(){

			var result = {x:0,y:0}
			
			result.x = parseFloat(node.getTextAttr(this.rootpeg,cf,"position.x"));
			result.y = parseFloat(node.getTextAttr(this.rootpeg,cf,"position.y"));
			
			
			//MessageLog.trace("----getPosition: "+result )
			return result;

		}
		
		
		this.getDistanceX = function(){
			
			//MessageLog.trace("distanceX");
			var result  = 0
			if(isRoot==false){
				
				result  = (this.endpoint.x -this.rootpoint.x);
				
				
			
			}
			
			//MessageLog.trace("distanceX "+result )
			
			return result; 
		}

		this.getDistanceY = function(){
				
			//MessageLog.trace("distanceX");
			var result  = 0
			if(isRoot==false){
				
				result  = (this.endpoint.y -this.rootpoint.y);
				
			}
			
			//MessageLog.trace("distanceY "+result )
			
			return result; 
		}
		
		this.getNewDistanceX = function(){
		
				//MessageLog.trace("distanceY");
			if(isRoot==false){
				
				var end_x = this.length*Math.sin(radian(this.getRotation()+this.getOrientation()))
				var x = this.length*Math.sin(this.getRotation()+this.getOrientation())
				
				return (this.endpoint.y -this.rootpoint.y);
			
			
			}else{
				return 0
				
			}		
			
		}
		
		
		this.getLength = function(){

			//MessageLog.trace("length of "+this.rootpeg+" :"+this.length)
			return this.rest_vector.length();

		}
		
		this.setLength = function(L){
		
			this.length = L;
			
		}
		this.calculate_Orientation = function(){

			/*var Dx = - this.endpoint.x-this.rootpoint.x;
			var Dy = this.endpoint.y-this.rootpoint.y;
			var orientation= Math.atan2(Dy,Dx)*180 / Math.PI;*/
			
			var orientation= this.rest_vector.degreeAngle()
			
			this.orientation = orientation

			//MessageLog.trace("ORIENTATION :"+orientation)

			return orientation

		}
		
		this.getCurrentVector = function(){
			
			var result = {x:this.rest_vector.x,y:this.rest_vector.y}
			/*var result = {x:0,y:0}
			
			var absolute_angle = this.getRotation()+this.getOrientation()
			
			result.x = this.length * Math.sin(radian(absolute_angle))
			result.y = this.length * Math.cos(radian(absolute_angle))
			
			MessageLog.trace("CurrentVector X :"+result.x+" Y : "+result.y)
			
			return result*/
				
		}

		this.getOrientation = function(){
			
			


		//MessageLog.trace("length of the bones :"+this.length)
		//MessageLog.trace("orientation :"+this.orientation)
			
			return this.orientation;

		}

		//MessageLog.trace("\n ******* NEW Bone created ");
		//MessageLog.trace("\n ******* root : "+this.rootpeg); 
		//MessageLog.trace("\n ******* end  : "+this.endpeg);

	}


	/************************************HERARCHY CLASS ******************************************************/
	

	
	/******************************************************************************************/

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

	
