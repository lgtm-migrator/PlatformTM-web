/**
 * Created by iemam on 06/10/2015.
 */



    'use strict';

    function stepFourController($scope,$state,$stateParams,wizardService){

        var vm = {}
        //$scope.vm = vm;

        $scope.vm = {
            datasetId: $stateParams.datasetId,
            activityId:$stateParams.activityId,
            selectedFiles: $stateParams.selFiles,
            selectedDataset:null,
            selectedActivity:null

        };
        /*console.log('stepOne controllern scope',$scope)

        console.log('inside stepOne controller',$stateParams.selFiles)*/
        //$scope.vm.selectedFiles = $stateParams.selFiles;
        //var projectId = $stateParams.projectId
        /*var projectId = "STD-BVS-01";

        wizardService.getActivities(projectId).then(function(activities){
                $scope.activities = activities;
        })*/

        //$scope.activities = [{'name':'ibrahim'},{'name':'assem'},{'name':'emam'},{'name':'nelly'}]


    }

    angular.module('bioSpeak.import')
        .controller('stepFourController',['$scope','$state','$stateParams','wizardService',stepFourController]);
