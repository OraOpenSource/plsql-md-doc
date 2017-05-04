var scripts = document.getElementsByTagName("script"),
	__filename = scripts[scripts.length-1].src,
	__dirname = __filename.substring(0, __filename.lastIndexOf('/')),
	searchData = null;

var search = {};

/**
 * Checks whether the search engine has been initialised
 *
 * @returns {boolean}		True when initialised, else false
 */
search.isInitialised = function() {
	return window.searchData != null;
}

/**
 * Makes a JQuery UI autocomplete field of the search field.
 * When executing a search query the source function will be executed and starts the search
 */
search.setSearchFieldData = function() {
	$(function() {
		$( "#search-input-field" ).autocomplete({

			/**
			 * Called when a value inside the field changes
			 *
			 * @param request		The request being made (search terms)
			 * @param response	The response function which wants a Array and will set the data inside the dropdown field
			 */
			source: function(request, response) {
				response(search.startSearch(request.term));
			},

			// minimum amount of characters
			minLength: 2,

			/**
			 * Called when a item has been selected inside the field
			 * @param event		The event being fired
			 * @param record	The selected element
			 */
			select: function(event, record) {
				// Get the location
				var loc = /^(.*[\/])/.exec(window.location)[0] + record.item.id;

				// Check the type, if not a object (Package, view, etc) append the name of the found object, to scroll to the function/method
				if(record.item.type != "object") {
					loc += "#" + record.item.value.toUpperCase();
				}

				// Redirect to the location
				window.location = loc;
			}
		});
	});
}

/**
 * Initialises the Search engine (fills the searchData variable)
 */
search.initialise = function() {
	$.ajax({
		"async": true,
		"global": false,
		"url": __dirname + "/data.json?" + Date.now,
		"dataType": "json",
		"success": function (data) {
			window.searchData = data;
		}
	});

	// Set the data of the search field
	search.setSearchFieldData();
}

/**
 * Checks if the name of the foundProperties has not already been added to the Array, if so return true, else false
 *
 * @param array				The Array which will be searched
 * @param parent			The parent which will be used to check if already added
 *
 * @returns {boolean}	True when the same parent has been found, else false
 */
search.containsFoundProperties = function(array, parent) {
	// Iterate over the array
	for(var i=0;i<array.length;i++) {
		var value = array[i];

		// Check if the parent is the same (same Package, etc.) and the name of the property is the same as the found property
		if(value.foundProperties && value.name == parent.name && value.foundProperties.name == parent.foundProperties.name) {
			return true;
		}
	}

	// Not found
	return false;
}

/**
 * Matches a variable and checks if it matches the searchQuery, if so append the parent to the foundObjects
 * 	- If the value is a Object or Array recursively call the findNode function, which will search deeper inside the object/array
 *
 * @param value					The value to match the searchQuery
 * @param obj						The object where the value is inside
 * @param foundObjects	Array of the Objects which matches the searchQuery
 * @param parent				The parent object (packages, single functions/methods, Object types, Collections, Views, etc.)
 * @param searchQuery		The search query string which will be used for searching for values
 */
search.matchVariable = function(value, obj, foundObjects, parent, searchQuery) {
	var typeVar = typeof value;

	// Value is a string or number, check if the value matches the searchQuery
	if(['string', 'number'].indexOf(typeVar) > -1) {
		// Create the regex
		var re = new RegExp(searchQuery, "i");

		// Matches the searchQuery
		if(String(value).match(re)) {
			// Copy over the object by value
			var par = jQuery.extend(true, {}, parent);
			par.foundProperties = obj;

			// Check if the parent has not already been added
			if(!search.containsFoundProperties(foundObjects, par)) {
				foundObjects.push(par);
			}
		}
	}
	// We have found a object or array, again search that object/array
	else if(search.isObject(value) || Array.isArray(value)) {
		search.findNode(foundObjects, parent, value, searchQuery);
	}
}

/**
 * Checks if the value is a Object
 * @param value		The value to check
 * @returns {boolean}	true when the value is a Object, else false
 */
search.isObject = function(value) {
	return Object.prototype.toString.call(value) === "[object Object]";
}

/**
 * Finds a Object node which matches the searchQuery
 *
 * @param foundObjects		Array of the Objects which matches the searchQuery
 * @param parent					The parent object (packages, single functions/methods, Object types, Collections, Views, etc.)
 * @param searchObject		The object which will be searched
 * @param searchQuery			The search query string which will be used for searching for values
 *
 * @returns {Array}				Array of the objects matched the searchQuery
 */
search.findNode = function(foundObjects, parent, searchObject, searchQuery) {

	// Get the parent object, must be of type "Object", so packages, single functions/methods, Object types, Collections, Views, etc.
	var realParent = searchObject.type == "object" ? searchObject : parent;

	// Check if the variable is an Array, if so -> iterate and match the values
	if(Array.isArray(searchObject)) {
		for(var i=0;i<searchObject.length;i++) {
			search.matchVariable(searchObject[i], searchObject, foundObjects, realParent, searchQuery);
		}
	}

	// Check if the variable is an object, if so -> iterate over object and match the values
	else if(search.isObject(searchObject)) {
		for (var key in searchObject) {
			if (searchObject.hasOwnProperty(key)) {
				search.matchVariable(searchObject[key], searchObject, foundObjects, realParent, searchQuery);
			}
		}
	}

	// No more options, so we are done, return the result
	return foundObjects;
}

/**
 * The function which starts a search
 *
 * @param searchQuery		The search query string
 *
 * @returns {Array}			Array of nodes which has been found
 */
search.startSearch = function(searchQuery) {
	// Not initialised yet, return
	if(!search.isInitialised()) {
		return;
	}

	var foundNodes = [],
		data = [jQuery.extend(true, {}, window.searchData.data)],
		chunkSize = 500;

	for (var i=0;i<data.length; i+=chunkSize) {
		var chunkNodes = search.findNode([], null, data.slice(i, i+chunkSize), searchQuery);

		// Concat the nodes found in the chunk with the found nodes
		if(chunkNodes) {
			foundNodes = foundNodes.concat(chunkNodes);
		}
	}

	// Append the nodes to the inputField
	var options = [];

	for (var i=0;i<foundNodes.length;i++){
		var node = foundNodes[i];

		// Add the foundNode to the options
		options.push({
			id: node.filePath,
			label: node.name + " (" + node.foundProperties.name + ")",
			value: node.foundProperties.name,
			type: node.foundProperties.type
		});
	}

	// Set the dat of the search field
	return options;
}

// Run the search
search.initialise();