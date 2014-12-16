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
		console.log("I am in get " + response.length)
	}).error(function(err){
		$scope.error = err;
	});

})