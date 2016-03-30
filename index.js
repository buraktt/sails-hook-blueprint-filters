var _ = require('lodash');
var pluralize = require('pluralize');

const blueprintFilters = function(request, response) {
	var model = request.options.model || request.options.controller;
	if (!model) throw new Error(util.format('No "model" specified in route options.'));

	var Model = request._sails.models[model];
	if ( !Model ) throw new Error(util.format('Invalid route option, "model".\nI don\'t know about any models named: `%s`',model));

	var filters = [];
	_.forEach(Model.attributes, function(attribute, attributeName) {

		var modelFilter = Model.filters[attributeName];

		if(!attribute.protected && modelFilter){

			var filter ={
				name: attributeName,
				text: modelFilter
			}

			if(attribute.type){
				filter.type = attribute.type;
			}

			if(attribute.minLength){
				filter.minLength = attribute.minLength;
			}

			if(attribute.maxLength){
				filter.maxLength = attribute.maxLength;
			}

			if(attribute.enum){
				filter.enum = attribute.enum;
			}

			filters.push(filter);
		}

	});
	return response.ok({filters: filters})

};

module.exports = function (sails) {
  return {
      initialize: function(callback) {

      	console.log('kelle');
        var config = sails.config.blueprints;
        var blueprintFiltersFunction = _.get(sails.middleware, 'blueprints.filters') || blueprintFilters;

        sails.on('router:before', function() {
			_.forEach(sails.models, function(model) {
				var controller = sails.middleware.controllers[model.identity];

				if (!controller) return;

				var baseRoute = [config.prefix, model.identity].join('/');

				if (config.pluralize && _.get(controller, '_config.pluralize', true)) {
				 	baseRoute = pluralize(baseRoute);
				}

				var route = baseRoute + '/filters';

				sails.router.bind(route, blueprintFiltersFunction, null, {controller: model.identity});

			});
        });

        callback();
      }
  }
};

