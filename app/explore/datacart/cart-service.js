/**
 * Created by iemam on 08/12/2016.
 */

'use strict'
function cartService($http,$rootScope,ngAppConfig) {
    var cartServiceFactory = {};

    var serviceBase = ngAppConfig.apiServiceBaseUri;

    var currentCart = {}
    //currentCart.scs = [];
    //currentCart.observations = [];
    //currentCart.assays=[];

    var _toggle = true;



    var _getCartQuery = function(projectId,cartId){
        return $http({
            url:serviceBase+'apps/explore/projects/'+projectId+'/queries/'+cartId,
            method:'GET'
        })
            .then(
                function (response) {
                    currentCart = response.data;
                    return {
                        cart: (response.data),

                    }
                },
                function (httpError) {
                    // translate the error
                    throw httpError.status + " : " +
                    httpError.data;
                });
    }

    var _getNewCartQuery = function(projectId){
        var cartId = "new";
        return $http({
            url:serviceBase+'apps/explore/projects/'+projectId+'/queries/'+cartId,
            method:'GET'
        })
            .then(
                function (response) {
                    currentCart = response.data;
                    return {
                        cart: (response.data),

                    }
                },
                function (httpError) {
                    // translate the error
                    throw httpError.status + " : " +
                    httpError.data;
                });
    }

    var _addToCart = function(item, module){
        console.log('Adding ',item, module)
        if(item.isSubjectCharacteristics || item.isDesignElement)
            currentCart.subjCharRequests.push(item);
        if(item.isClinicalObservations)
            currentCart.obsRequests.push(item);
        if(item.isSampleCharacteristic){
            console.log('Adding ',item, currentCart)
            currentCart.assayPanelRequests[module].isRequested = true;
            currentCart.assayPanelRequests[module].sampleQuery.push(item);

            console.log('Adding ',item, currentCart.assayPanelRequests[module])
        }


        _toggle = !_toggle;
    };

    var _addAssayPanel = function(panel){
        //console.log('Adding Panel', panel.assayId);
        currentCart.assayPanelRequests[panel.assayId].isRequested = true;
        //console.log(currentCart);

        _toggle = !_toggle;
    }

    var _removeFromCart = function(item, module){
        var items = []
        if(item.isSubjectCharacteristics)
            items = currentCart.subjCharRequests

        if(item.isClinicalObservations)
            items = currentCart.obsRequests;
        if(item.isSampleCharacteristic)
            items = currentCart.assayPanelRequests[module];

        var pos;
        for(var i=0; i< items.length;i++) {
            //console.log(items.id, obs.id)
            if(item.id == items[i].id){
                pos = i;
                break;
            }
        }
        console.log('removing ', item, 'from data cart')
        items.splice(pos,1);
    }


    var _refreshed = function(){
        return _toggle
    }

    var _getCurrentSCS = function(){
        return currentCart.subjCharRequests;
    }
    var _getCurrentObservations = function(){
        return currentCart.obsRequests;
    };
    var _getCurrentAssayPanels = function(){

        return currentCart.assayPanelRequests;
    };


    var _subjectsAreFiltered = function(){

    }

    var _getUserSavedQueries = function(projectId){
        return null;
    }

    
    var _saveQuery = function(query,projectId){

        //console.log(query)
        // var combinedQuery = {}
        // combinedQuery.obsRequests = query.cobs.concat(query.scs);
        // combinedQuery.name = query.name;
        // combinedQuery.projectId = projectId;
        // combinedQuery.assayPanelRequests = query.assaypanels;
        //console.log(combinedQuery)

        return $http({
            url:serviceBase+'apps/explore/projects/'+projectId+'/saveQuery',
            method:'POST',
            data: angular.toJson(currentCart)
        })
            .then(
                function (response) {
                    return {
                        cartId: (response.data.id),

                    }
                },
                function (httpError) {
                    // translate the error
                    throw httpError.status + " : " +
                    httpError.data;
                });
    }

    var _clearCart = function () {
        currentCart.scs = []
        currentCart.observations = []
        currentCart.assays = []
    };

    var _applyFilter = function(id,filters,isRange,module){
        console.log(id,filters,isRange,module);
        var found = false;

        var filteredObs;
        if(module){
            for(var i=0; i< currentCart.assayPanelRequests[module].sampleQuery.length;i++) {
                if (id == currentCart.assayPanelRequests[module].sampleQuery[i].name) {
                    filteredObs = currentCart.assayPanelRequests[module].sampleQuery[i];
                    found = true;
                    break;
                }
            }
        }

        if(!found){
            for(var i=0; i< currentCart.obsRequests.length;i++) {
                if (id == currentCart.obsRequests[i].name) {
                    filteredObs = currentCart.obsRequests[i];
                    found = true
                    break;
                }
            }
        }


        if(!found){
            for(i=0; i< currentCart.subjCharRequests.length;i++) {
                if(id == currentCart.subjCharRequests[i].name){
                    filteredObs = currentCart.subjCharRequests[i];
                    found = true
                    break;
                }
            }
        }

        if(!found) return;

        //REMOVE FILTER
        if(filters.length == 0){
            filteredObs.filterRangeFrom = 0;
            filteredObs.filterRangeTo = 0;
            filteredObs.filterExactValues = null;
            filteredObs.filterText = dc.printers.filters(filters)
            filteredObs.isFiltered = false;
            _toggle = !_toggle
            $rootScope.$apply();
            return;
        }

        if(isRange){
            filteredObs.filterRangeFrom = filters[0][0];
            filteredObs.filterRangeTo = filters[0][1];
        }
        else
            filteredObs.filterExactValues = filters;

        filteredObs.isFiltered = true;
        filteredObs.filterText = dc.printers.filters(filters)

        _toggle = !_toggle

        console.log(filteredObs)
        $rootScope.$apply();
    };

    var isFloat = function (n) {
        return n === +n && n !== (n | 0);
    };




    cartServiceFactory.addToCart = _addToCart;
    cartServiceFactory.removeFromCart = _removeFromCart;
    cartServiceFactory.addAssayPanelToCart = _addAssayPanel;
    cartServiceFactory.getCurrentSCS = _getCurrentSCS;
    cartServiceFactory.getCurrentObservations = _getCurrentObservations;
    cartServiceFactory.getCurrentAssayPanels = _getCurrentAssayPanels;
    cartServiceFactory.clearCurrentCart = _clearCart;
    cartServiceFactory.clickclack = _refreshed;
    cartServiceFactory.applyFilter = _applyFilter;
    cartServiceFactory.getUserSavedQueries = _getUserSavedQueries;
    cartServiceFactory.saveQuery = _saveQuery;
    cartServiceFactory.getCartQuery = _getCartQuery;
    cartServiceFactory.getNewCartQuery = _getNewCartQuery;
    return cartServiceFactory;
}

angular.module('biospeak.explorer')
    .factory('cartService',['$http','$rootScope','ngAppConfig', cartService])
