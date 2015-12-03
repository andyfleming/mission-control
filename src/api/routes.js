'use strict'

let express = require('express')
let middleware = {
  auth: require('./middleware/auth'),
  notFound: require('./middleware/not-found')
}
let controllers = {
  pipelines: require('./controllers/pipelines'),
  projects: require('./controllers/projects'),
  user: require('./controllers/user')
}

module.exports = function (app) {

  // Authentication Verification middleware
  app.use('/api/*', middleware.auth)

  // Authentication
  app.post('/login', controllers.user.login)
  app.all('/logout', controllers.user.logout)

  // User
  app.get('/api/user', controllers.user.getUser)

  // Projects
  app.get('/api/projects', controllers.projects.getProjects)
  app.post('/api/projects', controllers.projects.createProject)
  app.get('/api/projects-with-pipelines', controllers.projects.getProjectsWithPipelines)

  // Pipelines
  app.get('/api/pipelines', controllers.pipelines.getList)
  // TODO: POST /api/pipelines

  // Pipeline Stages
  // TODO: /api/pipelines

  // Pipeline Executions
  // TODO: GET /api/pipeline-executions
  // TODO: POST /api/pipeline-executions

  // Pipeline Stage Executions

  // Pipeline Execution Logs

  // Static files
  app.use(express.static('./ui-build/'))

  // 404
  app.use(middleware.notFound)

}
