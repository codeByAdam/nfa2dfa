/*
CS 461
Homework 1
NFA to DFA

Adam Ordway
9/6/2017

*/

var data = new Object;          // Holds all input file data
var dfa = new Object;			// Holds DFA data

dfa.states = [];
dfa.finalStates = [];

/*****************************
 *	Main Driver
 * **************************/
main = function(){
	console.log("reading NFA ... done.\n");
	console.log("creating corresponding DFA ...");	
	
	var init = [];
	init = init.concat(findE(data.initialState));
	init.sort(sortNumber);
	addState(init);

	storeDFA();
	console.log("done.");

	printDFA();

}

/*************************
 *	FindE - finds states from E
 ************************/
findE = function(state){
	var result = [];
	if(state){
		result.push(state);
		for(var i = 0; i < result.length; i++){ // Loop through array of states
			if(data.states[result[i]-1].E){ // if state has E values loop through them
				for(var j = 0; j < data.states[result[i]-1].E.length; j++){
					if(!result.includes(data.states[result[i]-1].E[j])){ // 
						result = result.concat(data.states[result[i]-1].E[j]);
					}
				}
			}
		}
		return result;
	}else{
		return null;
	}
}

setTranStates = function(state, type){
	var result = [];
	for(var i = 0; i < state.length; i++){
		if(data.states[state[i]-1][type]){
			result = result.concat(data.states[state[i]-1][type]);
		}
	}
	return result;
}

//creates the dfa
storeDFA = function(){
	for(var i = 0; true; i++){
		if(dfa.states[i] && !dfa.states[i].touch){
			if(dfa.states[i].s){
				for(var t = 0; t < data.transitionTypes.length-1; t++){
					var result = setTranStates(dfa.states[i].s, data.transitionTypes[t]);
					if(result.length > 0){
						var tmpResult = [];
						for(var b = 0; b < result.length; b++){
							tmpResult = tmpResult.concat(findE(result[b]));
						}

						tmpResult = tmpResult.filter(function(i, p){
							return tmpResult.indexOf(i) == p;
						});

						//Check to make sure there are not dups
						tmpResult.sort(sortNumber);
						var is_inList = false;
						for(var o = 0; o < dfa.states.length; o++){		//search for dups dfa.states
							if(tmpResult.equals(dfa.states[o].s)){
								is_inList = true;
								break;
							}
						}
						//If not a dup
						if(!is_inList){
							addState(tmpResult);
						}
					}
				}

			}
			dfa.states[i].touch = true;
		}else{
			break;
		}
	}
}

//checks to see if an array's elements are in another array
arrayInArray = function(org, sub){
	
	if(sub.length == 0){
		return false;
	}
	
	var tmp = [];
	for(var i = 0; i < sub.length; i++){
		if(org.includes(sub[i])){
			tmp.push(sub[i]);
		}
	}

	if(tmp.length == sub.length && tmp.length == org.length){
		return true;
	}else{
		return false;
	}
}

//gets the proper state
move = function(states, type){

	var val = [];
	for(var i = 0; i < states.length; i++){
		if(data.states[states[i]-1][type]){
			val = val.concat(data.states[states[i]-1][type]);
		}
	}

	fval = [];
	for(var i = 0; i < val.length; i++){
			fval = fval.concat(findE(val[i]));
	}

	fval = fval.filter(function(i, p){
		return fval.indexOf(i) == p;
	});
	
	for(var i = 0; i < dfa.states.length; i++){
		if(arrayInArray(dfa.states[i].s, fval)){
			return i+1;
		}
	}

	return "";
}

//Prints the final dfa
printDFA = function(){
	
	console.log("\nfinal DFA:");
	console.log("Initial State:\t" + data.initialState);
	console.log("Final States:\t{" + dfa.finalStates + "}");
	console.log("Total States:\t" + dfa.states.length);
	process.stdout.write("State");
	
	for(var i = 0; i < data.transitionTypes.length-1; i++){
		process.stdout.write("\t" + data.transitionTypes[i]);
	}
		
	for(var i = 0; i < dfa.states.length; i++){
		process.stdout.write("\n" + (i+1));
		for(var j = 0; j < data.transitionTypes.length-1; j++){
			process.stdout.write("\t{" + move(dfa.states[i].s, data.transitionTypes[j]) + "}");
		}
	}

	process.stdout.write("\n");
}

// Adds states to the dfa and prints them
addState = function(s){
	var state = {
		s: s,
		touch: false
	};
	
	for(var i = 0 ; i < data.finalStates.length; i++){	
		if(s.includes(data.finalStates[i]) && !dfa.finalStates.includes(dfa.states.length+1)){
			dfa.finalStates.push(dfa.states.length+1);
		}
	}

	dfa.states.push(state);
	console.log("new DFA state:\t" + dfa.states.length + "\t-->\t{" + dfa.states[dfa.states.length - 1].s + "}");
}

//Seperates lists from input
parseList = function(string){
	if(string == '{}'){
		return null;
	}
	var a = string.slice(1, -1);
	var b = a.split(',').map(Number);
	return b;
};

sortNumber = function(a,b){
	return a - b;
}

// Compares arrays
Array.prototype.equals = function(a){
	if(!a){
		return false;
	}
	if(this.length != a.length){
		return false;
	}
	for(var i = 0, l = this.length; i < l; i++){
		if(this[i] instanceof Array && a[i] instanceof Array){
			if(!this[i].equals(a[i])){
				return false;
			}
		}else if(this[i] != a[i]){
			return false;
		}
	}
	return true;
}
Object.defineProperty(Array.prototype, "equals", {enumerable: false});


//Reads the input file and stores everything
setData = function(data){
	
    var readline = require('readline');
    var rl = readline.createInterface({
        input: process.stdin
    });

	var lineNo = 0;
	data.states = [];
    rl.on('line', function(line){
		
		switch(lineNo){
			case 0:		// set initial state
				var str = line.split(' ');
				data.initialState = parseInt(str[str.length - 1]);
				break;

			case 1:		// set final states
				var str = line.split(' ');
				var strNums = str[str.length-1];
				data.finalStates = parseList(strNums);
				break;

			case 2:		// set total states
				var str = line.split(' ');
				data.totalStates = parseInt(str[str.length - 1]);
				break;

			case 3:		// set transition types
				var str = line.split(' ');
				data.transitionTypes = [];
				for(var i = 1; i < str.length - 1; i++){
					if(str[i] != ''){
						data.transitionTypes.push(str[i]);
					}
				}
				break;

			default:	//set states
				if(!data.states){
					data.states = [];
				}
				var str = line.split(' ');
				transitions = [];
				for(var i = 1; i < str.length - 1; i++){
					if(str[i] != ''){
						transitions.push(str[i]);
					}
				}
				var tmp = {};
				for(var i = 0; i < transitions.length; i++){
					var list = parseList(transitions[i]);
					tmp[data.transitionTypes[i]] = list;
				}
				data.states.push(tmp);
		}
		lineNo++;
    }).on('close', function(){
		main();
	});
};
setData(data);
