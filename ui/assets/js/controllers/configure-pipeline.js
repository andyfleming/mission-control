import _ from 'lodash'

export default ['$q', '$scope', '$http', '$stateParams', '$state', function($q, $scope, $http, $stateParams, $state) {

  // This must be predefined for ng-model
  // values as objects
  $scope.stageOptions = {
    metadata: {},
    current: {},
    saved: {}
  }

  // Load the pipeline and the related project
  $http.get('/api/pipelines/' + $stateParams.id).then(response => {
    $scope.pipeline = response.data.data

    $http.get('/api/projects/' + response.data.data.project_id).then(response => {
      $scope.project = response.data.data
    })

  })

  // Load the pipeline variables
  $http.get('/api/pipelines/' + $stateParams.id + '/variables').then(response => {
    $scope.variables = response.data.data
  })

  // Get Stage Data
  let stageTypes = $http.get('/api/stage-types')
  let stageConfigs = $http.get('/api/pipelines/' + $stateParams.id + '/stages')
  $q.all([stageTypes, stageConfigs])
    .then(args => {
      let types = args[0].data.data
      let stages = args[1].data.data

      // Join the types with their stages
      $scope.stages = stages.map(stage => {
        let type = types.find(type => type.fqid === stage.type)
        if (type) {
          stage.schema = type
        }
        return stage
      })

      // Copy the options for stages to two maps
      stages.forEach(function(stage) {

        console.log(stage)

        // Set up holder objects
        // - one for the "last saved" value
        // - one for the current (bound) form value
        // - one for metadata
        $scope.stageOptions.current[stage.id] = {}
        $scope.stageOptions.saved[stage.id] = {}
        $scope.stageOptions.metadata[stage.id] = {}

        // For each option that exits in the stage type...
        Object.keys(stage.schema.options).forEach((key) => {

          let optionValue

          // If the user has specified value, use that
          // Otherwise, if there is a default value, use it
          // Otherwise, make the value blank
          if (typeof stage.options[key] !== 'undefined') {
            optionValue = stage.options[key].toString()

          } else if (typeof stage.schema.options[key].default !== 'undefined') {
            optionValue = stage.schema.options[key].default.toString()

          } else {
            optionValue = ''
          }

          $scope.stageOptions.current[stage.id][key] = optionValue
          $scope.stageOptions.saved[stage.id][key] = optionValue
          $scope.stageOptions.metadata[stage.id][key] = {
            name: stage.schema.options[key].name,
            description: stage.schema.options[key].description
          }

        })

      })

    })

  $scope.saveOptions = function saveOptions(stageId) {

    // Save the options in the form to the cached "saved" values for comparison
    $scope.stageOptions.saved[stageId] = _.cloneDeep($scope.stageOptions.current[stageId])

    // Send the current values to the server
    $http.patch('/api/stage/' + stageId, {
      options: $scope.stageOptions.current[stageId]
    })

  }

  $scope.toggleOptions = function toggleOptions($event) {
    $($event.target).parent().parent().find('.panel-body').slideToggle(200)
  }

  // Delete Stage
  $scope.removeStage = (id) => {
    $http.delete('/api/stage/' + id)
    $state.go($state.$current, null, { reload: true })
  }

  $scope.deleteVar = (variable) => {

    // Confirm
    if (confirm('Are you sure you want to delete variable "' + variable.name + '"?')) {

      // Delete on server
      $http.delete('/api/pipelines/' + $stateParams.id + '/variables/' + variable.id)

      // Delete locally
      $scope.variables.splice( $scope.variables.indexOf(variable),1)

    }

  }

}]
