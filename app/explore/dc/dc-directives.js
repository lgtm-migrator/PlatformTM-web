/**
 * Created by iemam on 17/10/2014.
 */
angular.module('eTRIKSdata.dcPlots')


    .directive('chartingButton', function($compile){
        return {
            scope: { // attributes bound to the scope of the directive
                val: '@',
                obsid: '@',
                obsids:'=',
                domain:'@',
                grp: '@',
                isActive: '@active',
                isGroupBtn: '@',
                container: '@',
                section: '@',
                chartService: '@',
                xfilterService: '@',
                projectId:'@'
            },

            /*controller: function($scope, $compile, $http) {
                // $scope is the appropriate scope for the directive
                this.addChild = function(nestedDirective) { // this refers to the controller
                    console.log('Got the message from nested directive:' + nestedDirective.message);
                }
            },*/
            link:
            function(scope, element, attrs){
                element.bind("click", function(){
                    var elemId = attrs.id+'-chart';
                    var isActive = scope.isActive === 'true'
                    console.log(isActive)
                    if(isActive){
                        scope.$apply(function(){
                            angular.element(document.getElementById(scope.container))
                                .append(
                                    $compile('<div  id="'+elemId+'">' +
                                        '<dc-chart></dc-chart>'+
                                        '</div>')(scope)
                                )
                        })
                    }
                    else{
                        angular.element(document.getElementById(elemId)).remove();
                    }
                });
            }
        }
    })

    .directive('dcCountWidget',function(){
        return{
            restrict:'E',
            scope:{
                grp: '@',
                chartService: '@',
                xfilterService: '@',
                projectId:'@'
            },
            controller: ['$scope','$attrs','$injector',function($scope,$attrs,$injector) {

                var chartService = $injector.get($scope.chartService);
                $scope.chartservice = chartService

                var xfilterService = $injector.get($scope.xfilterService);
                $scope.xfService = xfilterService
            }],
            template:
                '<span id="{{grp}}_Counter" class="filter-count model-count number-display"></span>',
                /*'<span class="filter-count"></span> selected out of <span class="total-count"></span> subjects | ' +
                '<a href="javascript:dc.filterAll();dc.renderAll();">Reset filters</a>',*/
            link: function(scope, element, attrs){
                scope.$watch(
                    function($scope) { return $scope.xfService.cfReady(); },
                    function(newval, oldval){
                        if(newval){

                            //TODO: need to add dc-count-widget to the list of charts in CF to be refreshed when Xfilter is refreshed
                            //cf.createChart('subjects',$scope.obsid,$scope.grp)
                            var chart = scope.chartservice.createDCcounter(scope.xfService)
                            //console.log('inside dc-count-widget chartgroup',scope.chartgroup)
                            chart.anchor(element[0],scope.grp);
                            chart.render();
                        }
                })
            }
        }
    })

    .directive('dcChart', function () {
        return {
            restrict: 'E',
            replace:true,
            /*scope: {
                val: '='
            },*/
            controller: ['$scope','$attrs','$injector',function($scope,$attrs,$injector) {

                //console.log($scope.chartService)
                console.log('dcChart scope ',$scope)

                var chartService = $injector.get($scope.chartService);
                $scope.chartservice = chartService

                var xfilterService = $injector.get($scope.xfilterService);
                $scope.xfService = xfilterService
                //$scope.propagateFilter()

                //console.log('inside dc-chart controller')
                //console.log('projectId ',$scope.projectId,'val ',$scope.val,'obsid ',$scope.obsid,'chart grp',$scope.grp)

                chartService.getDCchart($scope.projectId,$scope.val,$scope.obsid,$scope.grp,xfilterService)
                    .then(
                    function(chart){
                        $scope.chartToPlot = chart;
                        $scope.chartToPlot.on('filtered', function(chart, filter){

                            console.log('Filter Event', filter)
                            console.log('Chart', chart.dimName)
                            console.log('filters',chart.filters())

                            // A possible solution
                            //TODO: pass dimName and filters to the scope of the parent controller
                            //TODO: could be one of three : subjects-controller or clinical-controller or assay-controller
                            //TODO: the best way to do this is to create a new service 'exportService' and then
                            //TODO: dc-directives and subject-controller/clinical-controller/assay-controller can share and watch.
                            //TODO: in this method the filters/dimension name are ADDED/REMOVED to the service WHILE in the controller
                            //GOOGLE angularjs controller watching service

                            //console.log(scope.chartCFservice.getCountGroup())
                            //scope.chartCFservice.filterClinicalCF(filter,scope.val)
                            $scope.chartservice.propagateFilter($scope.xfilterService);


                            //dc.renderAll("Clinical");
                        })
                    },
                    function(result){
                        console.log("Failed to create DC chart",result);
                    }
                );

            }],
            template:'<div style="padding-top: 20px;/*float: left;max-height: 200px; overflow: scroll*/">'+
                '<div class="chart-title" id="returnsLabel">'+
                '<span>{{val}}</span>'+
                '<span class="filter"></span> <a class="reset">reset</a> '+
                '</div>'+
                '<div class="clearfix"></div>'+
                //'<div><img src="img/icons/spinner.gif"></div>'+
                '</div>'
            ,
            link: function (scope, element, attrs) {

                //console.log(scope.val)



                scope.$watch('chartToPlot', function(newVal) {
                    if (newVal) {
                        console.log(newVal)
                        scope.chartToPlot.anchor(element[0],scope.grp);

                        //if(scope.val == 'arm' || scope.val == 'site'){
                            /*scope.chartToPlot.on('filtered',scope.chartCFservice.filterClinicalCF(filter,scope.val))*/

                        //}


                        //console.log('chartId',scope.chartToPlot.chartID())
                        //console.log('chart group inside directive',scope.chartToPlot.chartGroup())
                        //console.log('subject cf size',scope.chartCFservice.getCountData().size())
                        //console.log('subject group',scope.chartCFservice.subjDimension().group())
                        //console.log('subject groupAll',scope.chartCFservice.subjDimension().group().all())
                        //console.log('subject dimension groupAll value',scope.chartCFservice.subjDimension().groupAll().value())
                        var groupChart = scope.chartToPlot.chartGroup()
                          //console.log('Group chart ', groupChart)

                          //Set reset link
                            var a = angular.element(element[0].querySelector('a.reset'));
                            a.attr('href', 'javascript:;');
                            a.css('display', 'none');
                            a.on('click', function () {
                                scope.chartToPlot.filterAll(groupChart);
                                dc.redrawAll(groupChart);
                            });
                        scope.chartToPlot.render()

                        //dc.renderAll(groupChart);
                        //dc.redrawAll();
                    }
                })
            }
        };
    })

    .directive('dcDatatable', function () {
    return {
        restrict: 'E',
        replace:true,
        scope: { // attributes bound to the scope of the directive
            grp: '@',
            chartService: '@',
            xfilterService: '@',
            projectId:'@'
        },
        controller: ['$scope','$attrs','$injector',function($scope,$attrs,$injector) {

            //console.log($scope.chartService)
            console.log($scope)

            var chartService = $injector.get($scope.chartService);
            $scope.chartservice = chartService
            //
            var xfilterService = $injector.get($scope.xfilterService);
            $scope.xfService = xfilterService
        }],
        template:
                     '<table class="table table-hover" id="dc-table-graph">'+
                     '</table>',
        link: function (scope, element, attrs) {
            scope.$watch(
                function($scope) { return $scope.xfService.cfReady(); },
                function(newval, oldval){

                    if(newval){
                        console.log(newval)
                        var chart = scope.chartservice.createDCtable(scope.xfService)
                        chart.anchor(element[0],scope.grp);
                        //var chart = scope.cf.createDCtable()
                        //console.log(chart.columns());
                        //chart.anchor(element[0],'clinical');
                        chart.render()
                    }
                })
        }

    }
})

    .directive('dcNumberDisplay',function(){
        return{
            restrict: 'E',
            replace:true,
            //controller: ['$scope','$attrs','$injector',function($scope,$attrs,$injector) {
            //
            //    var chartService = $injector.get($scope.chartService);
            //
            //    chartService.getDCchart($scope.val,$scope.obsid)
            //        .then(
            //        function(chart){
            //            $scope.chartToPlot = chart;
            //        },
            //        function(result){
            //            console.log("Failed to create DC chart",result);
            //        }
            //    );
            //
            //
            //}],
            template:'<span id="subjClinicalCount" class="filter-count model-count number-display"></span>',
            link: function(scope, element, attrs){
            var cf = scope.cf
            var chartFactory = dc['numberDisplay'];
            // Create an unconfigured instance of the chart
            var chart = chartFactory(element[0]);
            var chartOptions = {};

            //scope.$watch('chartToPlot', function(newVal) {
            //    if (newVal) {
            //
            //    }
            //})
            scope.$watch(
                function($scope) { return $scope.cf.getSubjectGroup(); },
                function(newval, oldval){

                    if(newval){

                        var expCount = function(d) {
                            console.log(d)
                            //return d.size;
                        };

                        //console.log(newval)
                       // console.log(cf.getSubjcount());
                        //console.log( cf.getSubjectGroup().top(Infinity).length)

                        //var subjectCount = cf.getSubjectGroup().top(Infinity).length
                        chartOptions["valueAccessor"] = function(d){
                            //d = subjectCount
                            //console.log('inside valueAccessor', d)
                            return d
                        };
                        chartOptions["group"] =  cf.getSubjectGroup()

                        chart.options(chartOptions);
                        chart.render();
                        //dc.renderAll();
                    }

                })



        }

        }
    })

    .directive('dcChartVisit',function(){
        return {
            restrict: 'E',
            replace: true,
            template: '<div style="padding-top: 20px;/*float: left;max-height: 200px; overflow: scroll*/">' +
            '<div class="chart-title" id="returnsLabel">' +
            '<span>Visits</span>' +
            '<span class="filter"></span> <a class="reset">reset</a> ' +
            '</div>' +
            '<div class="clearfix"></div>' +
                //'<div><img src="img/icons/spinner.gif"></div>'+
            '</div>',

            controller: ['$scope','$attrs','$injector','ExportCriteria',function($scope,$attrs,$injector, exportCriteria) {

                //console.log('inside dc-chart controller')
                var chartService = $injector.get($scope.chartService);
                console.log('projectId ',$scope.projectId,$scope.val,$scope.obsid,$scope.grp)
                $scope.chartCFservice = chartService




                chartService.getVisitchart($scope.projectId,$scope.val,$scope.grp)
                    .then(
                    function(chart){
                        $scope.chartToPlot = chart;
                    },
                    function(result){
                        console.log("Failed to create DC chart",result);
                    }
                );

                //chartService.getChartData($scope.val,$scope.obsid,$scope.domain)
                //    .then(
                //        // success function
                //        function(data) {
                //            /*console.log("GOT BACK from getChartData...")
                //            console.log(data)*/
                //            $scope.chartData = data;
                //        },
                //        // error function
                //        function(result) {
                //            console.log("Failed to get chart data " + result);
                //        });

                //$scope.addFilterToExport = function(filter){
                //    //console.log($scope.grp,$scope.val,filter)
                //    exportCriteria.addFilter(filter,$scope.val,$scope.grp)
                //};


            }],
            link: function (scope, element, attrs) {

                //console.log(scope.val)

                scope.$watch('chartToPlot', function (newVal) {
                    if (newVal) {
                        //console.log(scope.chartToPlot)
                        scope.chartToPlot.anchor(element[0])

                        //console.log('chartId', scope.chartToPlot.chartID())
                        //console.log('chart group inside directive', scope.chartToPlot.chartGroup())
                        v//ar groupChart = scope.chartToPlot.chartGroup()
                        //console.log(dc.chartRegistry.list())

                        //Set reset link
                        var a = angular.element(element[0].querySelector('a.reset'));
                        a.attr('href', 'javascript:;');
                        a.css('display', 'none');
                        a.on('click', function () {
                            scope.chartToPlot.filterAll();
                            dc.redrawAll();
                        });
                        scope.chartToPlot.render()

                        //dc.renderAll(groupChart);
                        //dc.redrawAll();
                    }
                })
            }
        }
    });