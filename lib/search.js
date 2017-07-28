// This is the custom package for PLSQL to MD
var
	debug,
	extend,
	path = require('path'),
	dox = require('./dox.js'),
	fsExtra = require("fs-extra"),  // Used for copying over the files
	scriptBaseDir = "script/search" // The directory of the search folder (will be used when copying over to all the folders
	;

var search = {};

/**
 * Handles consistent error handling
 * Process will exit calling this functions
 *
 * @param msg Message to log
 * @param includeError optional - Prefix the logged message with "Error: "
 */
search.raiseError = function(msg, includeError){
	includeError = includeError == null ? true : includeError;
	console.error((includeError ? 'Error: ' : '') + msg);
	process.exit();
}//raiseError

/**
 * Returns the arguments JSON objects
 * Handles validation that all arguments are passed in
 *
 * @param process process object from calling function
 * @return arguments JSON object
 */
search.getArguments = function(process){
	var
		args = process.argv.slice(2), // Array of arguments
		arguments = {
			project :  args[0]
		}
		;

	// Validation and Data Load
	if (args.length === 0){
		search.raiseError('To run call: node app <project>', false);
	}
	// Check that config file exists
	if (!fs.existsSync(path.resolve(__dirname + '/../','config.json'))){
		search.raiseError('config.json must be present. TODO run generateConfig.js to generate default');
	}

	return arguments;
}//getArguments

/**
 * Copies over the script directory to all the output folders
 *
 * @param config		The config as defined inside the config.json
 * @param objs			The objects Array which has been made by the documentation framework
 */
search.copyScripts = function(config, objs) {
	var pathsDone = [];

	// Iterate over the folders and copy over the resources directory
	config.folders.forEach(function(folder) {

		// Check if not already copied over
		if(pathsDone.indexOf(folder.output.path) == -1) {

			// Copy over the resources folder
			fsExtra.copySync(__dirname + '/../' + scriptBaseDir, folder.output.path + "/" + scriptBaseDir, {
				overwrite: true
			});

			// Mark the output folder as done
			pathsDone.push(folder.output.path);
		}
	}); // config.folders.forEach
}//copyScripts


/**
 * Parses the PLSQL defined types so only the name is being used
 *
 * @param types			The types Array which contains all the PLSQL types inside the object
 *
 * @returns {Array}	The Array containing only the names of the types and if the type is private
 */
search.parseTypes = function(types) {
	if(!types) {
		return;
	}

	var parsedTypes = [];

	types.forEach(function(type) {
		parsedTypes.push({
			name: type.name,
			type: "plsql-type",
			isPrivate: type.isPrivate
		})
	});

	return parsedTypes;
}//parseMethods

/**
 * Parses the methods so only the name is being used
 *
 * @param methods		The methods Array which contains all the methods inside the object
 *
 * @returns {Array}	The Array containing only the names of the methods and if the method is private
 */
search.parseMethods = function(methods) {
	if(!methods) {
		return;
	}

	var parsedMethods = [];

	methods.forEach(function(method) {
		parsedMethods.push({
			name: method.name,
			type: method.type,
			isPrivate: method.isPrivate
		})
	});

	return parsedMethods;
}//parseMethods

/**
 * Parses the normal variables so only the name is being used
 *
 * @param variables	The normal variables Array which contains all the normal variables inside the object
 *
 * @returns {Array}	The Array containing only the names of the normal variables and if the variable is private
 */
search.parseVariables = function(variables) {
	if(!variables) {
		return;
	}

	var parsedVariables= [];

	variables.forEach(function(variable) {
		parsedVariables.push({
			name: variable.name,
			type: "variable",
			isPrivate: variable.isPrivate
		})
	});

	return parsedVariables;
}//parseVariables

/**
 * Parses the exception variables so only the name is being used
 *
 * @param exceptions	The exception Array which contains all the exception inside the object
 *
 * @returns {Array}		The Array containing only the names of the exception and if the exception is private
 */
search.parseExceptions = function(exceptions) {
	if(!exceptions) {
		return;
	}

	var parsedExceptions= [];

	exceptions.forEach(function(exception) {
		parsedExceptions.push({
			name: exception.name,
			type: "exception",
			isPrivate: exception.isPrivate
		})
	});

	return parsedExceptions;
}//parseExceptions

/**
 * Parses the constant variables so only the name is being used
 *
 * @param constants		The constant variables Array which contains all the constant variables inside the object
 *
 * @returns {Array}		The Array containing only the names of the constants and if the contant is private
 */
search.parseConstants = function(constants) {
	if(!constants) {
		return;
	}

	var parsedConstants= [];

	constants.forEach(function(constant) {
		parsedConstants.push({
			name: constant.name,
			type: "constant",
			isPrivate: constant.isPrivate
		})
	});

	return parsedConstants;
}//parseConstants

/**
 * Parses the data retrieved by the Documentation framework into a smaller JSON, so searching becomes faster and the JSON file is not to large
 *
 * @param objs			The objects Array which has been made by the documentation framework
 *
 * @returns {Array}	The new data used by the search engine. Will contain all the simplified objects
 */
search.parseData = function(objs) {
	var data = [];

	objs.files.forEach(function(file) {
		if(file && file.fileData && !file.fileData.isFolder) {
			var searchFile = {
				name: file.name,
				filePath: file.docFileName,
				type: "object",
				properties: {
					constants: search.parseConstants(file.fileData.constants),
					exceptions: search.parseExceptions(file.fileData.exceptions),
					methods: search.parseMethods(file.fileData.methods),
					types: search.parseTypes(file.fileData.types),
					variables: search.parseVariables(file.fileData.variables)
				}
			};

			data.push(searchFile);
		}
	});//objs.files.forEach

	return data;
}//parseData

/**
 * Creates the datafile containing the JSON which is used when searching clientside
 *
 * @param config		The config as defined inside the config.json
 * @param objs			The objects Array which has been made by the documentation framework
 */
search.createDataFile = function(config, objs) {
	var pathsDone = [];

	// Iterate over the folders and copy over the resources directory
	config.folders.forEach(function(folder){

		// Check if not already written to that folder directory
		if(pathsDone.indexOf(folder.output.path) == -1) {
			debug.log('\nCreating the data file into: ' + folder.output.path);

			// Create the file
			fsExtra.writeJsonSync(path.resolve(folder.output.path + "/" + scriptBaseDir + '/data.json'), {
				data: search.parseData(objs)
			});

			// Mark the output folder as done
			pathsDone.push(folder.output.path);
		}
	}); // config.folders.forEach
} //createDataFile

/**
 * Runs the search engine
 *
 * @param config		The config as defined inside the config.json
 * @param objs			The objects Array which has been made by the documentation framework
 */
search.run = function(config, objs) {
	debug.log('\nStarting the search engine');

	// Copy the search script
	search.copyScripts(config, objs);

	// Create the data used inside the search script
	search.createDataFile(config, objs);

}//run

module.exports = function(pDebug, pExtend){
	debug = pDebug;
	extend = pExtend;
	return search;
}