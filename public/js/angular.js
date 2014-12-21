var app = angular.module("Comments", [] );

app.controller("addComment", function($scope, $http, $location){
	$scope.fahrt = {};

	$scope.addComment = function(){
		$http.post("http://localhost:3000/comments/add", $scope,fahrt)
			.success(function(response){
				$location.url("/")
			});
	}
});


app.controller("commentsController", function($scope, $http){
	console.log("I am in controller ")
	$http.get("/comments").success(function(response){
		$scope.comments = response;
	}).error(function(err){
		$scope.error = err;
	});
})

app.controller("threadController", function($scope, $http, $routeParams){
	console.log("Im in threadController")
	$scope.comments = {};
	var id = $routeParams.datasetId;

	$http.get("/api/v1/search").success(function(response){
		$scope.comments = response;
	});

/*
	$scope.saveFahrt = function(){
		$http.put("http://localhost:3000/fahrten/" + $scope.fahrt._id, $scope.fahrt)
		.success(function(response){
			$location.url("/fahrten")
		});
	};
	*/
});